import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IFeaturedTier extends Document {
  name: string;
  durationInDays: number;
  priceNGN: number;
  creditCost: number;
  createdAt: Date;
  updatedAt: Date;
}

const FeaturedTierSchema = new Schema<IFeaturedTier>(
  {
    name: { type: String, required: true },
    durationInDays: { type: Number, required: true },
    priceNGN: { type: Number, required: true },
    creditCost: { type: Number, required: true },
  },
  { timestamps: true }
);

const FeaturedTier: Model<IFeaturedTier> =
  mongoose.models?.FeaturedTier || mongoose.model('FeaturedTier', FeaturedTierSchema);
export default FeaturedTier;
