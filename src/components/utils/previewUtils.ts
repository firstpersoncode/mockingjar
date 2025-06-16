import { SchemaField } from '@/types/schema';

interface GenerateSchemaPreviewOptions {
  collapsedFields?: Set<string>;
}

export const generateSchemaPreview = (
  fields: SchemaField[],
  { collapsedFields = new Set() }: GenerateSchemaPreviewOptions = {}
): Record<string, unknown> => {
  const generateFieldPreview = (field: SchemaField): unknown => {
    switch (field.type) {
      case 'text':
      case 'email':
      case 'url':
        return field.logic?.enum
          ? `enum: [${field.logic.enum.join(', ')}]`
          : 'string';
      case 'number':
        return field.logic?.enum
          ? `enum: [${field.logic.enum.join(', ')}]`
          : 'number';
      case 'boolean':
        return 'boolean';
      case 'date':
        return 'date';
      case 'array':
        // Show collapsed indicator if field is collapsed and has arrayItemType
        if (collapsedFields.has(field.id) && field.arrayItemType) {
          return `[ ...1 item type ]`;
        }

        if (field.arrayItemType) {
          return [generateFieldPreview(field.arrayItemType)];
        }
        return ['any'];
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
            obj[keyName] = generateFieldPreview(child);
          });
        }
        return obj;
      default:
        return 'unknown';
    }
  };

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
    preview[keyName] = generateFieldPreview(field);
  });

  return preview;
};
