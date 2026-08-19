import mongoose, { Schema, Document } from 'mongoose';

export interface IGroup extends Document {
  name: string;
  description: string;
  category: string;
  creator: mongoose.Types.ObjectId;
  members: mongoose.Types.ObjectId[];
  avatarUrl?: string;
  icon?: string;
  privacy: 'Public' | 'Approval Required';
  isPrivate?: boolean;
  neighborhood: string;
  location?: {
    type: 'Point';
    coordinates: [number, number]; // [lng, lat]
  };
  createdAt: Date;
  updatedAt: Date;
}

const GroupSchema: Schema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    category: { type: String, default: 'General Help' },
    creator: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    members: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    avatarUrl: { type: String, default: '' },
    icon: { type: String, default: 'gardening' },
    privacy: {
      type: String,
      enum: ['Public', 'Approval Required'],
      default: 'Public',
    },
    isPrivate: { type: Boolean, default: false },
    neighborhood: { type: String, default: 'Local Neighborhood' },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [lng, lat]
        default: [77.6408, 12.9784],
      },
    },
  },
  { timestamps: true }
);

GroupSchema.index({ location: '2dsphere' });

export default mongoose.model<IGroup>('Group', GroupSchema);
