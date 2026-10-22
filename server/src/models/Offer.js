import mongoose from 'mongoose';

const offerSchema = new mongoose.Schema(
  {
    application: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Application',
      required: [true, 'Application reference is required'],
      unique: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'StudentProfile',
      required: [true, 'Student profile reference is required'],
    },
    drive: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PlacementDrive',
      required: [true, 'Placement drive reference is required'],
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: [true, 'Company reference is required'],
    },
    jobRole: {
      type: String,
      required: [true, 'Job role is required'],
      trim: true,
    },
    packageLpa: {
      type: Number,
      required: [true, 'Package (LPA) is required'],
      min: [0, 'Package cannot be negative'],
    },
    offerLetterUrl: {
      type: String,
      trim: true,
      default: '',
    },
    issueDate: {
      type: Date,
      default: Date.now,
    },
    responseDeadline: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ['Offered', 'Accepted', 'Declined', 'Pending'],
      default: 'Pending',
    },
    respondedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

offerSchema.index({ student: 1 });
offerSchema.index({ company: 1 });
offerSchema.index({ status: 1 });

export default mongoose.model('Offer', offerSchema);
