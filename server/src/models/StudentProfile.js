import mongoose from 'mongoose';

const studentProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    prn: {
      type: String,
      required: [true, 'Student PRN / Roll Number is required'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    department: {
      type: String,
      required: [true, 'Academic department is required'],
      trim: true,
    },
    academicYear: {
      type: String,
      required: [true, 'Academic year is required (e.g., Final Year)'],
      trim: true,
      default: 'Final Year',
    },
    graduationYear: {
      type: Number,
      required: [true, 'Graduation year is required (e.g., 2025)'],
      min: [2020, 'Invalid graduation year'],
      max: [2035, 'Invalid graduation year'],
    },
    cgpa: {
      type: Number,
      required: [true, 'CGPA is required'],
      min: [0, 'CGPA cannot be negative'],
      max: [10, 'CGPA cannot exceed 10.0'],
    },
    activeBacklogs: {
      type: Number,
      required: [true, 'Active backlogs count is required'],
      min: [0, 'Backlogs cannot be negative'],
      default: 0,
    },
    totalBacklogs: {
      type: Number,
      min: [0, 'Total backlogs cannot be negative'],
      default: 0,
    },
    skills: {
      type: [String],
      default: [],
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    resumeUrl: {
      type: String,
      trim: true,
      default: '',
    },
    linkedinUrl: {
      type: String,
      trim: true,
      default: '',
    },
    githubUrl: {
      type: String,
      trim: true,
      default: '',
    },
    isPlaced: {
      type: Boolean,
      default: false,
    },
    placedCompany: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      default: null,
    },
    placedPackage: {
      type: Number, // in LPA
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for fast searching and filtering
studentProfileSchema.index({ department: 1, cgpa: -1 });
studentProfileSchema.index({ graduationYear: 1 });
studentProfileSchema.index({ isPlaced: 1 });

export default mongoose.model('StudentProfile', studentProfileSchema);
