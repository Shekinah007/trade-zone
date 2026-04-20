import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IRechargeToken extends Document {
  code: string;
  tokenType: 'basic' | 'unlimited';
  value: number; // 10 for basic, -1 for unlimited
  status: 'active' | 'used' | 'expired' | 'revoked';
  generatedBy?: mongoose.Types.ObjectId;
  usedBy?: mongoose.Types.ObjectId;
  usedAt?: Date;
  expiresAt: Date;
  batchId?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const RechargeTokenSchema = new Schema<IRechargeToken>(
  {
    code: { type: String, required: true, unique: true, index: true },
    tokenType: { type: String, enum: ['basic', 'unlimited'], required: true },
    value: { type: Number, required: true },
    status: { 
      type: String, 
      enum: ['active', 'used', 'expired', 'revoked'], 
      default: 'active',
      index: true
    },
    generatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    usedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    usedAt: { type: Date },
    expiresAt: { type: Date, required: true },
    batchId: { type: String, index: true },
    notes: { type: String }
  },
  { timestamps: true }
);

const RechargeToken: Model<IRechargeToken> = mongoose.models?.RechargeToken || mongoose.model('RechargeToken', RechargeTokenSchema);
export default RechargeToken;
