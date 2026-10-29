import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { Contact } from '@/models/Contact';
import { Campaign } from '@/models/Campaign';
import { sendEmail } from '@/lib/email';
import { sendWhatsAppMessage } from '@/lib/twilio';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    await connectToDatabase();
    const campaigns = await Campaign.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json({ campaigns });
  } catch (error: unknown) {
    console.error('Error al obtener campañas:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    await connectToDatabase();
    const { name, channel, subject, content, targetTags } = await req.json();

    if (!name || !channel || !content) {
      return NextResponse.json({ error: 'Datos incompletos de campaña' }, { status: 400 });
    }

    // Filtrar contactos que coincidan con los tags seleccionados y tengan consentimiento
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: Record<string, any> = {};
    if (Array.isArray(targetTags) && targetTags.length > 0) {
      query.tags = { $in: targetTags };
    }

    if (channel === 'email') {
      query.email = { $exists: true, $ne: '' };
      query['marketingConsent.email'] = { $ne: false };
    } else if (channel === 'whatsapp') {
      query.phone = { $exists: true, $ne: '' };
      query['marketingConsent.whatsapp'] = { $ne: false };
    }

    const recipients = await Contact.find(query).lean();

    const campaign = await Campaign.create({
      name,
      channel,
      subject: channel === 'email' ? subject || 'Novedades' : undefined,
      content,
      targetTags: targetTags || [],
      status: 'sending',
      totalRecipients: recipients.length,
      sentCount: 0,
      failedCount: 0,
    });

    let sent = 0;
    let failed = 0;

    for (const contact of recipients) {
      try {
        if (channel === 'email' && contact.email) {
          const res = await sendEmail({
            to: contact.email,
            subject: subject || name,
            text: content,
          });
          if (res.success) sent++;
          else failed++;
        } else if (channel === 'whatsapp' && contact.phone) {
          await sendWhatsAppMessage({
            to: contact.phone,
            body: content,
          });
          sent++;
        }
      } catch {
        failed++;
      }
    }

    campaign.sentCount = sent;
    campaign.failedCount = failed;
    campaign.status = 'completed';
    await campaign.save();

    return NextResponse.json({ campaign, sent, failed });
  } catch (error: unknown) {
    console.error('Error al ejecutar campaña:', error);
    return NextResponse.json({ error: 'Error al ejecutar campaña' }, { status: 500 });
  }
}
