import { SchemaField } from '@/types/schema';

/**
 * Find and update a field by ID anywhere in the nested structure
 */
export const findAndUpdateField = (
  fields: SchemaField[], 
  targetId: string, 
  updater: (field: SchemaField) => SchemaField
): SchemaField[] => {
  return fields.map(field => {
    if (field.id === targetId) {
      return updater(field);
    }
    
    // Check children
    if (field.children) {
      const updatedChildren = findAndUpdateField(field.children, targetId, updater);
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
        const updatedArrayItemChildren = findAndUpdateField(field.arrayItemType.children, targetId, updater);
        if (updatedArrayItemChildren !== field.arrayItemType.children) {
          return {
            ...field,
            arrayItemType: {
              ...field.arrayItemType,
              children: updatedArrayItemChildren
            }
          };
        }
      }
      
      // Check nested arrayItemType (for Array -> Array scenarios)
      if (field.arrayItemType.arrayItemType) {
        const nestedResult = findAndUpdateField([field.arrayItemType], targetId, updater);
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
export const findAndRemoveField = (fields: SchemaField[], targetId: string): SchemaField[] => {
  return fields.filter(field => field.id !== targetId).map(field => {
    // Check children
    if (field.children) {
      const updatedChildren = findAndRemoveField(field.children, targetId);
      if (updatedChildren.length !== field.children.length) {
        return { ...field, children: updatedChildren };
      }
    }
    
    // Check arrayItemType children
    if (field.arrayItemType?.children) {
      const updatedArrayItemChildren = findAndRemoveField(field.arrayItemType.children, targetId);
      if (updatedArrayItemChildren.length !== field.arrayItemType.children.length) {
        return {
          ...field,
          arrayItemType: {
            ...field.arrayItemType,
            children: updatedArrayItemChildren
          }
        };
      }
    }
    
    // Check nested arrayItemType
    if (field.arrayItemType?.arrayItemType) {
      const nestedResult = findAndRemoveField([field.arrayItemType], targetId);
      if (nestedResult.length === 0 || nestedResult[0] !== field.arrayItemType) {
        return { ...field, arrayItemType: nestedResult[0] };
      }
    }
    
    return field;
  });
};
