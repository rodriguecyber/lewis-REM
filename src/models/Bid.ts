import mongoose, { Schema } from 'mongoose';
import { IBid } from '../types';

const bidSchema = new Schema<IBid>(
  {
    property: {
      type: Schema.Types.ObjectId,
      ref: 'Property',
      required: true,
    },
    bidder: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    amount: {
      type: Number,
      required: [true, 'Please provide a bid amount'],
      min: [0, 'Bid amount must be positive'],
    },
    message: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
bidSchema.index({ property: 1, bidder: 1 });
bidSchema.index({ status: 1 });

export default mongoose.model<IBid>('Bid', bidSchema);

