import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ITransferRequest extends Document {
  propertyId: mongoose.Types.ObjectId;
  listingId?: mongoose.Types.ObjectId;
  fromUser: mongoose.Types.ObjectId;
  toUser?: mongoose.Types.ObjectId;
  receiverEmail: string;
  status: 'pending' | 'accepted' | 'declined' | 'cancelled';
  token?: string;
  salePrice?: number;
  notes?: string;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const TransferRequestSchema = new Schema<ITransferRequest>(
  {
    propertyId: { type: Schema.Types.ObjectId, ref: 'Property', required: true },
    listingId: { type: Schema.Types.ObjectId, ref: 'Listing' },
    fromUser: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    toUser: { type: Schema.Types.ObjectId, ref: 'User' },
    receiverEmail: { type: String, required: true },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'declined', 'cancelled'],
      default: 'pending',
    },
    token: { type: String },
    salePrice: { type: Number },
    notes: { type: String },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

// Indexes
TransferRequestSchema.index({ propertyId: 1 });
TransferRequestSchema.index({ fromUser: 1 });
TransferRequestSchema.index({ toUser: 1 });
TransferRequestSchema.index({ token: 1 });

const TransferRequest: Model<ITransferRequest> =
  mongoose.models?.TransferRequest ||
  mongoose.model('TransferRequest', TransferRequestSchema);

export default TransferRequest;
