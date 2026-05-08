import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IFeaturedWaitlist extends Document {
  user: mongoose.Types.ObjectId;
  item: mongoose.Types.ObjectId;
  tier: mongoose.Types.ObjectId;
  status: 'waiting' | 'notified' | 'expired' | 'fulfilled';
  notifiedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const FeaturedWaitlistSchema = new Schema<IFeaturedWaitlist>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    item: { type: Schema.Types.ObjectId, ref: 'Item', required: true },
    tier: { type: Schema.Types.ObjectId, ref: 'FeaturedTier', required: true },
    status: {
      type: String,
      enum: ['waiting', 'notified', 'expired', 'fulfilled'],
      default: 'waiting',
    },
    notifiedAt: { type: Date },
  },
  { timestamps: true }
);

const FeaturedWaitlist: Model<IFeaturedWaitlist> =
  mongoose.models?.FeaturedWaitlist || mongoose.model('FeaturedWaitlist', FeaturedWaitlistSchema);
export default FeaturedWaitlist;
