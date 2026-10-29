import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { generateVoiceToken } from '@/lib/twilio';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const identity = session.user?.email || 'agent-default';
    const token = generateVoiceToken(identity);

    return NextResponse.json({ token, identity });
  } catch (error: unknown) {
    console.error('Error generando Twilio Voice Token:', error);
    const message = error instanceof Error ? error.message : 'Error al generar token de voz';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
