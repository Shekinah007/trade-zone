import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISystemSettings extends Document {
  registrationCreditCost: number;
  unlimitedRegistrationPriceNGN: number;
  updatedAt: Date;
}

const SystemSettingsSchema = new Schema<ISystemSettings>(
  {
    registrationCreditCost: { type: Number, default: 10 },
    unlimitedRegistrationPriceNGN: { type: Number, default: 10000 },
  },
  { timestamps: true }
);

const SystemSettings: Model<ISystemSettings> =
  mongoose.models?.SystemSettings || mongoose.model('SystemSettings', SystemSettingsSchema);
export default SystemSettings;
