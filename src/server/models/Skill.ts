import mongoose, { Schema, Document } from 'mongoose';

export interface ISkill extends Document {
  name: string;
  category: string;
  description?: string;
  createdBy?: mongoose.Types.ObjectId;
}

const SkillSchema: Schema = new Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    category: { type: String, default: 'General' },
    description: { type: String, default: '' },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export default mongoose.model<ISkill>('Skill', SkillSchema);
