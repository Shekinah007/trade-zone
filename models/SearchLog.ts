import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ISearchLog extends Document {
  query: string;
  propertyId: Types.ObjectId;
  ipAddress: string;
  location?: {
    lat: number;
    lng: number;
  };
  user?: Types.ObjectId;
  createdAt: Date;
}

const searchLogSchema = new Schema<ISearchLog>(
  {
    query: { type: String, required: true },
    propertyId: { type: Schema.Types.ObjectId, ref: 'Property' },
    ipAddress: { type: String, required: true },
    location: {
      lat: { type: Number },
      lng: { type: Number },
    },
    user: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

export default mongoose.models.SearchLog || mongoose.model<ISearchLog>('SearchLog', searchLogSchema);
