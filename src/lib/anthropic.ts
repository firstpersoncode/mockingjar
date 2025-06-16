import Anthropic from '@anthropic-ai/sdk';
import { JsonSchema, SchemaField } from '@/types/schema';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

function convertSchemaToJsonStructure(fields: SchemaField[]): any {
  const result: any = {};
  
  for (const field of fields) {
    switch (field.type) {
      case 'text':
      case 'email':
      case 'url':
        result[field.name] = 'string';
        break;
      case 'number':
        result[field.name] = 'number';
        break;
      case 'boolean':
        result[field.name] = 'boolean';
        break;
      case 'date':
        result[field.name] = 'date';
        break;
      case 'array':
        if (field.arrayItemType) {
          if (field.arrayItemType.type === 'object' && field.arrayItemType.children) {
            result[field.name] = [convertSchemaToJsonStructure(field.arrayItemType.children)];
          } else {
            result[field.name] = [field.arrayItemType.type === 'text' ? 'string' : field.arrayItemType.type];
          }
        } else {
          result[field.name] = ['string'];
        }
        break;
      case 'object':
        if (field.children) {
          result[field.name] = convertSchemaToJsonStructure(field.children);
        } else {
          result[field.name] = {};
        }
        break;
    }
  }
  
  return result;
}

export async function generateJsonData(
  schema: JsonSchema,
  prompt: string,
  count: number = 1
): Promise<any[]> {
  const jsonStructure = convertSchemaToJsonStructure(schema.fields);
  
  const systemPrompt = `Generate realistic JSON data matching this exact structure:
${JSON.stringify(jsonStructure, null, 2)}

Requirements:
1. Return exactly ${count} object(s) in a JSON array
2. Match the structure exactly - no additional or missing fields
3. Generate realistic data based on field names and types
4. Consider the user's specific requirements: ${prompt}

Return only valid JSON, no explanations.`;

  const message = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 4000,
    system: systemPrompt,
    messages: [{ role: 'user', content: prompt }]
  });

  const content = message.content[0];
  if (content.type === 'text') {
    const cleanedJson = content.text
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();
    
    try {
      const parsedData = JSON.parse(cleanedJson);
      return Array.isArray(parsedData) ? parsedData : [parsedData];
    } catch (error) {
      console.error('Failed to parse generated JSON:', error);
      throw new Error('Invalid JSON response from Claude');
    }
  }
  
  throw new Error('Invalid response from Claude');
}
