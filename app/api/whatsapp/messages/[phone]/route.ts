import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { Message } from '@/models/Message';

export async function GET(
  req: NextRequest,
  { params }: { params: { phone: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const phone = decodeURIComponent(params.phone).replace('whatsapp:', '').trim();

    await connectToDatabase();

    const messages = await Message.find({
      $or: [{ from: phone }, { to: phone }],
    })
      .sort({ createdAt: 1 })
      .limit(200)
      .lean();

    // Marcar mensajes entrantes como leídos
    await Message.updateMany(
      { from: phone, direction: 'inbound', status: 'received' },
      { $set: { status: 'read' } }
    );

    return NextResponse.json({ messages });
  } catch (error: unknown) {
    console.error('Error al obtener mensajes:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
