import Company from '../models/Company.js';
import PlacementDrive from '../models/PlacementDrive.js';
import { logAudit } from '../services/auditService.js';

// @desc    Get all companies with search, filters & pagination
// @route   GET /api/v1/companies
// @access  Private
export const getCompanies = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const query = {};

    if (req.query.industry) {
      query.industry = req.query.industry;
    }

    if (req.query.isActive !== undefined) {
      query.isActive = req.query.isActive === 'true';
    }

    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      query.$or = [
        { name: searchRegex },
        { industry: searchRegex },
        { hrContactName: searchRegex },
        { hrContactEmail: searchRegex },
        { location: searchRegex },
      ];
    }

    const total = await Company.countDocuments(query);
    const companies = await Company.find(query)
      .sort({ name: 1 })
      .skip(skip)
      .limit(limit);

    // Calculate drives count for each company
    const companyIds = companies.map((c) => c._id);
    const drivesCount = await PlacementDrive.aggregate([
      { $match: { company: { $in: companyIds } } },
      { $group: { _id: '$company', count: { $sum: 1 } } },
    ]);
    const driveMap = new Map();
    drivesCount.forEach((d) => driveMap.set(d._id.toString(), d.count));

    const enrichedCompanies = companies.map((company) => ({
      ...company.toObject(),
      drivesCount: driveMap.get(company._id.toString()) || 0,
    }));

    res.status(200).json({
      success: true,
      count: companies.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      companies: enrichedCompanies,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single company by ID with associated drives
// @route   GET /api/v1/companies/:id
// @access  Private
export const getCompanyById = async (req, res, next) => {
  try {
    const company = await Company.findById(req.params.id);

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found.',
      });
    }

    const drives = await PlacementDrive.find({ company: company._id }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      company,
      drives,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new company
// @route   POST /api/v1/companies
// @access  Private (Admin, TPO)
export const createCompany = async (req, res, next) => {
  try {
    const {
      name,
      industry,
      website = '',
      hrContactName,
      hrContactEmail,
      hrContactPhone = '',
      description = '',
      location = 'Pan India',
      logoUrl = '',
    } = req.body;

    const existing = await Company.findOne({
      name: { $regex: new RegExp(`^${name}$`, 'i') },
    });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: `Company '${name}' already exists.`,
      });
    }

    const company = await Company.create({
      name,
      industry,
      website,
      hrContactName,
      hrContactEmail,
      hrContactPhone,
      description,
      location,
      logoUrl,
    });

    await logAudit({
      action: 'COMPANY_CREATED',
      performedBy: req.user._id,
      role: req.user.role,
      targetModel: 'Company',
      targetId: company._id,
      details: { name, industry },
    });

    res.status(201).json({
      success: true,
      message: 'Company created successfully.',
      company,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update company
// @route   PATCH /api/v1/companies/:id
// @access  Private (Admin, TPO)
export const updateCompany = async (req, res, next) => {
  try {
    let company = await Company.findById(req.params.id);

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found.',
      });
    }

    company = await Company.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    await logAudit({
      action: 'COMPANY_UPDATED',
      performedBy: req.user._id,
      role: req.user.role,
      targetModel: 'Company',
      targetId: company._id,
    });

    res.status(200).json({
      success: true,
      message: 'Company updated successfully.',
      company,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Deactivate / Delete company
// @route   DELETE /api/v1/companies/:id
// @access  Private (Admin, TPO)
export const deleteCompany = async (req, res, next) => {
  try {
    const company = await Company.findById(req.params.id);

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found.',
      });
    }

    // Check if company has active drives
    const activeDrives = await PlacementDrive.countDocuments({
      company: company._id,
      status: { $in: ['Published', 'Draft'] },
    });

    if (activeDrives > 0) {
      // Soft deactivate instead of hard delete to preserve historical integrity
      company.isActive = false;
      await company.save();

      return res.status(200).json({
        success: true,
        message: `Company has ${activeDrives} active drive(s). It has been deactivated rather than deleted to preserve records.`,
        deactivated: true,
      });
    }

    await company.deleteOne();

    await logAudit({
      action: 'COMPANY_DELETED',
      performedBy: req.user._id,
      role: req.user.role,
      targetModel: 'Company',
      targetId: req.params.id,
      details: { name: company.name },
    });

    res.status(200).json({
      success: true,
      message: 'Company deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};
