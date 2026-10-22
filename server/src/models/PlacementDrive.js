import mongoose from 'mongoose';

const placementDriveSchema = new mongoose.Schema(
  {
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: [true, 'Company reference is required'],
    },
    jobTitle: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true,
    },
    jobDescription: {
      type: String,
      required: [true, 'Job description is required'],
    },
    jobType: {
      type: String,
      enum: ['Full-Time', 'Internship', 'Internship + PPO'],
      default: 'Full-Time',
    },
    jobLocation: {
      type: String,
      default: 'Pan India / Hybrid',
      trim: true,
    },
    salaryPackage: {
      type: Number, // in LPA, e.g. 7.5
      required: [true, 'Salary package (LPA) is required'],
      min: [0, 'Salary package cannot be negative'],
    },
    requiredSkills: {
      type: [String],
      default: [],
    },
    minCgpa: {
      type: Number,
      required: [true, 'Minimum CGPA is required'],
      min: [0, 'Min CGPA cannot be negative'],
      max: [10, 'Min CGPA cannot exceed 10.0'],
      default: 6.0,
    },
    maxBacklogs: {
      type: Number,
      required: [true, 'Maximum allowed backlogs is required'],
      min: [0, 'Allowed backlogs cannot be negative'],
      default: 0,
    },
    eligibleDepartments: {
      type: [String],
      required: [true, 'At least one eligible department must be specified'],
      validate: {
        validator: function (v) {
          return Array.isArray(v) && v.length > 0;
        },
        message: 'Must have at least one eligible department',
      },
    },
    graduationYears: {
      type: [Number],
      required: [true, 'At least one eligible graduation year must be specified'],
      validate: {
        validator: function (v) {
          return Array.isArray(v) && v.length > 0;
        },
        message: 'Must have at least one eligible graduation year',
      },
    },
    applicationOpenDate: {
      type: Date,
      default: Date.now,
    },
    applicationDeadline: {
      type: Date,
      required: [true, 'Application deadline is required'],
    },
    driveDate: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ['Draft', 'Published', 'Closed', 'Cancelled'],
      default: 'Draft',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for application count
placementDriveSchema.virtual('applicationsCount', {
  ref: 'Application',
  localField: '_id',
  foreignField: 'drive',
  count: true,
});

placementDriveSchema.index({ status: 1, applicationDeadline: 1 });
placementDriveSchema.index({ company: 1 });

export default mongoose.model('PlacementDrive', placementDriveSchema);
