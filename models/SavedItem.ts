import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISavedItem extends Document {
  user: mongoose.Types.ObjectId;
  item: mongoose.Types.ObjectId;
  createdAt: Date;
}

const SavedItemSchema = new Schema<ISavedItem>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    item: { type: Schema.Types.ObjectId, ref: 'Item', required: true },
  },
  { timestamps: true }
);

// Prevent duplicate saves
SavedItemSchema.index({ user: 1, item: 1 }, { unique: true });

const SavedItem: Model<ISavedItem> =
  mongoose.models?.SavedItem || mongoose.model('SavedItem', SavedItemSchema);
export default SavedItem;