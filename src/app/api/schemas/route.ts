import { NextRequest, NextResponse } from 'next/server';
import { validateSession, validateSessionAndCSRF } from '@/lib/api-protection';
import { prisma } from '@/lib/db';
import { JsonSchema } from 'mockingjar-lib/dist/types/schema';

export async function GET() {
  try {
    const validation = await validateSession();
    if (!validation.isValid) {
      return validation.response;
    }

    const schemas = await prisma.schema.findMany({
      where: { userId: validation.userId! },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(schemas);
  } catch (error) {
    console.error('Error fetching schemas:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const validation = await validateSessionAndCSRF(request);
    if (!validation.isValid) {
      return validation.response;
    }

    const body: JsonSchema = await request.json();

    const schema = await prisma.schema.create({
      data: {
        name: body.name,
        description: body.description,
        structure: JSON.parse(JSON.stringify(body)),
        userId: validation.userId!,
      },
    });

    return NextResponse.json(schema);
  } catch (error) {
    console.error('Error creating schema:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
