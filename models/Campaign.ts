import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICampaign extends Document {
  name: string;
  channel: 'email' | 'whatsapp';
  subject?: string;
  content: string;
  targetTags: string[];
  status: 'draft' | 'sending' | 'completed' | 'failed';
  totalRecipients: number;
  sentCount: number;
  failedCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const CampaignSchema = new Schema<ICampaign>(
  {
    name: { type: String, required: true, trim: true },
    channel: { type: String, enum: ['email', 'whatsapp'], required: true },
    subject: { type: String, trim: true },
    content: { type: String, required: true },
    targetTags: { type: [String], default: [] },
    status: {
      type: String,
      enum: ['draft', 'sending', 'completed', 'failed'],
      default: 'draft',
      index: true,
    },
    totalRecipients: { type: Number, default: 0 },
    sentCount: { type: Number, default: 0 },
    failedCount: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

export const Campaign: Model<ICampaign> =
  mongoose.models.Campaign || mongoose.model<ICampaign>('Campaign', CampaignSchema);

export default Campaign;
