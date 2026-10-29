import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IMessage extends Document {
  from: string;
  to: string;
  body?: string;
  mediaUrl?: string;
  direction: 'inbound' | 'outbound';
  status: 'queued' | 'sending' | 'sent' | 'delivered' | 'read' | 'failed' | 'received';
  messageSid?: string;
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    from: { type: String, required: true, trim: true, index: true },
    to: { type: String, required: true, trim: true, index: true },
    body: { type: String, trim: true },
    mediaUrl: { type: String, trim: true },
    direction: { type: String, enum: ['inbound', 'outbound'], required: true },
    status: {
      type: String,
      enum: ['queued', 'sending', 'sent', 'delivered', 'read', 'failed', 'received'],
      default: 'sent',
      index: true,
    },
    messageSid: { type: String, trim: true, sparse: true, index: true },
  },
  {
    timestamps: true,
  }
);

MessageSchema.index({ from: 1, to: 1, createdAt: -1 });

export const Message: Model<IMessage> =
  mongoose.models.Message || mongoose.model<IMessage>('Message', MessageSchema);

export default Message;
