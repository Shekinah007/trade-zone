import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IConversation extends Document {
  participants: mongoose.Types.ObjectId[];
  item: mongoose.Types.ObjectId;
  lastMessage?: string;
  lastMessageAt?: Date;
  unreadCount?: Map<string, number>;
}

const ConversationSchema = new Schema<IConversation>(
  {
    participants: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    item: { type: Schema.Types.ObjectId, ref: 'Item' },
    lastMessage: String,
    lastMessageAt: Date,
    unreadCount: { type: Map, of: Number },
  },
  { timestamps: true }
);

const Conversation: Model<IConversation> = mongoose.models?.Conversation || mongoose.model('Conversation', ConversationSchema);
export default Conversation;
