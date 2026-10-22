import mongoose from 'mongoose';

const companySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Company name is required'],
      unique: true,
      trim: true,
      maxlength: [120, 'Company name cannot exceed 120 characters'],
    },
    industry: {
      type: String,
      required: [true, 'Industry type is required (e.g. Information Technology, FinTech, Consulting)'],
      trim: true,
    },
    website: {
      type: String,
      trim: true,
      default: '',
    },
    hrContactName: {
      type: String,
      required: [true, 'HR contact name is required'],
      trim: true,
    },
    hrContactEmail: {
      type: String,
      required: [true, 'HR contact email is required'],
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid HR contact email',
      ],
    },
    hrContactPhone: {
      type: String,
      trim: true,
      default: '',
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    location: {
      type: String,
      trim: true,
      default: 'Multiple Locations',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    logoUrl: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

companySchema.index({ name: 'text', industry: 'text' });

export default mongoose.model('Company', companySchema);
