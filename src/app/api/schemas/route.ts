import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { JsonSchema } from '@/types/schema';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const schemas = await prisma.schema.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(schemas);
  } catch (error) {
    console.error('Error fetching schemas:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: JsonSchema = await request.json();
    
    const schema = await prisma.schema.create({
      data: {
        name: body.name,
        description: body.description,
        structure: body,
        userId: session.user.id,
      },
    });

    return NextResponse.json(schema);
  } catch (error) {
    console.error('Error creating schema:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
