import { NextRequest } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Call } from '@/models/Call';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const callSid = (formData.get('CallSid') as string) || '';
    const callStatus = (formData.get('CallStatus') as string) || '';
    const duration = parseInt((formData.get('CallDuration') as string) || '0', 10);
    const recordingUrl = (formData.get('RecordingUrl') as string) || undefined;

    if (callSid) {
      await connectToDatabase();
      await Call.findOneAndUpdate(
        { twilioCallSid: callSid },
        {
          $set: {
            status: callStatus || 'completed',
            duration: duration || 0,
            ...(recordingUrl ? { recordingUrl } : {}),
          },
        },
        { new: true }
      );
    }

    return new Response('<Response/>', {
      headers: { 'Content-Type': 'text/xml' },
      status: 200,
    });
  } catch (error: unknown) {
    console.error('Error en status callback de voz:', error);
    return new Response('<Response/>', {
      headers: { 'Content-Type': 'text/xml' },
      status: 200,
    });
  }
}
