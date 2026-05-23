import mongoose, { Schema, Document, Model } from "mongoose";

export interface IPurchase extends Document {
  user: mongoose.Types.ObjectId;
  tier?: mongoose.Types.ObjectId;
  tierModel?: "ListingPack" | "BoostTier" | "FeaturedTier";
  type: "pack" | "boost" | "featured" | "registration";
  item?: mongoose.Types.ObjectId;
  paymentMethod: "naira" | "token" | "credits" | "paystack" | "credit";
  amountPaid: number;
  status: "pending" | "success" | "failed";
  reference?: string;
  startDate?: Date;
  endDate?: Date;
  /** Type-specific details stored at purchase time */
  metadata?: {
    slotCount?: number;    // pack: listing slots granted
    packName?: string;     // pack: name of the listing pack
    quantity?: number;     // registration: quota slots granted
    tierName?: string;     // boost/featured: tier name snapshot
    durationInDays?: number; // boost/featured: duration snapshot
  };
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
    },
    type: {
      type: String,
      enum: ["pack", "boost", "featured", "registration"],
      required: true,
    },
    item: { type: Schema.Types.ObjectId, ref: "Item" },
    paymentMethod: {
      type: String,
      enum: ["naira", "token", "credit", "paystack", "credits"],
      required: true,
    },
    amountPaid: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "success", "failed"],
      default: "pending",
    },
    reference: { type: String },
    startDate: { type: Date },
    endDate: { type: Date },
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true },
);

const Purchase: Model<IPurchase> =
  mongoose.models?.Purchase || mongoose.model("Purchase", PurchaseSchema);
export default Purchase;
