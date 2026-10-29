import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { Message } from '@/models/Message';
import { whatsappSender } from '@/lib/twilio';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    await connectToDatabase();
    const cleanSender = whatsappSender.replace('whatsapp:', '').trim();

    // Agrupar por el número del contacto (el que no es nuestro número de Twilio)
    const conversations = await Message.aggregate([
      {
        $project: {
          contactPhone: {
            $cond: [{ $eq: ['$direction', 'inbound'] }, '$from', '$to'],
          },
          from: 1,
          to: 1,
          body: 1,
          mediaUrl: 1,
          direction: 1,
          status: 1,
          createdAt: 1,
        },
      },
      {
        $match: {
          contactPhone: { $ne: cleanSender },
        },
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $group: {
          _id: '$contactPhone',
          lastMessage: { $first: '$$ROOT' },
          unreadCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ['$direction', 'inbound'] },
                    { $eq: ['$status', 'received'] },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
      {
        $sort: { 'lastMessage.createdAt': -1 },
      },
      {
        $limit: 100,
      },
    ]);

    return NextResponse.json({ conversations });
  } catch (error: unknown) {
    console.error('Error al obtener conversaciones de WhatsApp:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
