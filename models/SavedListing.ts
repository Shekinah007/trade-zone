import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISavedListing extends Document {
  user: mongoose.Types.ObjectId;
  listing: mongoose.Types.ObjectId;
  createdAt: Date;
}

const SavedListingSchema = new Schema<ISavedListing>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    listing: { type: Schema.Types.ObjectId, ref: 'Listing', required: true },
  },
  { timestamps: true }
);

// Prevent duplicate saves
SavedListingSchema.index({ user: 1, listing: 1 }, { unique: true });

const SavedListing: Model<ISavedListing> =
  mongoose.models?.SavedListing || mongoose.model('SavedListing', SavedListingSchema);
export default SavedListing;