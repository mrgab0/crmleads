import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICall extends Document {
  from: string;
  to: string;
  direction: 'inbound' | 'outbound';
  status: 'initiated' | 'ringing' | 'in-progress' | 'completed' | 'busy' | 'no-answer' | 'failed' | 'canceled';
  duration: number;
  recordingUrl?: string;
  twilioCallSid?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CallSchema = new Schema<ICall>(
  {
    from: { type: String, required: true, trim: true, index: true },
    to: { type: String, required: true, trim: true, index: true },
    direction: { type: String, enum: ['inbound', 'outbound'], required: true },
    status: {
      type: String,
      enum: ['initiated', 'ringing', 'in-progress', 'completed', 'busy', 'no-answer', 'failed', 'canceled'],
      default: 'initiated',
      index: true,
    },
    duration: { type: Number, default: 0 },
    recordingUrl: { type: String, trim: true },
    twilioCallSid: { type: String, trim: true, sparse: true, index: true },
  },
  {
    timestamps: true,
  }
);

export const Call: Model<ICall> = mongoose.models.Call || mongoose.model<ICall>('Call', CallSchema);
export default Call;
