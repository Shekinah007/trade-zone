import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ITransferRecord {
  fromUser: mongoose.Types.ObjectId;
  toUser: mongoose.Types.ObjectId;
  dateSold?: Date;
  salePrice?: number;
  location?: string;
  notes?: string;
  transferredAt: Date;
}

export interface IProperty {
  owner: mongoose.Types.ObjectId;
  itemType:
    | 'phone'
    | 'laptop'
    | 'tablet'
    | 'vehicle'
    | 'motorcycle'
    | 'generator'
    | 'electronics'
    | 'other';
  brand: string;
  model: string;
  description?: string;
  serialNumber?: string;
  imei?: string;
  chassisNumber?: string;
  color?: string;
  yearOfPurchase?: number;
  images: string[];
  status: 'registered' | 'missing' | 'found' | 'transferred';
  previousOwners: ITransferRecord[];
  reportedMissingAt?: Date;
  reportedFoundAt?: Date;
  registeredAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const TransferRecordSchema = new Schema<ITransferRecord>(
  {
    fromUser: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    toUser: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    dateSold: { type: Date },
    salePrice: { type: Number },
    location: { type: String },
    notes: { type: String },
    transferredAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const PropertySchema = new Schema<IProperty>(
  {
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    itemType: {
      type: String,
      enum: [
        'phone',
        'laptop',
        'tablet',
        'vehicle',
        'motorcycle',
        'generator',
        'electronics',
        'other',
      ],
      required: true,
    },
    brand: { type: String, required: true },
    model: { type: String, required: true },
    description: { type: String },
    serialNumber: { type: String, sparse: true },
    imei: { type: String, sparse: true },
    chassisNumber: { type: String, sparse: true },
    color: { type: String },
    yearOfPurchase: { type: Number },
    images: [{ type: String }],
    status: {
      type: String,
      enum: ['registered', 'missing', 'found', 'transferred'],
      default: 'registered',
    },
    previousOwners: [TransferRecordSchema],
    reportedMissingAt: { type: Date },
    reportedFoundAt: { type: Date },
    registeredAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Index for fast lookup by identifiers
PropertySchema.index({ serialNumber: 1 });
PropertySchema.index({ imei: 1 });
PropertySchema.index({ chassisNumber: 1 });
PropertySchema.index({ owner: 1 });

const Property: Model<IProperty> =
  mongoose.models?.Property ||
  mongoose.model('Property', PropertySchema);

export default Property;
