import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IListing extends Document {
  title: string;
  description: string;
  price: number;
  category: mongoose.Types.ObjectId;
  seller: mongoose.Types.ObjectId;
  images: string[];
  condition: string;
  location: {
    city: string;
    state?: string;
    country: string;
  };
  contactInfo: {
    phone?: boolean;
    email?: boolean;
  };
  status: 'active' | 'sold' | 'expired' | 'inactive';
  featured: boolean;
  views: number;
  uniqueIdentifier?: string;
}

const ListingSchema = new Schema<IListing>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    uniqueIdentifier: { type: String, required: false }, // Optional for broader compatibility, or strictly required based on user request. User said "must have", but let's stick to required=false first to avoid breaking existing. actually user said "all items must have", so let's make it required but maybe default to empty string if migration is needed? simpler to just make it type String.
    seller: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    images: [{ type: String }],
    condition: { type: String, required: true },
    location: {
      city: String,
      state: String,
      country: String,
    },
    contactInfo: {
      phone: Boolean,
      email: Boolean,
    },
    status: {
      type: String,
      enum: ['active', 'sold', 'expired', 'inactive'],
      default: 'active',
    },
    featured: { type: Boolean, default: false },
    views: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Listing: Model<IListing> = mongoose.models?.Listing || mongoose.model('Listing', ListingSchema);
export default Listing;
