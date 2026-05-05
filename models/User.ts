import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  image?: string;
  phone?: string;
  role: 'buyer' | 'seller' | 'admin';
  provider: 'credentials' | 'google' | 'facebook';
  createdAt: Date;
  updatedAt: Date;
  status: 'pending' | 'active' | 'suspended' | 'banned';
  registrationLimit: number;
  unlimitedRegistrations: boolean;
  tokensUsed?: {
    tokenId: mongoose.Types.ObjectId;
    usedAt: Date;
    tokenType: string;
    value: number;
  }[];
  totalTokensRedeemed: number;
  creditBalance: number;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, select: false },
    image: { type: String },
    phone: { type: String },
    role: {
      type: String,
      enum: ['buyer', 'seller', 'admin'],
      default: 'buyer',
    },
    provider: { type: String, default: 'credentials' },
    status: {type: String, enum: ['pending', 'active', 'suspended', 'banned'], default: 'pending' },
    registrationLimit: { type: Number, default: 1 },
    unlimitedRegistrations: { type: Boolean, default: false },
    tokensUsed: [{
      tokenId: { type: Schema.Types.ObjectId, ref: 'RechargeToken' },
      usedAt: { type: Date },
      tokenType: { type: String },
      value: { type: Number }
    }],
    totalTokensRedeemed: { type: Number, default: 0 },
    creditBalance: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const User: Model<IUser> = mongoose.models?.User || mongoose.model('User', UserSchema);
export default User;
