import mongoose, { Schema, Document, Model } from "mongoose";

export interface IPurchase extends Document {
  user: mongoose.Types.ObjectId;
  tier: mongoose.Types.ObjectId;
  type: "pack" | "boost" | "featured";
  item?: mongoose.Types.ObjectId;
  paymentMethod: "naira" | "token";
  amountPaid: number;
  status: "pending" | "success" | "failed";
  reference?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PurchaseSchema = new Schema<IPurchase>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    tier: {
      type: Schema.Types.ObjectId,
      ref: "MonetizationTier",
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
  },
  { timestamps: true },
);

const Purchase: Model<IPurchase> =
  mongoose.models?.Purchase || mongoose.model("Purchase", PurchaseSchema);
export default Purchase;
