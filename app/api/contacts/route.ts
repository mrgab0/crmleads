import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { Contact } from '@/models/Contact';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const tag = searchParams.get('tag') || '';
    const stage = searchParams.get('stage') || '';
    const status = searchParams.get('status') || '';
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const skip = (page - 1) * limit;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filter: Record<string, any> = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
      ];
    }

    if (tag) {
      filter.tags = tag;
    }

    if (stage) {
      filter.pipelineStage = stage;
    }

    if (status) {
      filter.status = status;
    }

    const [contacts, total] = await Promise.all([
      Contact.find(filter).sort({ lastContact: -1, createdAt: -1 }).skip(skip).limit(limit).lean(),
      Contact.countDocuments(filter),
    ]);

    // Extraer lista única de todos los tags para filtros en el frontend
    const allTags = await Contact.distinct('tags');

    return NextResponse.json({
      contacts,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      availableTags: allTags,
    });
  } catch (error: unknown) {
    console.error('Error al obtener contactos:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    await connectToDatabase();
    const body = await req.json();

    const {
      name,
      phone,
      email,
      company,
      position,
      website,
      status,
      pipelineStage,
      dealValue,
      tags,
      note,
    } = body;

    if (!name || !phone) {
      return NextResponse.json(
        { error: 'El nombre y el teléfono son obligatorios' },
        { status: 400 }
      );
    }

    // Normalizar formato de teléfono
    const cleanPhone = phone.trim();

    // Comprobar si ya existe
    let contact = await Contact.findOne({ phone: cleanPhone });

    if (contact) {
      return NextResponse.json(
        { error: 'Ya existe un contacto con este número de teléfono' },
        { status: 409 }
      );
    }

    const notesArray = note
      ? [{ text: note, author: session.user?.name || 'Agente', createdAt: new Date() }]
      : [];

    contact = await Contact.create({
      name: name.trim(),
      phone: cleanPhone,
      email: email ? email.trim().toLowerCase() : undefined,
      company: company ? company.trim() : undefined,
      position: position ? position.trim() : undefined,
      website: website ? website.trim() : undefined,
      status: status || 'lead',
      pipelineStage: pipelineStage || 'nuevo',
      dealValue: dealValue ? Number(dealValue) : 0,
      tags: Array.isArray(tags) ? tags : [],
      notes: notesArray,
      lastContact: new Date(),
    });

    return NextResponse.json({ contact }, { status: 201 });
  } catch (error: unknown) {
    console.error('Error al crear contacto:', error);
    return NextResponse.json({ error: 'Error al crear contacto' }, { status: 500 });
  }
}
