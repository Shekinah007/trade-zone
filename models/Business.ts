import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IBusiness extends Document {
  owner: mongoose.Types.ObjectId;
  name: string;
  address?: string;
  type?: string;
  image?: string;
  description?: string;
  phone?: string;
  categories: string[];
  socials: { name: string; link: string }[];
  bankDetails: { name: string; account: string }[];
  certifications: string[];
  qrCode?: string;
  email?: string;
  businessHours?: string;
  createdAt: Date;
  updatedAt: Date;
}

const BusinessSchema = new Schema<IBusiness>(
  {
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    address: { type: String },
    type: { type: String },
    image: { type: String },
    description: { type: String },
    phone: { type: String },
    categories: { type: [String], default: [] },
    socials: [
      {
        name: String,
        link: String,
      },
    ],
    bankDetails: [
      {
        name: String,
        account: String,
      },
    ],
    certifications: { type: [String], default: [] },
    qrCode: { type: String },
    email: { type: String },
    businessHours: { type: String },
  },
  { timestamps: true }
);

const Business: Model<IBusiness> = mongoose.models?.Business || mongoose.model('Business', BusinessSchema);
export default Business;
