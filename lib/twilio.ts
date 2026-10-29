import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID || '';
const authToken = process.env.TWILIO_AUTH_TOKEN || '';
const apiKey = process.env.TWILIO_API_KEY || '';
const apiSecret = process.env.TWILIO_API_SECRET || '';
const twimlAppSid = process.env.TWILIO_TWIML_APP_SID || '';
const callerId = process.env.TWILIO_PHONE_NUMBER || '';
const whatsappSender = process.env.TWILIO_WHATSAPP_NUMBER || '';

let twilioClient: twilio.Twilio | null = null;

export function getTwilioClient(): twilio.Twilio {
  if (!twilioClient) {
    if (!accountSid || !authToken) {
      throw new Error('TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN must be configured');
    }
    twilioClient = twilio(accountSid, authToken);
  }
  return twilioClient;
}

export function generateVoiceToken(identity: string): string {
  if (!accountSid || !apiKey || !apiSecret || !twimlAppSid) {
    throw new Error('Twilio API Key, Secret and TwiML App SID must be configured');
  }

  const AccessToken = twilio.jwt.AccessToken;
  const VoiceGrant = AccessToken.VoiceGrant;

  const voiceGrant = new VoiceGrant({
    outgoingApplicationSid: twimlAppSid,
    incomingAllow: true, // Permite recibir llamadas entrantes
  });

  const token = new AccessToken(accountSid, apiKey, apiSecret, {
    identity,
    ttl: 3600, // 1 hora de validez
  });

  token.addGrant(voiceGrant);
  return token.toJwt();
}

export async function sendWhatsAppMessage({
  to,
  body,
  mediaUrl,
}: {
  to: string;
  body?: string;
  mediaUrl?: string;
}) {
  const client = getTwilioClient();
  const formattedTo = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;
  const formattedFrom = whatsappSender.startsWith('whatsapp:')
    ? whatsappSender
    : `whatsapp:${whatsappSender}`;

  return await client.messages.create({
    from: formattedFrom,
    to: formattedTo,
    body: body || undefined,
    mediaUrl: mediaUrl ? [mediaUrl] : undefined,
  });
}

export { callerId, whatsappSender, twimlAppSid };
