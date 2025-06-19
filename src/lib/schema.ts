import { SchemaField } from '@/types/schema';

interface GenerateSchemaPreviewOptions {
  collapsedFields?: Set<string>;
  forPreview?: boolean;
}

export const convertSchemaFieldToJson = (
  field: SchemaField,
  configs: GenerateSchemaPreviewOptions = {}
): unknown => {
  const { collapsedFields = new Set(), forPreview = false } = configs;
  switch (field.type) {
    case 'text':
      if (field.logic?.enum) {
        return `text enum: ${field.logic.enum.join(', ')}`;
      }
      if (field.logic?.pattern) {
        return `text pattern: ${field.logic.pattern}`;
      }
      if (field.logic?.minLength || field.logic?.maxLength) {
        const min = field.logic.minLength;
        const max = field.logic.maxLength;
        if (min && max) {
          return `text with minimum ${min} and maximum ${max} characters`;
        } else if (min) {
          return `text with minimum ${min} characters`;
        } else if (max) {
          return `text with maximum ${max} characters`;
        }
      }
      return 'text';
    case 'email':
      if (field.logic?.minLength || field.logic?.maxLength) {
        const min = field.logic.minLength;
        const max = field.logic.maxLength;
        if (min && max) {
          return `email with minimum ${min} and maximum ${max} characters`;
        } else if (min) {
          return `email with minimum ${min} characters`;
        } else if (max) {
          return `email with maximum ${max} characters`;
        }
      }
      return 'email';
    case 'url':
      return 'url';
    case 'number':
      if (field.logic?.enum) {
        return `number enum: ${field.logic.enum.join(', ')}`;
      }
      if (field.logic?.min !== undefined || field.logic?.max !== undefined) {
        const min = field.logic.min;
        const max = field.logic.max;
        if (min !== undefined && max !== undefined) {
          return `number between ${min} and ${max}`;
        } else if (min !== undefined) {
          return `number minimum ${min}`;
        } else if (max !== undefined) {
          return `number maximum ${max}`;
        }
      }
      return 'number';
    case 'boolean':
      return 'boolean';
    case 'date':
      return 'date';
    case 'array':
      const items = [];
      const logic = field.logic;
      
      // Generate minimum required items
      const minItems = logic?.minItems || 2;
      const maxItems = logic?.maxItems || 5;
      
      // Create sample items based on constraints
      const sampleCount = forPreview ? 1 : Math.min(minItems + 1, maxItems);
      for (let i = 0; i < sampleCount; i++) {
        items.push(convertSchemaFieldToJson(field.arrayItemType!, configs));
      }

      // Show collapsed indicator if field is collapsed and has arrayItemType
      if (collapsedFields.has(field.id) && field.arrayItemType) {
        return `[ ...${items.length} item${items.length !== 1 ? 's' : ''} ]`;
      }

      return items;
    case 'object':
      const obj: Record<string, unknown> = {};

      // Show collapsed indicator instead of children if field is collapsed
      if (
        collapsedFields.has(field.id) &&
        field.children &&
        field.children.length > 0
      ) {
        return `{ ...${field.children.length} field${
          field.children.length !== 1 ? 's' : ''
        } }`;
      }

      if (field.children && field.children.length > 0) {
        // Track used keys to handle duplicates
        const usedKeys = new Set<string>();

        field.children.forEach((child) => {
          let keyName = child.name;

          // Handle duplicate keys by appending a number
          if (usedKeys.has(keyName)) {
            let counter = 2;
            while (usedKeys.has(`${keyName}_${counter}`)) {
              counter++;
            }
            keyName = `${keyName}_${counter}`;
          }

          usedKeys.add(keyName);
          obj[keyName] = convertSchemaFieldToJson(child, configs);
        });
      }
      return obj;
    default:
      return 'unknown';
  }
};

export const convertSchemaToJson = (
  fields: SchemaField[],
  configs: GenerateSchemaPreviewOptions = {}
): Record<string, unknown> => {
  const preview: Record<string, unknown> = {};
  const usedTopLevelKeys = new Set<string>();

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
    preview[keyName] = convertSchemaFieldToJson(field, configs);
  });

  return preview;
};

/**
 * Find and update a field by ID anywhere in the nested structure
 */
export const findAndUpdateField = (
  fields: SchemaField[],
  targetId: string,
  updater: (field: SchemaField) => SchemaField
): SchemaField[] => {
  return fields.map((field) => {
    if (field.id === targetId) {
      return updater(field);
    }

    // Check children
    if (field.children) {
      const updatedChildren = findAndUpdateField(
        field.children,
        targetId,
        updater
      );
      if (updatedChildren !== field.children) {
        return { ...field, children: updatedChildren };
      }
    }

    // Check arrayItemType
    if (field.arrayItemType) {
      if (field.arrayItemType.id === targetId) {
        return { ...field, arrayItemType: updater(field.arrayItemType) };
      }

      // Check arrayItemType's children
      if (field.arrayItemType.children) {
        const updatedArrayItemChildren = findAndUpdateField(
          field.arrayItemType.children,
          targetId,
          updater
        );
        if (updatedArrayItemChildren !== field.arrayItemType.children) {
          return {
            ...field,
            arrayItemType: {
              ...field.arrayItemType,
              children: updatedArrayItemChildren,
            },
          };
        }
      }

      // Check nested arrayItemType (for Array -> Array scenarios)
      if (field.arrayItemType.arrayItemType) {
        const nestedResult = findAndUpdateField(
          [field.arrayItemType],
          targetId,
          updater
        );
        if (nestedResult[0] !== field.arrayItemType) {
          return { ...field, arrayItemType: nestedResult[0] };
        }
      }
    }

    return field;
  });
};

/**
 * Find and remove a field by ID anywhere in the nested structure
 */
export const findAndRemoveField = (
  fields: SchemaField[],
  targetId: string
): SchemaField[] => {
  return fields
    .filter((field) => field.id !== targetId)
    .map((field) => {
      // Check children
      if (field.children) {
        const updatedChildren = findAndRemoveField(field.children, targetId);
        if (updatedChildren.length !== field.children.length) {
          return { ...field, children: updatedChildren };
        }
      }

      // Check arrayItemType children
      if (field.arrayItemType?.children) {
        const updatedArrayItemChildren = findAndRemoveField(
          field.arrayItemType.children,
          targetId
        );
        if (
          updatedArrayItemChildren.length !==
          field.arrayItemType.children.length
        ) {
          return {
            ...field,
            arrayItemType: {
              ...field.arrayItemType,
              children: updatedArrayItemChildren,
            },
          };
        }
      }

      // Check nested arrayItemType
      if (field.arrayItemType?.arrayItemType) {
        const nestedResult = findAndRemoveField(
          [field.arrayItemType],
          targetId
        );
        if (
          nestedResult.length === 0 ||
          nestedResult[0] !== field.arrayItemType
        ) {
          return { ...field, arrayItemType: nestedResult[0] };
        }
      }

      return field;
    });
};
