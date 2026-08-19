import mongoose, { Schema, Document } from 'mongoose';

export interface IFavorRequest extends Document {
  title: string;
  description: string;
  category: string;
  urgency: 'Low' | 'Medium' | 'High' | 'Emergency';
  tags: string[];
  status: 'Open' | 'In Progress' | 'Completed' | 'Cancelled';
  requester: mongoose.Types.ObjectId;
  helper?: mongoose.Types.ObjectId;
  creditsAwarded: boolean;
  completedAt?: Date;
  summary?: string;
  isFlaggedSpam?: boolean;
  fraudReason?: string;
  locationName?: string;
  location: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
  createdAt: Date;
  updatedAt: Date;
}

const FavorRequestSchema: Schema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    category: { type: String, required: true, default: 'General Help' },
    urgency: { type: String, enum: ['Low', 'Medium', 'High', 'Emergency'], default: 'Medium' },
    tags: [{ type: String, trim: true }],
    status: { type: String, enum: ['Open', 'In Progress', 'Completed', 'Cancelled'], default: 'Open' },
    requester: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    helper: { type: Schema.Types.ObjectId, ref: 'User' },
    creditsAwarded: { type: Boolean, default: false },
    completedAt: { type: Date },
    summary: { type: String, default: '' },
    isFlaggedSpam: { type: Boolean, default: false },
    fraudReason: { type: String, default: '' },
    locationName: { type: String, default: 'Neighborhood Block' },
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], required: true }, // [lng, lat]
    },
  },
  { timestamps: true }
);

FavorRequestSchema.index({ location: '2dsphere' });

export default mongoose.model<IFavorRequest>('FavorRequest', FavorRequestSchema);
