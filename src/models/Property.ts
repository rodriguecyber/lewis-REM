import mongoose, { Schema } from 'mongoose';
import { IProperty, PropertyType, PropertyStatus } from '../types';

const propertySchema = new Schema<IProperty>(
  {
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Please provide a title'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please provide a description'],
    },
    type: {
      type: String,
      enum: Object.values(PropertyType),
      required: [true, 'Please provide a property type'],
    },
    status: {
      type: String,
      enum: Object.values(PropertyStatus),
      default: PropertyStatus.AVAILABLE,
    },
    price: {
      type: Number,
      required: [true, 'Please provide a price'],
      min: [0, 'Price must be positive'],
    },
    location: {
      address: {
        type: String,
        required: [true, 'Please provide an address'],
      },
      city: {
        type: String,
        required: [true, 'Please provide a city'],
      },
      state: {
        type: String,
        required: [true, 'Please provide a state'],
      },
      zipCode: {
        type: String,
        required: [true, 'Please provide a zip code'],
      },
      country: {
        type: String,
        required: [true, 'Please provide a country'],
        default: 'Ghana',
      },
    },
    images: {
      type: [String],
      default: [],
    },
    features: {
      type: Schema.Types.Mixed,
      default: {},
    },
    bids: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Bid',
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Index for search
propertySchema.index({ title: 'text', description: 'text' });
propertySchema.index({ 'location.city': 1, 'location.state': 1 });
propertySchema.index({ type: 1, status: 1 });

export default mongoose.model<IProperty>('Property', propertySchema);

