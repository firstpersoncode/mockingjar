import { NextRequest, NextResponse } from 'next/server';
import { validateSessionAndCSRF } from '@/lib/api-protection';
import { Generator } from 'mockingjar-lib';
import { GenerateDataParams } from 'mockingjar-lib/dist/types/generation';

export async function POST(request: NextRequest) {
  try {
    const validation = await validateSessionAndCSRF(request);
    if (!validation.isValid) {
      return validation.response;
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
    const result = await Generator.generate(
      process.env.ANTHROPIC_API_KEY!,
      schema,
      prompt,
      {
        maxAttempts: 5,
        enableFallback: true,
        timeout: 60000,
        count,
      }
    );

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
