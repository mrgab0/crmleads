import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { Contact } from '@/models/Contact';
import { sendEmail } from '@/lib/email';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { contactId, to, subject, message } = await req.json();

    if (!to || !subject || !message) {
      return NextResponse.json(
        { error: 'Faltan campos obligatorios (to, subject, message)' },
        { status: 400 }
      );
    }

    const result = await sendEmail({
      to,
      subject,
      text: message,
      html: `
        <div style="font-family: sans-serif; line-height: 1.5; color: #18181b;">
          ${message.replace(/\n/g, '<br/>')}
        </div>
      `,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error || 'Fallo al enviar email' }, { status: 502 });
    }

    // Registrar en el timeline del contacto si se envió contactId
    if (contactId) {
      await connectToDatabase();
      await Contact.findByIdAndUpdate(contactId, {
        $push: {
          notes: {
            text: `✉️ [Email Enviado] Asunto: "${subject}"\n${message}`,
            author: session.user?.name || 'Agente',
            createdAt: new Date(),
          },
        },
        $set: { lastContact: new Date() },
      });
    }

    return NextResponse.json({ success: true, messageId: result.id });
  } catch (error: unknown) {
    console.error('Error al enviar email:', error);
    return NextResponse.json({ error: 'Error interno al enviar email' }, { status: 500 });
  }
}
