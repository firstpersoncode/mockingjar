import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { generateJsonData } from '@/lib/anthropic';
import { JsonSchema } from '@/types/schema';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { schema, prompt, count }: { 
      schema: JsonSchema; 
      prompt: string; 
      count: number; 
    } = await request.json();

    if (!schema || !prompt) {
      return NextResponse.json({ error: 'Schema and prompt are required' }, { status: 400 });
    }

    if (count > 100) {
      return NextResponse.json({ error: 'Maximum count is 100' }, { status: 400 });
    }

    const data = await generateJsonData(schema, prompt, count);

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error generating data:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Internal server error' 
    }, { status: 500 });
  }
}
