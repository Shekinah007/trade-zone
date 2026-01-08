import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IMessage extends Document {
  conversation: mongoose.Types.ObjectId;
  sender: mongoose.Types.ObjectId;
  content: string;
  attachments?: string[];
  read: boolean;
}

const MessageSchema = new Schema<IMessage>(
  {
    conversation: { type: Schema.Types.ObjectId, ref: 'Conversation', required: true },
    sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    attachments: [{ type: String }],
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Message: Model<IMessage> = mongoose.models?.Message || mongoose.model('Message', MessageSchema);
export default Message;
