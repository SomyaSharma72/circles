import mongoose, { Schema, Document } from 'mongoose';

export interface IRewardOffer extends Document {
  title: string;
  description: string;
  brand: string;
  category: string;
  creditsRequired: number;
  discount: string;
  icon: string;
  isActive: boolean;
  createdAt: Date;
}

const RewardOfferSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    brand: { type: String, required: true },
    category: { type: String, required: true, default: 'General' },
    creditsRequired: { type: Number, required: true },
    discount: { type: String, required: true },
    icon: { type: String, default: 'coffee' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model<IRewardOffer>('RewardOffer', RewardOfferSchema);
