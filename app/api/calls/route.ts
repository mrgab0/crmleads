import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { Call } from '@/models/Call';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const skip = (page - 1) * limit;

    const [calls, total] = await Promise.all([
      Call.find().sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Call.countDocuments(),
    ]);

    return NextResponse.json({
      calls,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error: unknown) {
    console.error('Error al obtener llamadas:', error);
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
    const { from, to, direction, status, duration } = body;

    const newCall = await Call.create({
      from,
      to,
      direction: direction || 'outbound',
      status: status || 'completed',
      duration: duration || 0,
    });

    return NextResponse.json({ call: newCall }, { status: 201 });
  } catch (error: unknown) {
    console.error('Error al registrar llamada:', error);
    return NextResponse.json({ error: 'Error interno al registrar llamada' }, { status: 500 });
  }
}
