import { NextRequest } from 'next/server';
import twilio from 'twilio';
import { connectToDatabase } from '@/lib/mongodb';
import { Call } from '@/models/Call';
import { callerId } from '@/lib/twilio';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const to = (formData.get('To') as string) || '';
    const from = (formData.get('From') as string) || '';
    const callSid = (formData.get('CallSid') as string) || '';

    const VoiceResponse = twilio.twiml.VoiceResponse;
    const response = new VoiceResponse();

    // Determinar si es llamada saliente desde el navegador o entrante
    const isOutbound = to && to !== callerId;

    if (isOutbound) {
      // Llamada saliente desde el navegador hacia un teléfono
      const dial = response.dial({
        callerId: callerId || from,
        action: '/api/twilio/voice/status',
        method: 'POST',
      });
      dial.number(to);

      // Registrar llamada en DB
      try {
        await connectToDatabase();
        await Call.create({
          from: callerId || from,
          to,
          direction: 'outbound',
          status: 'initiated',
          twilioCallSid: callSid,
        });
      } catch (dbErr) {
        console.error('Error registrando llamada saliente:', dbErr);
      }
    } else {
      // Llamada entrante hacia el número de Twilio: enrutar al cliente WebRTC del navegador
      const dial = response.dial({
        action: '/api/twilio/voice/status',
        method: 'POST',
      });
      dial.client('agent-default');

      // Registrar llamada entrante en DB
      try {
        await connectToDatabase();
        await Call.create({
          from,
          to: callerId || to,
          direction: 'inbound',
          status: 'ringing',
          twilioCallSid: callSid,
        });
      } catch (dbErr) {
        console.error('Error registrando llamada entrante:', dbErr);
      }
    }

    return new Response(response.toString(), {
      headers: { 'Content-Type': 'text/xml' },
      status: 200,
    });
  } catch (error: unknown) {
    console.error('Error procesando webhook de voz:', error);
    const VoiceResponse = twilio.twiml.VoiceResponse;
    const response = new VoiceResponse();
    response.say('Ha ocurrido un error al procesar la llamada.');
    return new Response(response.toString(), {
      headers: { 'Content-Type': 'text/xml' },
      status: 200,
    });
  }
}
