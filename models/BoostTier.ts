import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IBoostTier extends Document {
  name: string;
  durationInDays: number;
  priceNGN: number;
  creditCost: number;
  createdAt: Date;
  updatedAt: Date;
}

const BoostTierSchema = new Schema<IBoostTier>(
  {
    name: { type: String, required: true },
    durationInDays: { type: Number, required: true },
    priceNGN: { type: Number, required: true },
    creditCost: { type: Number, required: true },
  },
  { timestamps: true }
);

const BoostTier: Model<IBoostTier> =
  mongoose.models?.BoostTier || mongoose.model('BoostTier', BoostTierSchema);
export default BoostTier;
