import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IReport extends Document {
    reporter: mongoose.Types.ObjectId;
    reportedItem: mongoose.Types.ObjectId;
    itemType: 'listing' | 'user' | 'message';
    reason: string;
    description: string;
    status: 'pending' | 'reviewed' | 'resolved';
}

const ReportSchema = new Schema<IReport>({
    reporter: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    reportedItem: { type: Schema.Types.ObjectId, required: true },
    itemType: { type: String, enum: ['listing', 'user', 'message'], required: true },
    reason: { type: String, required: true },
    description: { type: String, required: true },
    status: { type: String, enum: ['pending', 'reviewed', 'resolved'], default: 'pending' }
}, { timestamps: true });

const Report: Model<IReport> = mongoose.models?.Report || mongoose.model('Report', ReportSchema);
export default Report;
