export interface CallRecord {
  _id: string;
  from: string;
  to: string;
  direction: 'inbound' | 'outbound';
  status: 'initiated' | 'ringing' | 'in-progress' | 'completed' | 'busy' | 'no-answer' | 'failed' | 'canceled';
  duration?: number;
  recordingUrl?: string;
  twilioCallSid?: string;
  createdAt: string;
  updatedAt: string;
}

export type PipelineStage =
  | 'nuevo'
  | 'contactado'
  | 'calificado'
  | 'propuesta'
  | 'negociacion'
  | 'ganado'
  | 'perdido';

export type ContactStatus = 'lead' | 'prospect' | 'client' | 'lost';

export interface ContactNote {
  _id?: string;
  text: string;
  author: string;
  createdAt: string;
}

export interface MarketingConsent {
  email: boolean;
  whatsapp: boolean;
  sms: boolean;
}

export interface ContactRecord {
  _id: string;
  name: string;
  phone: string;
  email?: string;
  company?: string;
  position?: string;
  website?: string;
  status: ContactStatus;
  pipelineStage: PipelineStage;
  dealValue?: number;
  tags: string[];
  marketingConsent: MarketingConsent;
  notes: ContactNote[];
  customFields?: Record<string, string>;
  lastContact?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MessageRecord {
  _id: string;
  from: string;
  to: string;
  body?: string;
  mediaUrl?: string;
  direction: 'inbound' | 'outbound';
  status: 'queued' | 'sending' | 'sent' | 'delivered' | 'read' | 'failed' | 'received';
  messageSid?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserRecord {
  _id: string;
  email: string;
  name?: string;
  role: 'admin' | 'agent';
  createdAt: string;
}

export interface CampaignRecord {
  _id: string;
  name: string;
  channel: 'email' | 'whatsapp';
  subject?: string;
  content: string;
  targetTags: string[];
  status: 'draft' | 'sending' | 'completed' | 'failed';
  totalRecipients: number;
  sentCount: number;
  createdAt: string;
}
