import { JsonSchema, SchemaField } from '@/types/schema';
import {
  GenerationResult,
  GenerationProgress,
  FieldGenerationContext,
  GenerationOptions,
} from '@/types/generation';
import { validateData, normalizeData, getFailedFields } from '@/lib/validation';
import type Anthropic from '@anthropic-ai/sdk';

const MAX_RETRIES = 3;

/**
 * Main hybrid data generation function
 */
export async function generateJsonDataHybrid(
  anthropic: Anthropic,
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
    progress: 0,
  });

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      // Step 1: Try full-schema generation
      progressCallback?.({
        stage: 'generating',
        message: `Generating complete data structure (attempt ${attempt}/${maxAttempts})...`,
        progress: 20,
        attempts: attempt,
        maxAttempts,
      });

      const generatedData = await generateFullSchema(
        anthropic,
        schema,
        prompt,
        count
      );

      // Step 2: Validate the generated data
      progressCallback?.({
        stage: 'validating',
        message: 'Validating generated data...',
        progress: 60,
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
          failedFields.forEach((field) => allFailedFields.add(field));

          if (options.enableFallback !== false && failedFields.length > 0) {
            progressCallback?.({
              stage: 'fixing',
              message: `Fixing ${failedFields.length} failed fields...`,
              progress: 70,
              failedFields,
            });

            // Step 4: Regenerate failed fields
            const fixedData = await regenerateFailedFields(
              anthropic,
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
        progress: 100,
      });

      return {
        success: true,
        data: results,
        progress: {
          stage: 'completed',
          message: 'Data generation completed successfully!',
          progress: 100,
        },
        metadata: {
          totalFields: getTotalFieldCount(schema.fields),
          validFields: getTotalFieldCount(schema.fields) - allFailedFields.size,
          regeneratedFields: Array.from(allFailedFields),
          attempts: attempt,
          generationTime: Date.now() - startTime,
        },
      };
    } catch (error) {
      // Only log on final attempt to avoid spam during retries
      if (attempt === maxAttempts) {
        console.error(`Generation failed after ${maxAttempts} attempts:`, error);
        progressCallback?.({
          stage: 'failed',
          message: `Generation failed after ${maxAttempts} attempts`,
          progress: 0,
        });

        return {
          success: false,
          errors: [
            `Generation failed: ${
              error instanceof Error ? error.message : 'Unknown error'
            }`,
          ],
          progress: {
            stage: 'failed',
            message: `Generation failed after ${maxAttempts} attempts`,
            progress: 0,
          },
        };
      }

      // Wait before retry
      await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
    }
  }

  return {
    success: false,
    errors: ['Maximum attempts exceeded'],
    progress: {
      stage: 'failed',
      message: 'Maximum attempts exceeded',
      progress: 0,
    },
  };
}

export function convertSchemaToJsonStructure(
  fields: SchemaField[]
): Record<string, unknown> {
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
          if (field.arrayItemType.type === 'array') {
            // Handle nested arrays (array of arrays)
            // Recursively handle the nested array's items
            if (field.arrayItemType.arrayItemType) {
              if (field.arrayItemType.arrayItemType.type === 'object' && field.arrayItemType.arrayItemType.children) {
                result[field.name] = [[convertSchemaToJsonStructure(field.arrayItemType.arrayItemType.children)]];
              } else {
                const itemType = field.arrayItemType.arrayItemType.type === 'text' ? 'string' : field.arrayItemType.arrayItemType.type;
                result[field.name] = [[itemType]];
              }
            } else {
              result[field.name] = [['string']];
            }
          } else if (
            field.arrayItemType.type === 'object' &&
            field.arrayItemType.children
          ) {
            result[field.name] = [
              convertSchemaToJsonStructure(field.arrayItemType.children),
            ];
          } else {
            result[field.name] = [
              field.arrayItemType.type === 'text'
                ? 'string'
                : field.arrayItemType.type,
            ];
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
function generateFieldPrompt(
  field: SchemaField,
  context: FieldGenerationContext,
  userPrompt: string
): string {
  const constraints = [];

  if (field.logic?.required) constraints.push('required');
  if (field.logic?.minLength)
    constraints.push(`min length: ${field.logic.minLength}`);
  if (field.logic?.maxLength)
    constraints.push(`max length: ${field.logic.maxLength}`);
  if (field.logic?.min !== undefined)
    constraints.push(`min value: ${field.logic.min}`);
  if (field.logic?.max !== undefined)
    constraints.push(`max value: ${field.logic.max}`);
  if (field.logic?.minItems !== undefined)
    constraints.push(`min items: ${field.logic.minItems}`);
  if (field.logic?.maxItems !== undefined)
    constraints.push(`max items: ${field.logic.maxItems}`);
  if (field.logic?.enum)
    constraints.push(`allowed values: ${field.logic.enum.join(', ')}`);
  if (field.logic?.pattern) constraints.push(`pattern: ${field.logic.pattern}`);

  const constraintStr =
    constraints.length > 0 ? `\nConstraints: ${constraints.join(', ')}` : '';
  const descriptionStr = field.description
    ? `\nDescription: ${field.description}`
    : '';
  const contextStr = context.parentContext
    ? `\nContext: Part of ${JSON.stringify(context.parentContext, null, 2)}`
    : '';

  return `Generate realistic data for field "${field.name}" of type "${field.type}"${constraintStr}${descriptionStr}${contextStr}

User requirements: ${userPrompt}

Return only the value, no explanations or JSON formatting.`;
}

/**
 * Generate data for a specific field with context
 */
async function generateFieldData(
  anthropic: Anthropic,
  field: SchemaField,
  context: FieldGenerationContext,
  userPrompt: string
): Promise<unknown> {
  const fieldPrompt = generateFieldPrompt(field, context, userPrompt);

  try {
    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1000,
      messages: [{ role: 'user', content: fieldPrompt }],
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
          return (
            result.toLowerCase().includes('true') ||
            result.toLowerCase().includes('yes')
          );
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
    // Don't log field generation errors as they're handled upstream
    throw error;
  }

  throw new Error(`No valid response for field ${field.name}`);
}

/**
 * Regenerate failed fields using field-specific prompts
 */
async function regenerateFailedFields(
  anthropic: Anthropic,
  data: Record<string, unknown>,
  failedFields: string[],
  schema: JsonSchema,
  userPrompt: string,
  progressCallback?: (progress: GenerationProgress) => void
): Promise<Record<string, unknown>> {
  const result = { ...data };
  const fieldMap = createFieldMap(schema.fields);

  // Group failed fields by array parent to regenerate entire arrays instead of individual elements
  const arrayFieldsToRegenerate = groupArrayFields(failedFields);
  const individualFields = failedFields.filter(field => {
    const arrayParent = getArrayParent(field);
    return !arrayParent || !arrayFieldsToRegenerate.has(arrayParent);
  });
  
  let processedCount = 0;
  const totalFields = arrayFieldsToRegenerate.size + individualFields.length;

  // Regenerate entire array fields first
  for (const arrayField of arrayFieldsToRegenerate) {
    const field = getFieldByPath(arrayField, fieldMap);
    if (!field) continue;

    progressCallback?.({
      stage: 'fixing',
      message: `Regenerating array field: ${arrayField}`,
      progress: Math.round((processedCount / totalFields) * 100),
      currentField: arrayField,
      failedFields,
    });

    try {
      const newValue = await generateArrayFieldData(anthropic, field, arrayField, schema, userPrompt);
      setValueByPath(result, arrayField, newValue);
    } catch (error) {
      console.error(`Failed to regenerate array field ${arrayField}:`, error);
      setValueByPath(result, arrayField, getDefaultValue(field));
    }
    
    processedCount++;
  }

  // Then regenerate individual non-array fields
  for (let i = 0; i < individualFields.length; i++) {
    const fieldPath = individualFields[i];
    const field = getFieldByPath(fieldPath, fieldMap);

    if (!field) continue;

    progressCallback?.({
      stage: 'fixing',
      message: `Regenerating field: ${fieldPath}`,
      progress: Math.round((processedCount / totalFields) * 100),
      currentField: fieldPath,
      failedFields,
    });

    try {
      const context: FieldGenerationContext = {
        fieldPath,
        fieldType: field.type,
        parentContext: getParentContext(fieldPath, result) || undefined,
        siblingFields: getSiblingFields(fieldPath, result),
        description: field.description,
        constraints: field.logic,
      };

      const newValue = await generateFieldData(
        anthropic,
        field,
        context,
        userPrompt
      );
      setValueByPath(result, fieldPath, newValue);
    } catch (error) {
      // Field regeneration failure is handled gracefully with default values
      // Only log if it's not a common field generation error
      if (!(error instanceof Error && error.message.includes('No valid response'))) {
        console.error(`Failed to regenerate field ${fieldPath}:`, error);
      }
      // Set a default value based on field type
      setValueByPath(result, fieldPath, getDefaultValue(field));
    }
    
    processedCount++;
  }

  return result;
}

/**
 * Create a map of field paths to field definitions
 */
function createFieldMap(
  fields: SchemaField[],
  prefix = ''
): Record<string, SchemaField> {
  const map: Record<string, SchemaField> = {};

  for (const field of fields) {
    const path = prefix ? `${prefix}.${field.name}` : field.name;
    map[path] = field;

    if (field.children) {
      Object.assign(map, createFieldMap(field.children, path));
    }

    if (field.arrayItemType && field.arrayItemType.children) {
      Object.assign(
        map,
        createFieldMap(field.arrayItemType.children, `${path}[0]`)
      );
    }
  }

  return map;
}

/**
 * Get field definition by path
 */
function getFieldByPath(
  path: string,
  fieldMap: Record<string, SchemaField>
): SchemaField | null {
  // Handle array indices in path
  const normalizedPath = path.replace(/\[\d+\]/g, '[0]');
  return fieldMap[normalizedPath] || null;
}

/**
 * Set value at nested path
 */
function setValueByPath(
  obj: Record<string, unknown>,
  path: string,
  value: unknown
): void {
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
function getParentContext(
  path: string,
  data: Record<string, unknown>
): Record<string, unknown> | null {
  const parts = path.split('.');
  if (parts.length <= 1) return null;

  const parentPath = parts.slice(0, -1).join('.');
  let current: unknown = data;

  for (const part of parentPath.split('.')) {
    if (
      current &&
      typeof current === 'object' &&
      part in (current as Record<string, unknown>)
    ) {
      current = (current as Record<string, unknown>)[part];
    } else {
      return null;
    }
  }

  return current && typeof current === 'object'
    ? (current as Record<string, unknown>)
    : null;
}

/**
 * Get sibling fields for context
 */
function getSiblingFields(
  path: string,
  data: Record<string, unknown>
): Record<string, unknown> {
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
 * Generate full schema data (original approach)
 */
async function generateFullSchema(
  anthropic: Anthropic,
  schema: JsonSchema,
  prompt: string,
  count: number
): Promise<Record<string, unknown>[]> {
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
    messages: [{ role: 'user', content: prompt }],
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
    } catch {
      // Don't log JSON parsing errors - they're handled with proper error message
      throw new Error(`Invalid JSON response from Claude: ${cleanedJson.substring(0, 100)}...`);
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

/**
 * Group failed fields by array parent to identify which arrays need complete regeneration
 */
function groupArrayFields(failedFields: string[]): Set<string> {
  const arrayFields = new Set<string>();
  
  for (const fieldPath of failedFields) {
    const arrayParent = getArrayParent(fieldPath);
    if (arrayParent) {
      arrayFields.add(arrayParent);
    }
  }
  
  return arrayFields;
}

/**
 * Get the array parent field path from a failed field path
 * e.g., "departments.0" -> "departments", "departments.1.name" -> null (not direct array element)
 */
function getArrayParent(fieldPath: string): string | null {
  const parts = fieldPath.split('.');
  
  // Check if this is a direct array element (e.g., "departments.0", "departments.1")
  if (parts.length >= 2) {
    const lastPart = parts[parts.length - 1];
    // If the last part is a number, this is likely an array element
    if (/^\d+$/.test(lastPart)) {
      return parts.slice(0, -1).join('.');
    }
  }
  
  return null;
}

/**
 * Generate data for an array field using the correct structure template
 */
async function generateArrayFieldData(
  anthropic: Anthropic,
  field: SchemaField,
  fieldPath: string,
  schema: JsonSchema,
  userPrompt: string
): Promise<unknown> {
  // Generate the structure template for this specific array field
  const arrayStructure = convertFieldToJsonStructure(field);
  
  // Determine array size based on constraints or use defaults
  const minItems = field.logic?.minItems ?? 2;
  const maxItems = field.logic?.maxItems ?? 4;
  const itemCount = minItems === maxItems ? minItems : `${minItems}-${maxItems}`;
  
  const arrayPrompt = `Generate realistic data for the array field "${field.name}" matching this EXACT structure:
${JSON.stringify(arrayStructure, null, 2)}

CRITICAL REQUIREMENTS:
1. Generate ${itemCount} items for the array
2. MUST match the structure EXACTLY - preserve all nested array levels
3. If the structure shows nested arrays like [[...]], your response MUST have nested arrays
4. Generate realistic data based on field names and types
5. Consider the user's requirements: ${userPrompt}

IMPORTANT: Look at the structure above - if it contains nested arrays (arrays within arrays), your response must also contain nested arrays at the same levels. Return only valid JSON array, no explanations.`;

  try {
    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2000,
      messages: [{ role: 'user', content: arrayPrompt }],
    });

    const content = message.content[0];
    if (content.type === 'text') {
      let result = content.text.trim();
      
      // Clean up common formatting issues
      result = result.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      
      try {
        const parsed = JSON.parse(result);
        return Array.isArray(parsed) ? parsed : [parsed];
      } catch {
        // If JSON parsing fails, return a default array structure
        return getDefaultArrayValue(field);
      }
    }
  } catch (error) {
    console.error(`Failed to generate array data for ${fieldPath}:`, error);
  }

  // Fallback to default array value
  return getDefaultArrayValue(field);
}

/**
 * Convert a single field to its JSON structure representation
 */
export function convertFieldToJsonStructure(field: SchemaField): unknown {
  switch (field.type) {
    case 'text':
    case 'email':
    case 'url':
      return 'string';
    case 'number':
      return 'number';
    case 'boolean':
      return 'boolean';
    case 'date':
      return 'date';
    case 'array':
      if (field.arrayItemType) {
        if (field.arrayItemType.type === 'array') {
          // Handle nested arrays (array of arrays)
          if (field.arrayItemType.arrayItemType) {
            if (field.arrayItemType.arrayItemType.type === 'object' && field.arrayItemType.arrayItemType.children) {
              return [[convertSchemaToJsonStructure(field.arrayItemType.arrayItemType.children)]];
            } else {
              const itemType = field.arrayItemType.arrayItemType.type === 'text' ? 'string' : field.arrayItemType.arrayItemType.type;
              return [[itemType]];
            }
          } else {
            return [['string']];
          }
        } else if (field.arrayItemType.type === 'object' && field.arrayItemType.children) {
          return [convertSchemaToJsonStructure(field.arrayItemType.children)];
        } else {
          return [field.arrayItemType.type === 'text' ? 'string' : field.arrayItemType.type];
        }
      } else {
        return ['string'];
      }
    case 'object':
      if (field.children) {
        return convertSchemaToJsonStructure(field.children);
      } else {
        return {};
      }
    default:
      return 'string';
  }
}

/**
 * Get a default array value based on field structure
 */
export function getDefaultArrayValue(field: SchemaField): unknown[] {
  if (field.type !== 'array' || !field.arrayItemType) {
    return [];
  }

  // Determine array size based on constraints or use default of 1
  const minItems = field.logic?.minItems ?? 1;
  const arraySize = Math.max(1, minItems); // Ensure at least 1 item for default

  if (field.arrayItemType.type === 'array') {
    // Nested array - return array of arrays
    if (field.arrayItemType.arrayItemType?.type === 'object' && field.arrayItemType.arrayItemType.children) {
      const defaultObj: Record<string, unknown> = {};
      for (const child of field.arrayItemType.arrayItemType.children) {
        defaultObj[child.name] = getDefaultValue(child);
      }
      return Array(arraySize).fill(null).map(() => [defaultObj]);
    } else {
      return Array(arraySize).fill(null).map(() => ['']);
    }
  } else if (field.arrayItemType.type === 'object' && field.arrayItemType.children) {
    const defaultObj: Record<string, unknown> = {};
    for (const child of field.arrayItemType.children) {
      defaultObj[child.name] = getDefaultValue(child);
    }
    return Array(arraySize).fill(null).map(() => ({ ...defaultObj }));
  } else {
    return Array(arraySize).fill(null).map(() => getDefaultValue(field.arrayItemType!));
  }
}
