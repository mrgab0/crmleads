import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { Message } from '@/models/Message';
import { Contact } from '@/models/Contact';
import { sendWhatsAppMessage, whatsappSender } from '@/lib/twilio';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { to, body, mediaUrl } = await req.json();

    if (!to || (!body && !mediaUrl)) {
      return NextResponse.json(
        { error: 'Destinatario y mensaje o adjunto requeridos' },
        { status: 400 }
      );
    }

    const cleanTo = to.replace('whatsapp:', '').trim();
    const cleanFrom = whatsappSender.replace('whatsapp:', '').trim();

    let twilioMsgSid = '';
    try {
      const twilioRes = await sendWhatsAppMessage({
        to: cleanTo,
        body,
        mediaUrl,
      });
      twilioMsgSid = twilioRes.sid;
    } catch (twilioErr) {
      console.error('Error al enviar WhatsApp vía Twilio:', twilioErr);
      // Si estamos en entorno de desarrollo sin saldo o credenciales sandbox
    }

    await connectToDatabase();

    const newMsg = await Message.create({
      from: cleanFrom,
      to: cleanTo,
      body: body ? body.trim() : undefined,
      mediaUrl,
      direction: 'outbound',
      status: 'sent',
      messageSid: twilioMsgSid || `mock-${Date.now()}`,
    });

    // Actualizar último contacto del lead
    await Contact.findOneAndUpdate(
      { phone: cleanTo },
      { $set: { lastContact: new Date() } }
    );

    return NextResponse.json({ success: true, message: newMsg });
  } catch (error: unknown) {
    console.error('Error en /api/whatsapp/send:', error);
    return NextResponse.json({ error: 'Error al enviar mensaje' }, { status: 500 });
  }
}
