import mongoose, { Schema, Document } from 'mongoose';

export interface IGroupMessage extends Document {
  group: mongoose.Types.ObjectId;
  sender: mongoose.Types.ObjectId;
  text: string;
  createdAt: Date;
  updatedAt: Date;
}

const GroupMessageSchema: Schema = new Schema(
  {
    group: { type: Schema.Types.ObjectId, ref: 'Group', required: true },
    sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

GroupMessageSchema.index({ group: 1, createdAt: 1 });

export default mongoose.model<IGroupMessage>('GroupMessage', GroupMessageSchema);
