import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { Contact } from '@/models/Contact';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await req.json();
    const text = body.text?.trim();

    if (!text) {
      return NextResponse.json({ error: 'El contenido de la nota es requerido' }, { status: 400 });
    }

    await connectToDatabase();

    const note = {
      text,
      author: session.user?.name || session.user?.email || 'Agente',
      createdAt: new Date(),
    };

    const contact = await Contact.findByIdAndUpdate(
      params.id,
      {
        $push: { notes: note },
        $set: { lastContact: new Date() },
      },
      { new: true }
    );

    if (!contact) {
      return NextResponse.json({ error: 'Contacto no encontrado' }, { status: 404 });
    }

    return NextResponse.json({ success: true, notes: contact.notes });
  } catch (error: unknown) {
    console.error('Error al agregar nota:', error);
    return NextResponse.json({ error: 'Error al agregar nota' }, { status: 500 });
  }
}
