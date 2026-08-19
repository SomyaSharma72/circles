import mongoose, { Schema, Document } from 'mongoose';

export interface IRewardRedemption extends Document {
  userId: mongoose.Types.ObjectId;
  offerId: string;
  offerTitle: string;
  offerBrand: string;
  discount: string;
  creditsSpent: number;
  redemptionCode: string;
  createdAt: Date;
}

const RewardRedemptionSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    offerId: { type: String, required: true },
    offerTitle: { type: String, required: true },
    offerBrand: { type: String, required: true },
    discount: { type: String, required: true },
    creditsSpent: { type: Number, required: true },
    redemptionCode: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model<IRewardRedemption>('RewardRedemption', RewardRedemptionSchema);
