import mongoose from 'mongoose';

const platformComplaintSchema = new mongoose.Schema(
  {
    referenceNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    customerName: {
      type: String,
      trim: true,
      default: 'Anonymous',
    },
    customerPhone: {
      type: String,
      trim: true,
      default: '',
    },
    category: {
      type: String,
      trim: true,
      required: [true, 'Category is required'],
      default: 'General Platform',
    },
    message: {
      type: String,
      required: [true, 'Complaint message is required'],
      maxlength: [200, 'Message cannot exceed 200 characters'],
      trim: true,
    },
    suggestedSolution: {
      type: String,
      maxlength: [200, 'Suggested solution cannot exceed 200 characters'],
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: ['NEW', 'UNDER_REVIEW', 'RESOLVED', 'CLOSED'],
      default: 'NEW',
      index: true,
    },
    adminNotes: {
      type: String,
      trim: true,
      default: '',
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

platformComplaintSchema.index({ createdAt: -1 });

export const PlatformComplaint = mongoose.model('PlatformComplaint', platformComplaintSchema);
