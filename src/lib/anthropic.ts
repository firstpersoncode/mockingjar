import Anthropic from '@anthropic-ai/sdk';
import { JsonSchema, SchemaField } from '@/types/schema';
import { GenerationResult, GenerationProgress, FieldGenerationContext, GenerationOptions } from '@/types/generation';
import { validateData, normalizeData, getFailedFields } from '@/lib/validation';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

const MAX_RETRIES = 3;

function convertSchemaToJsonStructure(fields: SchemaField[]): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  
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

/**
 * Generate field-specific prompts for better context
 */
function generateFieldPrompt(field: SchemaField, context: FieldGenerationContext, userPrompt: string): string {
  const constraints = [];
  
  if (field.logic?.required) constraints.push('required');
  if (field.logic?.minLength) constraints.push(`min length: ${field.logic.minLength}`);
  if (field.logic?.maxLength) constraints.push(`max length: ${field.logic.maxLength}`);
  if (field.logic?.min !== undefined) constraints.push(`min value: ${field.logic.min}`);
  if (field.logic?.max !== undefined) constraints.push(`max value: ${field.logic.max}`);
  if (field.logic?.enum) constraints.push(`allowed values: ${field.logic.enum.join(', ')}`);
  if (field.logic?.pattern) constraints.push(`pattern: ${field.logic.pattern}`);
  
  const constraintStr = constraints.length > 0 ? `\nConstraints: ${constraints.join(', ')}` : '';
  const descriptionStr = field.description ? `\nDescription: ${field.description}` : '';
  const contextStr = context.parentContext ? `\nContext: Part of ${JSON.stringify(context.parentContext, null, 2)}` : '';
  
  return `Generate realistic data for field "${field.name}" of type "${field.type}"${constraintStr}${descriptionStr}${contextStr}

User requirements: ${userPrompt}

Return only the value, no explanations or JSON formatting.`;
}

/**
 * Generate data for a specific field with context
 */
async function generateFieldData(
  field: SchemaField, 
  context: FieldGenerationContext, 
  userPrompt: string
): Promise<unknown> {
  const fieldPrompt = generateFieldPrompt(field, context, userPrompt);
  
  try {
    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1000,
      messages: [{ role: 'user', content: fieldPrompt }]
    });

    const content = message.content[0];
    if (content.type === 'text') {
      let result = content.text.trim();
      
      // Clean up common formatting issues
      result = result.replace(/^["']|["']$/g, ''); // Remove quotes
      result = result.replace(/```json\n?/g, '').replace(/```\n?/g, ''); // Remove code blocks
      
      // Type-specific parsing
      switch (field.type) {
        case 'number':
          const num = parseFloat(result);
          return isNaN(num) ? 0 : num;
        case 'boolean':
          return result.toLowerCase().includes('true') || result.toLowerCase().includes('yes');
        case 'date':
          try {
            return new Date(result).toISOString();
          } catch {
            return new Date().toISOString();
          }
        case 'array':
          try {
            const parsed = JSON.parse(result);
            return Array.isArray(parsed) ? parsed : [result];
          } catch {
            return [result];
          }
        case 'object':
          try {
            return JSON.parse(result);
          } catch {
            return { value: result };
          }
        default:
          return result;
      }
    }
  } catch (error) {
    console.error(`Failed to generate field ${field.name}:`, error);
    throw error;
  }
  
  throw new Error(`No valid response for field ${field.name}`);
}

/**
 * Regenerate failed fields using field-specific prompts
 */
async function regenerateFailedFields(
  data: Record<string, unknown>,
  failedFields: string[],
  schema: JsonSchema,
  userPrompt: string,
  progressCallback?: (progress: GenerationProgress) => void
): Promise<Record<string, unknown>> {
  const result = { ...data };
  const fieldMap = createFieldMap(schema.fields);
  
  for (let i = 0; i < failedFields.length; i++) {
    const fieldPath = failedFields[i];
    const field = getFieldByPath(fieldPath, fieldMap);
    
    if (!field) continue;
    
    progressCallback?.({
      stage: 'fixing',
      message: `Regenerating field: ${fieldPath}`,
      progress: Math.round((i / failedFields.length) * 100),
      currentField: fieldPath,
      failedFields
    });
    
    try {
      const context: FieldGenerationContext = {
        fieldPath,
        fieldType: field.type,
        parentContext: getParentContext(fieldPath, result) || undefined,
        siblingFields: getSiblingFields(fieldPath, result),
        description: field.description,
        constraints: field.logic
      };
      
      const newValue = await generateFieldData(field, context, userPrompt);
      setValueByPath(result, fieldPath, newValue);
      
    } catch (error) {
      console.error(`Failed to regenerate field ${fieldPath}:`, error);
      // Set a default value based on field type
      setValueByPath(result, fieldPath, getDefaultValue(field));
    }
  }
  
  return result;
}

/**
 * Create a map of field paths to field definitions
 */
function createFieldMap(fields: SchemaField[], prefix = ''): Record<string, SchemaField> {
  const map: Record<string, SchemaField> = {};
  
  for (const field of fields) {
    const path = prefix ? `${prefix}.${field.name}` : field.name;
    map[path] = field;
    
    if (field.children) {
      Object.assign(map, createFieldMap(field.children, path));
    }
    
    if (field.arrayItemType && field.arrayItemType.children) {
      Object.assign(map, createFieldMap(field.arrayItemType.children, `${path}[0]`));
    }
  }
  
  return map;
}

/**
 * Get field definition by path
 */
function getFieldByPath(path: string, fieldMap: Record<string, SchemaField>): SchemaField | null {
  // Handle array indices in path
  const normalizedPath = path.replace(/\[\d+\]/g, '[0]');
  return fieldMap[normalizedPath] || null;
}

/**
 * Set value at nested path
 */
function setValueByPath(obj: Record<string, unknown>, path: string, value: unknown): void {
  const parts = path.split('.');
  let current: Record<string, unknown> = obj;
  
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    if (!(part in current)) {
      current[part] = {};
    }
    current = current[part] as Record<string, unknown>;
  }
  
  current[parts[parts.length - 1]] = value;
}

/**
 * Get parent context for field generation
 */
function getParentContext(path: string, data: Record<string, unknown>): Record<string, unknown> | null {
  const parts = path.split('.');
  if (parts.length <= 1) return null;
  
  const parentPath = parts.slice(0, -1).join('.');
  let current: unknown = data;
  
  for (const part of parentPath.split('.')) {
    if (current && typeof current === 'object' && part in (current as Record<string, unknown>)) {
      current = (current as Record<string, unknown>)[part];
    } else {
      return null;
    }
  }
  
  return current && typeof current === 'object' ? current as Record<string, unknown> : null;
}

/**
 * Get sibling fields for context
 */
function getSiblingFields(path: string, data: Record<string, unknown>): Record<string, unknown> {
  const parent = getParentContext(path, data);
  return parent || {};
}

/**
 * Get default value for field type
 */
function getDefaultValue(field: SchemaField): unknown {
  switch (field.type) {
    case 'text':
    case 'email':
    case 'url':
      return '';
    case 'number':
      return 0;
    case 'boolean':
      return false;
    case 'date':
      return new Date().toISOString();
    case 'array':
      return [];
    case 'object':
      return {};
    default:
      return null;
  }
}

/**
 * Main hybrid data generation function
 */
export async function generateJsonDataHybrid(
  schema: JsonSchema,
  prompt: string,
  count: number = 1,
  options: GenerationOptions = {}
): Promise<GenerationResult> {
  const startTime = Date.now();
  const maxAttempts = options.maxAttempts || MAX_RETRIES;
  const progressCallback = options.progressCallback;
  
  progressCallback?.({
    stage: 'preparing',
    message: 'Preparing data generation...',
    progress: 0
  });

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      // Step 1: Try full-schema generation
      progressCallback?.({
        stage: 'generating',
        message: `Generating complete data structure (attempt ${attempt}/${maxAttempts})...`,
        progress: 20,
        attempts: attempt,
        maxAttempts
      });

      const generatedData = await generateFullSchema(schema, prompt, count);
      
      // Step 2: Validate the generated data
      progressCallback?.({
        stage: 'validating',
        message: 'Validating generated data...',
        progress: 60
      });

      const results = [];
      const allFailedFields = new Set<string>();
      
      for (let i = 0; i < generatedData.length; i++) {
        let data = generatedData[i];
        
        // Normalize data first
        const normalizedData = normalizeData(data, schema);
        data = normalizedData as Record<string, unknown>;
        
        // Validate
        const validation = validateData(data, schema);
        
        if (validation.isValid) {
          results.push(data);
        } else {
          // Step 3: Identify failed fields and regenerate
          const failedFields = getFailedFields(validation.errors);
          failedFields.forEach(field => allFailedFields.add(field));
          
          if (options.enableFallback !== false && failedFields.length > 0) {
            progressCallback?.({
              stage: 'fixing',
              message: `Fixing ${failedFields.length} failed fields...`,
              progress: 70,
              failedFields
            });
            
            // Step 4: Regenerate failed fields
            const fixedData = await regenerateFailedFields(
              data,
              failedFields,
              schema,
              prompt,
              progressCallback
            );
            
            // Step 5: Re-validate
            const revalidation = validateData(fixedData, schema);
            if (revalidation.isValid) {
              results.push(fixedData);
            } else {
              // If still failing, use the best attempt
              results.push(fixedData);
            }
          } else {
            results.push(data);
          }
        }
      }
      
      progressCallback?.({
        stage: 'completed',
        message: 'Data generation completed successfully!',
        progress: 100
      });

      return {
        success: true,
        data: results,
        progress: {
          stage: 'completed',
          message: 'Data generation completed successfully!',
          progress: 100
        },
        metadata: {
          totalFields: getTotalFieldCount(schema.fields),
          validFields: getTotalFieldCount(schema.fields) - allFailedFields.size,
          regeneratedFields: Array.from(allFailedFields),
          attempts: attempt,
          generationTime: Date.now() - startTime
        }
      };

    } catch (error) {
      console.error(`Generation attempt ${attempt} failed:`, error);
      
      if (attempt === maxAttempts) {
        progressCallback?.({
          stage: 'failed',
          message: `Generation failed after ${maxAttempts} attempts`,
          progress: 0
        });

        return {
          success: false,
          errors: [`Generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`],
          progress: {
            stage: 'failed',
            message: `Generation failed after ${maxAttempts} attempts`,
            progress: 0
          }
        };
      }
      
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }
  
  return {
    success: false,
    errors: ['Maximum attempts exceeded'],
    progress: {
      stage: 'failed',
      message: 'Maximum attempts exceeded',
      progress: 0
    }
  };
}

/**
 * Generate full schema data (original approach)
 */
async function generateFullSchema(schema: JsonSchema, prompt: string, count: number): Promise<Record<string, unknown>[]> {
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

/**
 * Count total fields in schema for progress tracking
 */
function getTotalFieldCount(fields: SchemaField[]): number {
  let count = 0;
  for (const field of fields) {
    count++;
    if (field.children) {
      count += getTotalFieldCount(field.children);
    }
    if (field.arrayItemType?.children) {
      count += getTotalFieldCount(field.arrayItemType.children);
    }
  }
  return count;
}

// Legacy function for backward compatibility
export async function generateJsonData(
  schema: JsonSchema,
  prompt: string,
  count: number = 1
): Promise<Record<string, unknown>[]> {
  const result = await generateJsonDataHybrid(schema, prompt, count);
  if (result.success && result.data) {
    return result.data;
  }
  throw new Error(result.errors?.[0] || 'Generation failed');
}
