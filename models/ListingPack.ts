import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IListingPack extends Document {
  name: string;
  slotCount: number;
  priceNGN: number;
  creditCost: number;
  createdAt: Date;
  updatedAt: Date;
}

const ListingPackSchema = new Schema<IListingPack>(
  {
    name: { type: String, required: true },
    slotCount: { type: Number, required: true },
    priceNGN: { type: Number, required: true },
    creditCost: { type: Number, required: true },
  },
  { timestamps: true }
);

const ListingPack: Model<IListingPack> =
  mongoose.models?.ListingPack || mongoose.model('ListingPack', ListingPackSchema);
export default ListingPack;
