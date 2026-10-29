import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IContactNote {
  _id?: mongoose.Types.ObjectId;
  text: string;
  author: string;
  createdAt: Date;
}

export interface IMarketingConsent {
  email: boolean;
  whatsapp: boolean;
  sms: boolean;
}

export interface IContact extends Document {
  name: string;
  phone: string;
  email?: string;
  company?: string;
  position?: string;
  website?: string;
  status: 'lead' | 'prospect' | 'client' | 'lost';
  pipelineStage:
    | 'nuevo'
    | 'contactado'
    | 'calificado'
    | 'propuesta'
    | 'negociacion'
    | 'ganado'
    | 'perdido';
  dealValue: number;
  tags: string[];
  marketingConsent: IMarketingConsent;
  notes: IContactNote[];
  customFields?: Map<string, string>;
  lastContact?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ContactNoteSchema = new Schema<IContactNote>(
  {
    text: { type: String, required: true, trim: true },
    author: { type: String, default: 'Agente', trim: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const ContactSchema = new Schema<IContact>(
  {
    name: { type: String, required: true, trim: true, index: true },
    phone: { type: String, required: true, unique: true, trim: true, index: true },
    email: { type: String, trim: true, lowercase: true, index: true },
    company: { type: String, trim: true, index: true },
    position: { type: String, trim: true },
    website: { type: String, trim: true },
    status: {
      type: String,
      enum: ['lead', 'prospect', 'client', 'lost'],
      default: 'lead',
      index: true,
    },
    pipelineStage: {
      type: String,
      enum: [
        'nuevo',
        'contactado',
        'calificado',
        'propuesta',
        'negociacion',
        'ganado',
        'perdido',
      ],
      default: 'nuevo',
      index: true,
    },
    dealValue: { type: Number, default: 0 },
    tags: { type: [String], default: [], index: true },
    marketingConsent: {
      email: { type: Boolean, default: true },
      whatsapp: { type: Boolean, default: true },
      sms: { type: Boolean, default: false },
    },
    notes: { type: [ContactNoteSchema], default: [] },
    customFields: { type: Map, of: String, default: {} },
    lastContact: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

ContactSchema.index({
  name: 'text',
  phone: 'text',
  email: 'text',
  company: 'text',
  tags: 'text',
});

export const Contact: Model<IContact> =
  mongoose.models.Contact || mongoose.model<IContact>('Contact', ContactSchema);

export default Contact;
