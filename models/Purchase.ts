import mongoose, { Schema, Document, Model } from "mongoose";

export interface IPurchase extends Document {
  user: mongoose.Types.ObjectId;
  tier: mongoose.Types.ObjectId;
  tierModel: "ListingPack" | "BoostTier" | "FeaturedTier";
  type: "pack" | "boost" | "featured";
  item?: mongoose.Types.ObjectId;
  paymentMethod: "naira" | "token" | "credits" | "paystack";
  amountPaid: number;
  status: "pending" | "success" | "failed";
  reference?: string;
  startDate?: Date;
  endDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const PurchaseSchema = new Schema<IPurchase>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    tierModel: {
      type: String,
      enum: ["ListingPack", "BoostTier", "FeaturedTier"],
      default: "BoostTier",
    },
    tier: {
      type: Schema.Types.ObjectId,
      refPath: "tierModel",
      required: true,
    },
    type: { type: String, enum: ["pack", "boost", "featured"], required: true },
    item: { type: Schema.Types.ObjectId, ref: "Item" },
    paymentMethod: { type: String, enum: ["naira", "token"], required: true },
    amountPaid: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "success", "failed"],
      default: "pending",
    },
    reference: { type: String },
    startDate: { type: Date },
    endDate: { type: Date },
  },
  { timestamps: true },
);

const Purchase: Model<IPurchase> =
  mongoose.models?.Purchase || mongoose.model("Purchase", PurchaseSchema);
export default Purchase;
