import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  bio?: string;
  neighborhood?: string;
  profession?: string;
  age?: number;
  gender?: string;
  profileCompleted: boolean;
  blockedUsers: mongoose.Types.ObjectId[];
  skills: string[];
  trustScore: number;
  completedFavors: number;
  credits: number;
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
    age: { type: Number },
    gender: { type: String, default: '' },
    profileCompleted: { type: Boolean, default: false },
    blockedUsers: [{ type: Schema.Types.ObjectId, ref: 'User', default: [] }],
    skills: [{ type: String, trim: true }],
    trustScore: { type: Number, default: 100 },
    completedFavors: { type: Number, default: 0 },
    credits: { type: Number, default: 40 },
    avatarUrl: { type: String, default: '' },
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], default: [-122.4194, 37.7749] }, // Default [lng, lat]
    },
  },
  { timestamps: true }
);

UserSchema.index({ location: '2dsphere' });

export default mongoose.model<IUser>('User', UserSchema);
