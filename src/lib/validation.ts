import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { JsonSchema, SchemaField } from '@/types/schema';
import { convertSchemaFieldToJson } from './schema';

// Initialize AJV with format support
const ajv = new Ajv({ allErrors: true, verbose: true });
addFormats(ajv);

export interface ValidationError {
  field: string;
  message: string;
  value: unknown;
  path: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  data?: Record<string, unknown>;
}

/**
 * Convert our schema format to JSON Schema format for AJV validation
 */
export function convertToJsonSchema(fields: SchemaField[]): Record<string, unknown> {
  const properties: Record<string, unknown> = {};
  const usedTopLevelKeys = new Set<string>();
  const required: string[] = [];

  fields.forEach((field) => {
    let keyName = field.name;

    // Handle duplicate keys by appending a number
    if (usedTopLevelKeys.has(keyName)) {
      let counter = 2;
      while (usedTopLevelKeys.has(`${keyName}_${counter}`)) {
        counter++;
      }
      keyName = `${keyName}_${counter}`;
    }

    usedTopLevelKeys.add(keyName);
    properties[keyName] = convertSchemaFieldToJson(field);
    if (field.logic?.required) {
      required.push(field.name);
    }
  });

  return {
    type: 'object',
    properties,
    required,
    additionalProperties: false
  };
}

/**
 * Convert a single field to JSON Schema property
 */
function convertFieldToJsonSchema(field: SchemaField): Record<string, unknown> {
  const property: Record<string, unknown> = {};

  switch (field.type) {
    case 'text':
      property.type = 'string';
      if (field.logic?.minLength) property.minLength = field.logic.minLength;
      if (field.logic?.maxLength) property.maxLength = field.logic.maxLength;
      if (field.logic?.pattern) property.pattern = field.logic.pattern;
      if (field.logic?.enum) property.enum = field.logic.enum;
      break;

    case 'email':
      property.type = 'string';
      property.format = 'email';
      break;

    case 'url':
      property.type = 'string';
      property.format = 'uri';
      break;

    case 'number':
      property.type = 'number';
      if (field.logic?.min !== undefined) property.minimum = field.logic.min;
      if (field.logic?.max !== undefined) property.maximum = field.logic.max;
      break;

    case 'boolean':
      property.type = 'boolean';
      break;

    case 'date':
      property.type = 'string';
      property.format = 'date-time';
      break;

    case 'array':
      property.type = 'array';
      if (field.logic?.minItems) property.minItems = field.logic.minItems;
      if (field.logic?.maxItems) property.maxItems = field.logic.maxItems;
      
      if (field.arrayItemType) {
        property.items = convertFieldToJsonSchema(field.arrayItemType);
      } else {
        property.items = { type: 'string' };
      }
      break;

    case 'object':
      property.type = 'object';
      if (field.children && field.children.length > 0) {
        const nestedSchema = convertToJsonSchema(field.children);
        property.properties = nestedSchema.properties;
        property.required = nestedSchema.required;
        property.additionalProperties = false;
      } else {
        property.additionalProperties = true;
      }
      break;
  }

  return property;
}

/**
 * Validate data against schema and return detailed results
 */
export function validateData(data: unknown, schema: JsonSchema): ValidationResult {
  try {
    const jsonSchema = convertToJsonSchema(schema.fields);
    const validate = ajv.compile(jsonSchema);
    const isValid = validate(data);

    if (isValid) {
      return { isValid: true, errors: [], data: data as Record<string, unknown> };
    }

    const errors: ValidationError[] = (validate.errors || []).map(error => ({
      field: error.instancePath.replace(/^\//, '').replace(/\//g, '.') || 'root',
      message: error.message || 'Validation error',
      value: error.data,
      path: error.instancePath || ''
    }));

    return { isValid: false, errors };
  } catch (error) {
    return {
      isValid: false,
      errors: [{
        field: 'schema',
        message: `Schema validation error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        value: data,
        path: ''
      }]
    };
  }
}

/**
 * Normalize common data format issues
 */
export function normalizeData(data: unknown, schema: JsonSchema): unknown {
  if (!data || typeof data !== 'object') return data;

  if (Array.isArray(data)) {
    return data.map(item => normalizeData(item, schema));
  }

  const normalized = { ...data as Record<string, unknown> };

  for (const field of schema.fields) {
    if (field.name in normalized) {
      normalized[field.name] = normalizeFieldValue(normalized[field.name], field);
    }
  }

  return normalized;
}

/**
 * Normalize a single field value based on its type
 */
function normalizeFieldValue(value: unknown, field: SchemaField): unknown {
  if (value === null || value === undefined) return value;

  try {
    switch (field.type) {
      case 'number':
        if (typeof value === 'string' && !isNaN(Number(value))) {
          return Number(value);
        }
        break;

      case 'boolean':
        if (typeof value === 'string') {
          const lower = value.toLowerCase();
          if (lower === 'true' || lower === '1') return true;
          if (lower === 'false' || lower === '0') return false;
        }
        break;

      case 'array':
        if (!Array.isArray(value)) {
          return [value];
        }
        // For arrays, only normalize individual items if they are objects or primitives
        // Do NOT try to fix structural issues like nested arrays
        if (field.arrayItemType && field.arrayItemType.type !== 'array') {
          return value.map(item => normalizeFieldValue(item, field.arrayItemType!));
        }
        // For nested arrays (array of arrays), don't normalize - let validation catch structural errors
        break;

      case 'object':
        if (typeof value === 'object' && !Array.isArray(value) && field.children) {
          const nestedSchema: JsonSchema = { name: '', fields: field.children };
          return normalizeData(value, nestedSchema);
        }
        break;

      case 'date':
        if (typeof value === 'string') {
          const date = new Date(value);
          if (!isNaN(date.getTime())) {
            return date.toISOString();
          }
        }
        break;
    }
  } catch (error) {
    console.warn(`Failed to normalize field ${field.name}:`, error);
  }

  return value;
}

/**
 * Get failed field paths from validation errors
 */
export function getFailedFields(errors: ValidationError[]): string[] {
  return [...new Set(errors.map(error => error.field).filter(field => field !== 'root'))];
}

/**
 * Group validation errors by field path
 */
export function groupErrorsByField(errors: ValidationError[]): Record<string, ValidationError[]> {
  return errors.reduce((groups, error) => {
    const field = error.field || 'root';
    if (!groups[field]) groups[field] = [];
    groups[field].push(error);
    return groups;
  }, {} as Record<string, ValidationError[]>);
}
