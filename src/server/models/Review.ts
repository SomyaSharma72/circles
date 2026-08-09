import mongoose, { Schema, Document } from 'mongoose';

export interface IReview extends Document {
  request: mongoose.Types.ObjectId;
  reviewer: mongoose.Types.ObjectId;
  reviewee: mongoose.Types.ObjectId;
  rating: number; // 1 to 5
  comment: string;
  createdAt: Date;
}

const ReviewSchema: Schema = new Schema(
  {
    request: { type: Schema.Types.ObjectId, ref: 'FavorRequest', required: true },
    reviewer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    reviewee: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

export default mongoose.model<IReview>('Review', ReviewSchema);
