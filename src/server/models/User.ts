import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  bio?: string;
  neighborhood?: string;
  profession?: string;
  skills: string[];
  trustScore: number;
  completedFavors: number;
  avatarUrl?: string;
  location: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    bio: { type: String, default: '' },
    neighborhood: { type: String, default: 'Downtown Block' },
    profession: { type: String, default: 'Neighbor' },
    skills: [{ type: String, trim: true }],
    trustScore: { type: Number, default: 100 },
    completedFavors: { type: Number, default: 0 },
    avatarUrl: { type: String, default: '' },
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], default: [-122.4194, 37.7749] }, // Default San Francisco [lng, lat]
    },
  },
  { timestamps: true }
);

UserSchema.index({ location: '2dsphere' });

export default mongoose.model<IUser>('User', UserSchema);
