import mongoose, { Schema, Document } from 'mongoose';

export interface ICreditTransaction extends Document {
  userId: mongoose.Types.ObjectId;
  amount: number;
  type: 'earned' | 'spent';
  reason: string;
  requestId?: mongoose.Types.ObjectId;
  createdAt: Date;
}

const CreditTransactionSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    amount: { type: Number, required: true },
    type: { type: String, enum: ['earned', 'spent'], required: true },
    reason: { type: String, required: true },
    requestId: { type: Schema.Types.ObjectId, ref: 'FavorRequest' },
  },
  { timestamps: true }
);

export default mongoose.model<ICreditTransaction>('CreditTransaction', CreditTransactionSchema);
