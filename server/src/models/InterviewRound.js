import mongoose from 'mongoose';

const interviewRoundSchema = new mongoose.Schema(
  {
    application: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Application',
      required: [true, 'Application reference is required'],
    },
    drive: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PlacementDrive',
      required: [true, 'Placement drive reference is required'],
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'StudentProfile',
      required: [true, 'Student reference is required'],
    },
    roundNumber: {
      type: Number,
      required: [true, 'Round number is required'],
      min: 1,
    },
    roundName: {
      type: String,
      required: [true, 'Round name is required'],
      trim: true,
      default: 'Technical Interview',
    },
    scheduledDate: {
      type: Date,
      required: [true, 'Scheduled date and time is required'],
    },
    venueOrLink: {
      type: String,
      trim: true,
      default: 'Placement Cell - Seminar Hall 1',
    },
    status: {
      type: String,
      enum: ['Scheduled', 'Completed', 'Cleared', 'Failed', 'Absent', 'Cancelled'],
      default: 'Scheduled',
    },
    feedback: {
      type: String,
      trim: true,
      default: '',
    },
    interviewerName: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

interviewRoundSchema.index({ application: 1, roundNumber: 1 });
interviewRoundSchema.index({ scheduledDate: 1 });

export default mongoose.model('InterviewRound', interviewRoundSchema);
