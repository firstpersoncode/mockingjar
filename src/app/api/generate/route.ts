import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { generateJsonDataHybrid } from '@/lib/anthropic';
import { JsonSchema } from '@/types/schema';
import { GenerationProgress } from '@/types/generation';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { schema, prompt, count = 1 }: { 
      schema: JsonSchema; 
      prompt: string; 
      count: number; 
    } = await request.json();

    // Validate input
    if (!schema || !prompt) {
      return NextResponse.json({ error: 'Schema and prompt are required' }, { status: 400 });
    }

    if (count < 1 || count > 100) {
      return NextResponse.json({ error: 'Count must be between 1 and 100' }, { status: 400 });
    }

    // Validate schema structure
    if (!schema.fields || !Array.isArray(schema.fields)) {
      return NextResponse.json({ error: 'Invalid schema structure' }, { status: 400 });
    }

    // Track progress (in a real app, you might use WebSocket or Server-Sent Events)
    const progressSteps: GenerationProgress[] = [];
    
    const progressCallback = (progress: GenerationProgress) => {
      progressSteps.push(progress);
      console.log(`Generation progress: ${progress.stage} - ${progress.message} (${progress.progress}%)`);
    };

    // Generate data using hybrid strategy
    const result = await generateJsonDataHybrid(
      schema,
      prompt,
      count,
      {
        maxAttempts: 3,
        enableFallback: true,
        progressCallback,
        timeout: 30000
      }
    );

    if (result.success) {
      return NextResponse.json({
        success: true,
        data: result.data,
        metadata: result.metadata,
        progressSteps
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.errors?.[0] || 'Generation failed',
          errors: result.errors,
          progressSteps
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Generation API error:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Internal server error' 
    }, { status: 500 });
  }
}
