import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { generateJsonData } from '@/lib/generator';
import { anthropic } from '@/lib/anthropic';
import { GenerateDataParams } from '@/types/generation';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { schema, prompt, count }: GenerateDataParams = await request.json();

    // Validate input
    if (!schema || !prompt) {
      return NextResponse.json(
        { error: 'Schema and prompt are required' },
        { status: 400 }
      );
    }

    // Validate schema structure
    if (!schema.fields || !Array.isArray(schema.fields)) {
      return NextResponse.json(
        { error: 'Invalid schema structure' },
        { status: 400 }
      );
    }

    // Generate data using hybrid strategy
    const result = await generateJsonData(anthropic, schema, prompt, {
      maxAttempts: 5,
      enableFallback: true,
      timeout: 60000,
      count,
    });

    if (result.success) {
      return NextResponse.json({
        success: true,
        data: result.data,
        metadata: result.metadata,
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.errors?.[0] || 'Generation failed',
          errors: result.errors,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Generation API error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}
