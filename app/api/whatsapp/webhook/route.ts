import { NextRequest } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Message } from '@/models/Message';
import { Contact } from '@/models/Contact';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const rawFrom = (formData.get('From') as string) || '';
    const rawTo = (formData.get('To') as string) || '';
    const body = (formData.get('Body') as string) || '';
    const messageSid = (formData.get('MessageSid') as string) || '';
    const mediaUrl0 = (formData.get('MediaUrl0') as string) || undefined;

    // Limpiar prefijo 'whatsapp:'
    const cleanFrom = rawFrom.replace('whatsapp:', '').trim();
    const cleanTo = rawTo.replace('whatsapp:', '').trim();

    await connectToDatabase();

    // 1. Guardar mensaje entrante
    await Message.create({
      from: cleanFrom,
      to: cleanTo,
      body,
      mediaUrl: mediaUrl0,
      direction: 'inbound',
      status: 'received',
      messageSid,
    });

    // 2. Auto-crear o actualizar contacto
    const existingContact = await Contact.findOne({ phone: cleanFrom });
    if (!existingContact) {
      await Contact.create({
        name: `Lead WhatsApp ${cleanFrom.slice(-4)}`,
        phone: cleanFrom,
        status: 'lead',
        pipelineStage: 'nuevo',
        tags: ['Inbound WhatsApp'],
        marketingConsent: {
          whatsapp: true,
          email: false,
          sms: false,
        },
        lastContact: new Date(),
        notes: [
          {
            text: `💬 Primer mensaje entrante de WhatsApp: "${body || 'Adjunto'}"`,
            author: 'Sistema',
            createdAt: new Date(),
          },
        ],
      });
    } else {
      existingContact.lastContact = new Date();
      await existingContact.save();
    }

    return new Response('<Response/>', {
      headers: { 'Content-Type': 'text/xml' },
      status: 200,
    });
  } catch (error: unknown) {
    console.error('Error en webhook de WhatsApp:', error);
    return new Response('<Response/>', {
      headers: { 'Content-Type': 'text/xml' },
      status: 200,
    });
  }
}
