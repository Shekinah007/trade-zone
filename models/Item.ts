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

export interface IItem {
  // Core identity
  owner: mongoose.Types.ObjectId;
  brand: string;
  model: string;
  description?: string;
  color?: string;
  images: string[];
  uniqueIdentifier?: string;

  // Registry namespace
  isRegistered: boolean;
  registeredAt?: Date;
  itemType?: 'phone' | 'laptop' | 'tablet' | 'vehicle' | 'motorcycle' | 'generator' | 'electronics' | 'other';
  registry?: {
    serialNumber?: string;
    imei?: string;
    chassisNumber?: string;
    yearOfPurchase?: number;
    color?: string;
  };
  ownershipStatus?: 'owned' | 'missing' | 'found' | 'transferred' | 'transfer_pending';
  previousOwners?: ITransferRecord[];
  reportedMissingAt?: Date;
  reportedFoundAt?: Date;

  // Marketplace namespace
  isListed: boolean;
  seller?: mongoose.Types.ObjectId;
  listing?: {
    title?: string;
    price?: number;
    category?: mongoose.Types.ObjectId;
    condition?: string;
    location?: {
      city: string;
      state?: string;
      country: string;
    };
    contactInfo?: {
      phone?: boolean;
      email?: boolean;
    };
    status?: 'active' | 'sold' | 'expired' | 'inactive';
    featured?: boolean;
    views?: number;
    buyerId?: mongoose.Types.ObjectId;
    listedAt?: Date;
    expiresAt?: Date;
    boostStatus?: 'none' | 'active';
    boostExpiry?: Date;
    boostedAt?: Date;
    boostQueue?: Array<{ durationInDays: number; purchasedAt: Date }>;
    isGrandfathered?: boolean;
  };

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

const ItemSchema = new Schema<IItem>(
  {
    // Core identity
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    brand: { type: String, required: true },
    model: { type: String, required: true },
    description: { type: String },
    color: { type: String },
    images: [{ type: String }],
    uniqueIdentifier: { type: String },

    // Registry namespace
    isRegistered: { type: Boolean, default: false },
    registeredAt: { type: Date },
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
    },
    registry: {
      serialNumber: { type: String },
      imei: { type: String },
      chassisNumber: { type: String },
      yearOfPurchase: { type: Number },
      color: { type: String },
    },
    ownershipStatus: {
      type: String,
      enum: ['owned', 'missing', 'found', 'transferred', 'transfer_pending'],
    },
    previousOwners: [TransferRecordSchema],
    reportedMissingAt: { type: Date },
    reportedFoundAt: { type: Date },

    // Marketplace namespace
    isListed: { type: Boolean, default: false },
    seller: { type: Schema.Types.ObjectId, ref: 'User' },
    listing: {
      title: { type: String },
      price: { type: Number },
      category: { type: Schema.Types.ObjectId, ref: 'Category' },
      condition: { type: String },
      location: {
        city: String,
        state: String,
        country: String,
      },
      contactInfo: {
        phone: Boolean,
        email: Boolean,
      },
      status: {
        type: String,
        enum: ['active', 'sold', 'expired', 'inactive'],
      },
      featured: { type: Boolean, default: false },
      views: { type: Number, default: 0 },
      buyerId: { type: Schema.Types.ObjectId, ref: 'User' },
      listedAt: { type: Date },
      expiresAt: { type: Date },
      boostStatus: { type: String, enum: ['none', 'active'], default: 'none' },
      boostExpiry: { type: Date },
      boostedAt: { type: Date },
      boostQueue: [{ durationInDays: Number, purchasedAt: Date }],
      isGrandfathered: { type: Boolean, default: true },
    },
  },
  { timestamps: true }
);

// Indexes
ItemSchema.index({ isListed: 1, 'listing.status': 1 });
ItemSchema.index({ isRegistered: 1, ownershipStatus: 1 });
ItemSchema.index({ 'registry.serialNumber': 1 }, { sparse: true });
ItemSchema.index({ 'registry.imei': 1 }, { sparse: true });
ItemSchema.index({ 'registry.chassisNumber': 1 }, { sparse: true });
ItemSchema.index({ uniqueIdentifier: 1 }, { sparse: true });
ItemSchema.index({ owner: 1 });
ItemSchema.index({ seller: 1 });

const Item: Model<IItem> = mongoose.models?.Item || mongoose.model('Item', ItemSchema);

export default Item;
