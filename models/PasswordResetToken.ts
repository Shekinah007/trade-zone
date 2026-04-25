import mongoose, { Schema, Document, Model } from "mongoose";

export interface IPasswordResetToken extends Document {
  email: string;
  token: string;
  expiresAt: Date;
}

const PasswordResetTokenSchema = new Schema<IPasswordResetToken>(
  {
    email: { type: String, required: true },
    token: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

const PasswordResetToken: Model<IPasswordResetToken> =
  mongoose.models?.PasswordResetToken || mongoose.model("PasswordResetToken", PasswordResetTokenSchema);
export default PasswordResetToken;
