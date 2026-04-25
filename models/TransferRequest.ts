import mongoose, { Schema, Document, Model } from "mongoose";

export interface ITransferRequest {
  propertyId: mongoose.Types.ObjectId;
  listingId?: mongoose.Types.ObjectId;
  initiator: mongoose.Types.ObjectId;
  targetEmail: string;
  targetUserId?: mongoose.Types.ObjectId;
  salePrice?: number;
  status: "pending" | "accepted" | "cancelled";
  token: string;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const TransferRequestSchema = new Schema<ITransferRequest>(
  {
    propertyId: { type: Schema.Types.ObjectId, ref: "Property", required: true },
    listingId: { type: Schema.Types.ObjectId, ref: "Listing" },
    initiator: { type: Schema.Types.ObjectId, ref: "User", required: true },
    targetEmail: { type: String, required: true },
    targetUserId: { type: Schema.Types.ObjectId, ref: "User" },
    salePrice: { type: Number },
    status: {
      type: String,
      enum: ["pending", "accepted", "cancelled"],
      default: "pending",
    },
    token: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

// Optional indexes for quick lookup
// TransferRequestSchema.index({ token: 1 });
// TransferRequestSchema.index({ targetEmail: 1 });

const TransferRequest: Model<ITransferRequest> =
  mongoose.models?.TransferRequest ||
  mongoose.model("TransferRequest", TransferRequestSchema);

export default TransferRequest;
