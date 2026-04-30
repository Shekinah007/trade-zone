import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ITransaction extends Document {
  buyer: mongoose.Types.ObjectId;
  seller: mongoose.Types.ObjectId;
  item: mongoose.Types.ObjectId;
  price: number;
  status: 'pending' | 'seller_confirmed' | 'buyer_confirmed' | 'fully_confirmed' | 'cancelled';
  transferRequestId?: mongoose.Types.ObjectId;
  createdAt: Date;
}

const TransactionSchema = new Schema<ITransaction>(
  {
    buyer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    seller: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    item: { type: Schema.Types.ObjectId, ref: 'Item', required: true },
    price: { type: Number, required: true },
    status: {
      type: String,
      enum: ['pending', 'seller_confirmed', 'buyer_confirmed', 'fully_confirmed', 'cancelled'],
      default: 'pending', // Changed default from 'completed' for handshake
    },
    transferRequestId: { type: Schema.Types.ObjectId, ref: 'TransferRequest' },
  },
  { timestamps: true }
);

const Transaction: Model<ITransaction> = mongoose.models?.Transaction || mongoose.model('Transaction', TransactionSchema);
export default Transaction;
