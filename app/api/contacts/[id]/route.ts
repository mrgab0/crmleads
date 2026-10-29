import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { Contact } from '@/models/Contact';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    await connectToDatabase();
    const contact = await Contact.findById(params.id).lean();

    if (!contact) {
      return NextResponse.json({ error: 'Contacto no encontrado' }, { status: 404 });
    }

    return NextResponse.json({ contact });
  } catch (error: unknown) {
    console.error('Error al obtener contacto:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    await connectToDatabase();
    const body = await req.json();

    const allowedFields = [
      'name',
      'phone',
      'email',
      'company',
      'position',
      'website',
      'status',
      'pipelineStage',
      'dealValue',
      'tags',
      'marketingConsent',
    ];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: Record<string, any> = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    const updated = await Contact.findByIdAndUpdate(
      params.id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return NextResponse.json({ error: 'Contacto no encontrado' }, { status: 404 });
    }

    return NextResponse.json({ contact: updated });
  } catch (error: unknown) {
    console.error('Error al actualizar contacto:', error);
    return NextResponse.json({ error: 'Error al actualizar contacto' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    await connectToDatabase();
    const deleted = await Contact.findByIdAndDelete(params.id);

    if (!deleted) {
      return NextResponse.json({ error: 'Contacto no encontrado' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Contacto eliminado' });
  } catch (error: unknown) {
    console.error('Error al eliminar contacto:', error);
    return NextResponse.json({ error: 'Error al eliminar contacto' }, { status: 500 });
  }
}
