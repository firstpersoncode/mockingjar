import { NextRequest, NextResponse } from 'next/server';
import { validateSession, validateSessionAndCSRF } from '@/lib/api-protection';
import { prisma } from '@/lib/db';
import { JsonSchema } from 'mockingjar-lib/dist/types/schema';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const validation = await validateSession();
    if (!validation.isValid) {
      return validation.response;
    }

    const { id: schemaId } = await params;

    const schema = await prisma.schema.findFirst({
      where: {
        id: schemaId,
        userId: validation.userId!,
      },
    });

    if (!schema) {
      return NextResponse.json({ error: 'Schema not found' }, { status: 404 });
    }

    return NextResponse.json(schema);
  } catch (error) {
    console.error('Error fetching schema:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const validation = await validateSessionAndCSRF(request);
    if (!validation.isValid) {
      return validation.response;
    }

    const { id: schemaId } = await params;

    const body: JsonSchema = await request.json();

    const schema = await prisma.schema.updateMany({
      where: {
        id: schemaId,
        userId: validation.userId!,
      },
      data: {
        name: body.name,
        description: body.description,
        structure: JSON.parse(JSON.stringify(body)),
      },
    });

    if (schema.count === 0) {
      return NextResponse.json({ error: 'Schema not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating schema:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const validation = await validateSessionAndCSRF(request);
    if (!validation.isValid) {
      return validation.response;
    }

    const { id: schemaId } = await params;

    const schema = await prisma.schema.deleteMany({
      where: {
        id: schemaId,
        userId: validation.userId!,
      },
    });

    if (schema.count === 0) {
      return NextResponse.json({ error: 'Schema not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting schema:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
