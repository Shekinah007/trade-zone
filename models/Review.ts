import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IReview extends Document {
  reviewer: mongoose.Types.ObjectId;
  reviewee: mongoose.Types.ObjectId;
  item: mongoose.Types.ObjectId;
  rating: number;
  comment: string;
  response?: string;
}

const ReviewSchema = new Schema<IReview>(
  {
    reviewer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    reviewee: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    item: { type: Schema.Types.ObjectId, ref: 'Item', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
    response: String,
  },
  { timestamps: true }
);

const Review: Model<IReview> = mongoose.models?.Review || mongoose.model('Review', ReviewSchema);
export default Review;
