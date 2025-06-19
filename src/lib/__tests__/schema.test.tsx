import { SchemaField } from '@/types/schema';
import { v4 as uuidv4 } from 'uuid';
import { findAndUpdateField, findAndRemoveField, convertSchemaFieldToJson, convertSchemaToJson } from '../schema';

// Mock the hooks
jest.mock('@/hooks/useSchemas', () => ({
  useSaveSchema: () => ({
    mutateAsync: jest.fn(),
    isPending: false,
    isError: false,
    isSuccess: false,
  }),
}));

// Mock Material-UI theme hook
jest.mock('@mui/material', () => ({
  ...jest.requireActual('@mui/material'),
  useTheme: () => ({
    breakpoints: {
      down: () => false,
    },
  }),
  useMediaQuery: () => false,
}));

// Test the actual field management logic by accessing the component's internal state
describe('SchemaBuilder Field Management Logic', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Field Operations', () => {
    test('should find and update top-level field', () => {
      const fieldId = uuidv4();
      const fields: SchemaField[] = [
        {
          id: fieldId,
          name: 'testField',
          type: 'text',
          logic: { required: false }
        }
      ];

      const result = findAndUpdateField(fields, fieldId, (field) => ({
        ...field,
        name: 'updatedField'
      }));

      expect(result[0].name).toBe('updatedField');
      expect(result[0].id).toBe(fieldId);
    });

    test('should find and remove top-level field', () => {
      const fieldId = uuidv4();
      const fields: SchemaField[] = [
        {
          id: fieldId,
          name: 'testField',
          type: 'text',
          logic: { required: false }
        },
        {
          id: uuidv4(),
          name: 'keepField',
          type: 'text',
          logic: { required: false }
        }
      ];

      const result = findAndRemoveField(fields, fieldId);

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('keepField');
    });
  });

  describe('Object Fields with Children', () => {
    test('should find and update child field', () => {
      const parentId = uuidv4();
      const childId = uuidv4();
      const fields: SchemaField[] = [
        {
          id: parentId,
          name: 'parentObject',
          type: 'object',
          logic: { required: false },
          children: [
            {
              id: childId,
              name: 'childField',
              type: 'text',
              logic: { required: false }
            }
          ]
        }
      ];

      const result = findAndUpdateField(fields, childId, (field) => ({
        ...field,
        name: 'updatedChild'
      }));

      expect(result[0].children![0].name).toBe('updatedChild');
      expect(result[0].children![0].id).toBe(childId);
    });

    test('should find and remove child field', () => {
      const parentId = uuidv4();
      const childId = uuidv4();
      const keepChildId = uuidv4();
      const fields: SchemaField[] = [
        {
          id: parentId,
          name: 'parentObject',
          type: 'object',
          logic: { required: false },
          children: [
            {
              id: childId,
              name: 'removeChild',
              type: 'text',
              logic: { required: false }
            },
            {
              id: keepChildId,
              name: 'keepChild',
              type: 'text',
              logic: { required: false }
            }
          ]
        }
      ];

      const result = findAndRemoveField(fields, childId);

      expect(result[0].children).toHaveLength(1);
      expect(result[0].children![0].name).toBe('keepChild');
    });

    test('should handle deeply nested children', () => {
      const parentId = uuidv4();
      const childId = uuidv4();
      const grandchildId = uuidv4();
      const fields: SchemaField[] = [
        {
          id: parentId,
          name: 'parent',
          type: 'object',
          logic: { required: false },
          children: [
            {
              id: childId,
              name: 'child',
              type: 'object',
              logic: { required: false },
              children: [
                {
                  id: grandchildId,
                  name: 'grandchild',
                  type: 'text',
                  logic: { required: false }
                }
              ]
            }
          ]
        }
      ];

      const result = findAndUpdateField(fields, grandchildId, (field) => ({
        ...field,
        name: 'updatedGrandchild'
      }));

      expect(result[0].children![0].children![0].name).toBe('updatedGrandchild');
    });
  });

  describe('Array Fields', () => {
    test('should find and update array item type', () => {
      const arrayId = uuidv4();
      const itemId = uuidv4();
      const fields: SchemaField[] = [
        {
          id: arrayId,
          name: 'arrayField',
          type: 'array',
          logic: { required: false },
          arrayItemType: {
            id: itemId,
            name: 'item',
            type: 'text',
            logic: { required: false }
          }
        }
      ];

      const result = findAndUpdateField(fields, itemId, (field) => ({
        ...field,
        type: 'number'
      }));

      expect(result[0].arrayItemType!.type).toBe('number');
    });

    test('should handle Array -> Object structure', () => {
      const arrayId = uuidv4();
      const itemId = uuidv4();
      const childId = uuidv4();
      const fields: SchemaField[] = [
        {
          id: arrayId,
          name: 'arrayField',
          type: 'array',
          logic: { required: false },
          arrayItemType: {
            id: itemId,
            name: 'item',
            type: 'object',
            logic: { required: false },
            children: [
              {
                id: childId,
                name: 'objectChild',
                type: 'text',
                logic: { required: false }
              }
            ]
          }
        }
      ];

      const result = findAndUpdateField(fields, childId, (field) => ({
        ...field,
        name: 'updatedObjectChild'
      }));

      expect(result[0].arrayItemType!.children![0].name).toBe('updatedObjectChild');
    });

    test('should handle Array -> Array -> Object structure (nested arrays)', () => {
      const outerArrayId = uuidv4();
      const innerArrayId = uuidv4();
      const objectId = uuidv4();
      const childId = uuidv4();
      const fields: SchemaField[] = [
        {
          id: outerArrayId,
          name: 'outerArray',
          type: 'array',
          logic: { required: false },
          arrayItemType: {
            id: innerArrayId,
            name: 'innerArray',
            type: 'array',
            logic: { required: false },
            arrayItemType: {
              id: objectId,
              name: 'deepObject',
              type: 'object',
              logic: { required: false },
              children: [
                {
                  id: childId,
                  name: 'deepChild',
                  type: 'text',
                  logic: { required: false }
                }
              ]
            }
          }
        }
      ];

      // Test updating the deeply nested child
      const result = findAndUpdateField(fields, childId, (field) => ({
        ...field,
        name: 'updatedDeepChild'
      }));

      expect(result[0].arrayItemType!.arrayItemType!.children![0].name).toBe('updatedDeepChild');
    });

    test('should handle removing fields from nested array structure', () => {
      const outerArrayId = uuidv4();
      const innerArrayId = uuidv4();
      const objectId = uuidv4();
      const childId = uuidv4();
      const keepChildId = uuidv4();
      const fields: SchemaField[] = [
        {
          id: outerArrayId,
          name: 'outerArray',
          type: 'array',
          logic: { required: false },
          arrayItemType: {
            id: innerArrayId,
            name: 'innerArray',
            type: 'array',
            logic: { required: false },
            arrayItemType: {
              id: objectId,
              name: 'deepObject',
              type: 'object',
              logic: { required: false },
              children: [
                {
                  id: childId,
                  name: 'removeChild',
                  type: 'text',
                  logic: { required: false }
                },
                {
                  id: keepChildId,
                  name: 'keepChild',
                  type: 'text',
                  logic: { required: false }
                }
              ]
            }
          }
        }
      ];

      const result = findAndRemoveField(fields, childId);

      expect(result[0].arrayItemType!.arrayItemType!.children).toHaveLength(1);
      expect(result[0].arrayItemType!.arrayItemType!.children![0].name).toBe('keepChild');
    });
  });

  describe('Complex Nested Scenarios', () => {
    test('should handle Object -> Array -> Object -> Array structure', () => {
      const parentObjectId = uuidv4();
      const arrayId = uuidv4();
      const arrayObjectId = uuidv4();
      const nestedArrayId = uuidv4();
      const deepItemId = uuidv4();
      
      const fields: SchemaField[] = [
        {
          id: parentObjectId,
          name: 'parentObject',
          type: 'object',
          logic: { required: false },
          children: [
            {
              id: arrayId,
              name: 'arrayField',
              type: 'array',
              logic: { required: false },
              arrayItemType: {
                id: arrayObjectId,
                name: 'arrayObject',
                type: 'object',
                logic: { required: false },
                children: [
                  {
                    id: nestedArrayId,
                    name: 'nestedArray',
                    type: 'array',
                    logic: { required: false },
                    arrayItemType: {
                      id: deepItemId,
                      name: 'deepItem',
                      type: 'text',
                      logic: { required: false }
                    }
                  }
                ]
              }
            }
          ]
        }
      ];

      const result = findAndUpdateField(fields, deepItemId, (field) => ({
        ...field,
        name: 'updatedDeepItem'
      }));

      const updatedDeepItem = result[0].children![0].arrayItemType!.children![0].arrayItemType!;
      expect(updatedDeepItem.name).toBe('updatedDeepItem');
    });

    test('should maintain field relationships during updates', () => {
      const parentId = uuidv4();
      const arrayId = uuidv4();
      const itemId = uuidv4();
      const childId = uuidv4();
      
      const fields: SchemaField[] = [
        {
          id: parentId,
          name: 'parent',
          type: 'object',
          logic: { required: false },
          children: [
            {
              id: arrayId,
              name: 'arrayField',
              type: 'array',
              logic: { required: false },
              arrayItemType: {
                id: itemId,
                name: 'item',
                type: 'object',
                logic: { required: false },
                children: [
                  {
                    id: childId,
                    name: 'child',
                    type: 'text',
                    logic: { required: false }
                  }
                ]
              }
            }
          ]
        }
      ];

      // Update the child field
      const result = findAndUpdateField(fields, childId, (field) => ({
        ...field,
        name: 'updatedChild',
        type: 'number'
      }));

      // Verify the update occurred
      expect(result[0].children![0].arrayItemType!.children![0].name).toBe('updatedChild');
      expect(result[0].children![0].arrayItemType!.children![0].type).toBe('number');

      // Verify parent relationships are maintained
      expect(result[0].name).toBe('parent');
      expect(result[0].children![0].name).toBe('arrayField');
      expect(result[0].children![0].arrayItemType!.name).toBe('item');
    });

    test('should handle field type changes that affect structure', () => {
      const parentId = uuidv4();
      const fields: SchemaField[] = [
        {
          id: parentId,
          name: 'parent',
          type: 'object',
          logic: { required: false },
          children: [
            {
              id: uuidv4(),
              name: 'child1',
              type: 'text',
              logic: { required: false }
            }
          ]
        }
      ];

      // Change object to text (should lose children)
      const result = findAndUpdateField(fields, parentId, (field) => ({
        ...field,
        type: 'text',
        children: undefined // Simulate type change logic
      }));

      expect(result[0].type).toBe('text');
      expect(result[0].children).toBeUndefined();
    });
  });

  describe('Edge Cases and Error Handling', () => {
    test('should handle empty fields array', () => {
      const result = findAndUpdateField([], 'nonexistent', (field) => field);
      expect(result).toEqual([]);
    });

    test('should handle nonexistent field ID', () => {
      const fieldId = uuidv4();
      const fields: SchemaField[] = [
        {
          id: fieldId,
          name: 'testField',
          type: 'text',
          logic: { required: false }
        }
      ];

      const result = findAndUpdateField(fields, 'nonexistent', (field) => ({
        ...field,
        name: 'shouldNotChange'
      }));

      expect(result[0].name).toBe('testField'); // Should remain unchanged
    });

    test('should handle fields without children or arrayItemType', () => {
      const fieldId = uuidv4();
      const fields: SchemaField[] = [
        {
          id: fieldId,
          name: 'simpleField',
          type: 'text',
          logic: { required: false }
          // No children or arrayItemType
        }
      ];

      const result = findAndUpdateField(fields, fieldId, (field) => ({
        ...field,
        name: 'updatedSimple'
      }));

      expect(result[0].name).toBe('updatedSimple');
    });

    test('should handle array without arrayItemType', () => {
      const fieldId = uuidv4();
      const fields: SchemaField[] = [
        {
          id: fieldId,
          name: 'arrayField',
          type: 'array',
          logic: { required: false }
          // No arrayItemType
        }
      ];

      const result = findAndUpdateField(fields, fieldId, (field) => ({
        ...field,
        name: 'updatedArray'
      }));

      expect(result[0].name).toBe('updatedArray');
    });

    test('should handle object without children', () => {
      const fieldId = uuidv4();
      const fields: SchemaField[] = [
        {
          id: fieldId,
          name: 'objectField',
          type: 'object',
          logic: { required: false }
          // No children
        }
      ];

      const result = findAndUpdateField(fields, fieldId, (field) => ({
        ...field,
        name: 'updatedObject'
      }));

      expect(result[0].name).toBe('updatedObject');
    });
  });

  describe('Performance Considerations', () => {
    test('should handle large nested structures efficiently', () => {
      // Create a structure with multiple levels and many fields
      const createDeepStructure = (depth: number, breadth: number): SchemaField[] => {
        if (depth === 0) {
          return Array.from({ length: breadth }, (_, i) => ({
            id: uuidv4(),
            name: `leaf-${i}`,
            type: 'text' as const,
            logic: { required: false }
          }));
        }

        return Array.from({ length: breadth }, (_, i) => ({
          id: uuidv4(),
          name: `node-${depth}-${i}`,
          type: 'object' as const,
          logic: { required: false },
          children: createDeepStructure(depth - 1, breadth)
        }));
      };

      const fields = createDeepStructure(3, 3); // 3 levels deep, 3 children each
      const targetId = fields[0].children![0].children![0].id; // Deep nested field

      const start = performance.now();
      const result = findAndUpdateField(fields, targetId, (field) => ({
        ...field,
        name: 'updatedDeepField'
      }));
      const end = performance.now();

      expect(result[0].children![0].children![0].name).toBe('updatedDeepField');
      expect(end - start).toBeLessThan(100); // Should complete in under 100ms
    });
  });

  describe('Deeply Nested Array Edge Cases (Bug Fixes)', () => {
    test('should handle Array -> Array -> Array structure', () => {
      const outerArrayId = uuidv4();
      const middleArrayId = uuidv4();
      const innerArrayId = uuidv4();
      const deepestItemId = uuidv4();
      
      const fields: SchemaField[] = [
        {
          id: outerArrayId,
          name: 'outerArray',
          type: 'array',
          logic: { required: false },
          arrayItemType: {
            id: middleArrayId,
            name: 'middleArray',
            type: 'array',
            logic: { required: false },
            arrayItemType: {
              id: innerArrayId,
              name: 'innerArray',
              type: 'array',
              logic: { required: false },
              arrayItemType: {
                id: deepestItemId,
                name: 'deepestItem',
                type: 'text',
                logic: { required: false }
              }
            }
          }
        }
      ];

      // Test updating the deepest nested array item type
      const result = findAndUpdateField(fields, innerArrayId, (field) => ({
        ...field,
        arrayItemType: {
          ...field.arrayItemType!,
          type: 'number'
        }
      }));

      expect(result[0].arrayItemType!.arrayItemType!.arrayItemType!.type).toBe('number');
    });

    test('should handle Array -> Array -> Object -> Array -> Array structure', () => {
      const outerArrayId = uuidv4();
      const middleArrayId = uuidv4();
      const objectId = uuidv4();
      const innerArrayId = uuidv4();
      const deepestArrayId = uuidv4();
      const finalItemId = uuidv4();
      
      const fields: SchemaField[] = [
        {
          id: outerArrayId,
          name: 'outerArray',
          type: 'array',
          logic: { required: false },
          arrayItemType: {
            id: middleArrayId,
            name: 'middleArray', 
            type: 'array',
            logic: { required: false },
            arrayItemType: {
              id: objectId,
              name: 'objectItem',
              type: 'object',
              logic: { required: false },
              children: [
                {
                  id: innerArrayId,
                  name: 'innerArray',
                  type: 'array',
                  logic: { required: false },
                  arrayItemType: {
                    id: deepestArrayId,
                    name: 'deepestArray',
                    type: 'array',
                    logic: { required: false },
                    arrayItemType: {
                      id: finalItemId,
                      name: 'finalItem',
                      type: 'text',
                      logic: { required: false }
                    }
                  }
                }
              ]
            }
          }
        }
      ];

      // Test updating the deepest nested array item type
      const result = findAndUpdateField(fields, deepestArrayId, (field) => ({
        ...field,
        arrayItemType: {
          ...field.arrayItemType!,
          type: 'boolean'
        }
      }));

      const updatedDeepestItem = result[0].arrayItemType!.arrayItemType!.children![0].arrayItemType!.arrayItemType!;
      expect(updatedDeepestItem.type).toBe('boolean');
    });

    test('should handle Object -> Array -> Array -> Array structure', () => {
      const parentObjectId = uuidv4();
      const outerArrayId = uuidv4();
      const middleArrayId = uuidv4();
      const innerArrayId = uuidv4();
      const deepItemId = uuidv4();
      
      const fields: SchemaField[] = [
        {
          id: parentObjectId,
          name: 'parentObject',
          type: 'object',
          logic: { required: false },
          children: [
            {
              id: outerArrayId,
              name: 'outerArray',
              type: 'array',
              logic: { required: false },
              arrayItemType: {
                id: middleArrayId,
                name: 'middleArray',
                type: 'array',
                logic: { required: false },
                arrayItemType: {
                  id: innerArrayId,
                  name: 'innerArray',
                  type: 'array',
                  logic: { required: false },
                  arrayItemType: {
                    id: deepItemId,
                    name: 'deepItem',
                    type: 'text',
                    logic: { required: false }
                  }
                }
              }
            }
          ]
        }
      ];

      // Test updating the inner array item type to object
      const result = findAndUpdateField(fields, innerArrayId, (field) => ({
        ...field,
        arrayItemType: {
          id: uuidv4(),
          name: 'objectItem',
          type: 'object',
          logic: { required: false },
          children: []
        }
      }));

      expect(result[0].children![0].arrayItemType!.arrayItemType!.arrayItemType!.type).toBe('object');
      expect(result[0].children![0].arrayItemType!.arrayItemType!.arrayItemType!.children).toEqual([]);
    });

    test('should handle Array -> Array -> Object -> Object -> Array -> Array structure', () => {
      const outerArrayId = uuidv4();
      const middleArrayId = uuidv4();
      const outerObjectId = uuidv4();
      const innerObjectId = uuidv4();
      const innerArrayId = uuidv4();
      const deepestArrayId = uuidv4();
      const finalItemId = uuidv4();
      
      const fields: SchemaField[] = [
        {
          id: outerArrayId,
          name: 'outerArray',
          type: 'array',
          logic: { required: false },
          arrayItemType: {
            id: middleArrayId,
            name: 'middleArray',
            type: 'array',
            logic: { required: false },
            arrayItemType: {
              id: outerObjectId,
              name: 'outerObject',
              type: 'object',
              logic: { required: false },
              children: [
                {
                  id: innerObjectId,
                  name: 'innerObject',
                  type: 'object',
                  logic: { required: false },
                  children: [
                    {
                      id: innerArrayId,
                      name: 'innerArray',
                      type: 'array',
                      logic: { required: false },
                      arrayItemType: {
                        id: deepestArrayId,
                        name: 'deepestArray',
                        type: 'array',
                        logic: { required: false },
                        arrayItemType: {
                          id: finalItemId,
                          name: 'finalItem',
                          type: 'email',
                          logic: { required: false }
                        }
                      }
                    }
                  ]
                }
              ]
            }
          }
        }
      ];

      // Test updating the deepest array item
      const result = findAndUpdateField(fields, deepestArrayId, (field) => ({
        ...field,
        arrayItemType: {
          ...field.arrayItemType!,
          type: 'url'
        }
      }));

      const finalItem = result[0].arrayItemType!.arrayItemType!.children![0].children![0].arrayItemType!.arrayItemType!;
      expect(finalItem.type).toBe('url');
    });

    test('should update nested array item types without affecting parent structures', () => {
      const outerArrayId = uuidv4();
      const innerArrayId = uuidv4();
      const itemId = uuidv4();
      
      const fields: SchemaField[] = [
        {
          id: outerArrayId,
          name: 'outerArray',
          type: 'array',
          logic: { required: false, minItems: 1, maxItems: 10 },
          arrayItemType: {
            id: innerArrayId,
            name: 'innerArray',
            type: 'array',
            logic: { required: true, minItems: 0, maxItems: 5 },
            arrayItemType: {
              id: itemId,
              name: 'item',
              type: 'text',
              logic: { required: false, minLength: 1, maxLength: 50 }
            }
          }
        }
      ];

      // Update inner array item type
      const result = findAndUpdateField(fields, innerArrayId, (field) => ({
        ...field,
        arrayItemType: {
          ...field.arrayItemType!,
          type: 'number',
          logic: { required: false, min: 0, max: 100 }
        }
      }));

      // Check that the update worked
      expect(result[0].arrayItemType!.arrayItemType!.type).toBe('number');
      expect(result[0].arrayItemType!.arrayItemType!.logic?.min).toBe(0);
      expect(result[0].arrayItemType!.arrayItemType!.logic?.max).toBe(100);

      // Check that parent structures are preserved
      expect(result[0].name).toBe('outerArray');
      expect(result[0].type).toBe('array');
      expect(result[0].logic?.minItems).toBe(1);
      expect(result[0].logic?.maxItems).toBe(10);
      expect(result[0].arrayItemType!.name).toBe('innerArray');
      expect(result[0].arrayItemType!.type).toBe('array');
      expect(result[0].arrayItemType!.logic?.required).toBe(true);
      expect(result[0].arrayItemType!.logic?.minItems).toBe(0);
      expect(result[0].arrayItemType!.logic?.maxItems).toBe(5);
    });

    test('should handle switching from primitive to complex types in nested arrays', () => {
      const outerArrayId = uuidv4();
      const innerArrayId = uuidv4();
      const itemId = uuidv4();
      
      const fields: SchemaField[] = [
        {
          id: outerArrayId,
          name: 'outerArray',
          type: 'array',
          logic: { required: false },
          arrayItemType: {
            id: innerArrayId,
            name: 'innerArray',
            type: 'array',
            logic: { required: false },
            arrayItemType: {
              id: itemId,
              name: 'item',
              type: 'text',
              logic: { required: false }
            }
          }
        }
      ];

      // Change inner array item type from text to object
      const newObjectId = uuidv4();
      const newChildId = uuidv4();
      const result = findAndUpdateField(fields, innerArrayId, (field) => ({
        ...field,
        arrayItemType: {
          id: newObjectId,
          name: 'objectItem',
          type: 'object',
          logic: { required: false },
          children: [
            {
              id: newChildId,
              name: 'newChild',
              type: 'text',
              logic: { required: false }
            }
          ]
        }
      }));

      expect(result[0].arrayItemType!.arrayItemType!.type).toBe('object');
      expect(result[0].arrayItemType!.arrayItemType!.children).toHaveLength(1);
      expect(result[0].arrayItemType!.arrayItemType!.children![0].name).toBe('newChild');
    });
  });

  // Add comprehensive tests for convertSchemaFieldToJson
  describe('convertSchemaFieldToJson Enhanced Tests', () => {
    describe('Text Field Tests', () => {
      test('should handle text field with enum values', () => {
        const field: SchemaField = {
          id: uuidv4(),
          name: 'status',
          type: 'text',
          logic: {
            enum: ['APPROVED', 'REVIEW', 'PUBLISHED']
          }
        };
        
        const result = convertSchemaFieldToJson(field);
        expect(result).toBe('text enum: APPROVED, REVIEW, PUBLISHED');
      });

      test('should handle text field with min and max length', () => {
        const field: SchemaField = {
          id: uuidv4(),
          name: 'title',
          type: 'text',
          logic: {
            minLength: 5,
            maxLength: 100
          }
        };
        
        const result = convertSchemaFieldToJson(field);
        expect(result).toBe('text with minimum 5 and maximum 100 characters');
      });

      test('should handle text field with only min length', () => {
        const field: SchemaField = {
          id: uuidv4(),
          name: 'description',
          type: 'text',
          logic: {
            minLength: 50
          }
        };
        
        const result = convertSchemaFieldToJson(field);
        expect(result).toBe('text with minimum 50 characters');
      });

      test('should handle text field with only max length', () => {
        const field: SchemaField = {
          id: uuidv4(),
          name: 'summary',
          type: 'text',
          logic: {
            maxLength: 200
          }
        };
        
        const result = convertSchemaFieldToJson(field);
        expect(result).toBe('text with maximum 200 characters');
      });

      test('should handle text field with pattern', () => {
        const field: SchemaField = {
          id: uuidv4(),
          name: 'code',
          type: 'text',
          logic: {
            pattern: '^[A-Z]{3}-[0-9]{3}$'
          }
        };
        
        const result = convertSchemaFieldToJson(field);
        expect(result).toBe('text pattern: ^[A-Z]{3}-[0-9]{3}$');
      });

      test('should handle basic text field without constraints', () => {
        const field: SchemaField = {
          id: uuidv4(),
          name: 'note',
          type: 'text'
        };
        
        const result = convertSchemaFieldToJson(field);
        expect(result).toBe('text');
      });
    });

    describe('Email Field Tests', () => {
      test('should handle email field with length constraints', () => {
        const field: SchemaField = {
          id: uuidv4(),
          name: 'email',
          type: 'email',
          logic: {
            minLength: 5,
            maxLength: 50
          }
        };
        
        const result = convertSchemaFieldToJson(field);
        expect(result).toBe('email with minimum 5 and maximum 50 characters');
      });

      test('should handle basic email field', () => {
        const field: SchemaField = {
          id: uuidv4(),
          name: 'contactEmail',
          type: 'email'
        };
        
        const result = convertSchemaFieldToJson(field);
        expect(result).toBe('email');
      });
    });

    describe('Number Field Tests', () => {
      test('should handle number field with enum values', () => {
        const field: SchemaField = {
          id: uuidv4(),
          name: 'rating',
          type: 'number',
          logic: {
            enum: ['1', '2', '3', '4', '5']
          }
        };
        
        const result = convertSchemaFieldToJson(field);
        expect(result).toBe('number enum: 1, 2, 3, 4, 5');
      });

      test('should handle number field with min and max values', () => {
        const field: SchemaField = {
          id: uuidv4(),
          name: 'age',
          type: 'number',
          logic: {
            min: 18,
            max: 65
          }
        };
        
        const result = convertSchemaFieldToJson(field);
        expect(result).toBe('number between 18 and 65');
      });

      test('should handle number field with only min value', () => {
        const field: SchemaField = {
          id: uuidv4(),
          name: 'price',
          type: 'number',
          logic: {
            min: 0
          }
        };
        
        const result = convertSchemaFieldToJson(field);
        expect(result).toBe('number minimum 0');
      });

      test('should handle number field with only max value', () => {
        const field: SchemaField = {
          id: uuidv4(),
          name: 'discount',
          type: 'number',
          logic: {
            max: 100
          }
        };
        
        const result = convertSchemaFieldToJson(field);
        expect(result).toBe('number maximum 100');
      });
    });

    describe('Array Field Tests', () => {
      test('should handle array with text items and constraints', () => {
        const field: SchemaField = {
          id: uuidv4(),
          name: 'tags',
          type: 'array',
          logic: {
            minItems: 2,
            maxItems: 5
          },
          arrayItemType: {
            id: uuidv4(),
            name: 'tag',
            type: 'text',
            logic: {
              minLength: 3,
              maxLength: 20
            }
          }
        };
        
        const result = convertSchemaFieldToJson(field) as unknown[];
        expect(Array.isArray(result)).toBe(true);
        expect(result.length).toBe(3); // min + 1, but not exceeding max
        expect(result[0]).toBe('text with minimum 3 and maximum 20 characters');
      });

      test('should handle nested array structure', () => {
        const field: SchemaField = {
          id: uuidv4(),
          name: 'matrix',
          type: 'array',
          logic: {
            minItems: 2,
            maxItems: 3
          },
          arrayItemType: {
            id: uuidv4(),
            name: 'row',
            type: 'array',
            logic: {
              minItems: 2,
              maxItems: 4
            },
            arrayItemType: {
              id: uuidv4(),
              name: 'cell',
              type: 'number'
            }
          }
        };
        
        const result = convertSchemaFieldToJson(field) as unknown[][];
        expect(Array.isArray(result)).toBe(true);
        expect(result.length).toBe(3);
        expect(Array.isArray(result[0])).toBe(true);
        expect(result[0].length).toBe(3);
        expect(result[0][0]).toBe('number');
      });

      test('should handle array of objects', () => {
        const field: SchemaField = {
          id: uuidv4(),
          name: 'users',
          type: 'array',
          logic: {
            minItems: 1,
            maxItems: 3
          },
          arrayItemType: {
            id: uuidv4(),
            name: 'user',
            type: 'object',
            children: [
              {
                id: uuidv4(),
                name: 'name',
                type: 'text',
                logic: { minLength: 2, maxLength: 50 }
              },
              {
                id: uuidv4(),
                name: 'email',
                type: 'email'
              }
            ]
          }
        };
        
        const result = convertSchemaFieldToJson(field) as unknown[];
        expect(Array.isArray(result)).toBe(true);
        expect(result.length).toBe(2); // min + 1
        expect(typeof result[0]).toBe('object');
        const userObj = result[0] as Record<string, unknown>;
        expect(userObj.name).toBe('text with minimum 2 and maximum 50 characters');
        expect(userObj.email).toBe('email');
      });

      test('should handle collapsed array display', () => {
        const field: SchemaField = {
          id: 'collapsed-array',
          name: 'items',
          type: 'array',
          arrayItemType: {
            id: uuidv4(),
            name: 'item',
            type: 'text'
          }
        };
        
        const collapsedFields = new Set(['collapsed-array']);
        const result = convertSchemaFieldToJson(field, { collapsedFields });
        expect(result).toBe('[ ...3 items ]');
      });
    });

    describe('Object Field Tests', () => {
      test('should handle complex nested object structure', () => {
        const field: SchemaField = {
          id: uuidv4(),
          name: 'user',
          type: 'object',
          children: [
            {
              id: uuidv4(),
              name: 'profile',
              type: 'object',
              children: [
                {
                  id: uuidv4(),
                  name: 'name',
                  type: 'text',
                  logic: { minLength: 2, maxLength: 100 }
                },
                {
                  id: uuidv4(),
                  name: 'age',
                  type: 'number',
                  logic: { min: 18, max: 120 }
                }
              ]
            },
            {
              id: uuidv4(),
              name: 'settings',
              type: 'object',
              children: [
                {
                  id: uuidv4(),
                  name: 'theme',
                  type: 'text',
                  logic: { enum: ['light', 'dark'] }
                }
              ]
            }
          ]
        };
        
        const result = convertSchemaFieldToJson(field) as Record<string, unknown>;
        expect(typeof result).toBe('object');
        expect(result.profile).toBeDefined();
        expect(result.settings).toBeDefined();
        
        const profile = result.profile as Record<string, unknown>;
        expect(profile.name).toBe('text with minimum 2 and maximum 100 characters');
        expect(profile.age).toBe('number between 18 and 120');
        
        const settings = result.settings as Record<string, unknown>;
        expect(settings.theme).toBe('text enum: light, dark');
      });

      test('should handle collapsed object display', () => {
        const field: SchemaField = {
          id: 'collapsed-object',
          name: 'config',
          type: 'object',
          children: [
            { id: uuidv4(), name: 'field1', type: 'text' },
            { id: uuidv4(), name: 'field2', type: 'number' },
            { id: uuidv4(), name: 'field3', type: 'boolean' }
          ]
        };
        
        const collapsedFields = new Set(['collapsed-object']);
        const result = convertSchemaFieldToJson(field, { collapsedFields });
        expect(result).toBe('{ ...3 fields }');
      });

      test('should handle duplicate field names', () => {
        const field: SchemaField = {
          id: uuidv4(),
          name: 'container',
          type: 'object',
          children: [
            { id: uuidv4(), name: 'item', type: 'text' },
            { id: uuidv4(), name: 'item', type: 'number' },
            { id: uuidv4(), name: 'item', type: 'boolean' }
          ]
        };
        
        const result = convertSchemaFieldToJson(field) as Record<string, unknown>;
        expect(result.item).toBe('text');
        expect(result.item_2).toBe('number');
        expect(result.item_3).toBe('boolean');
      });
    });

    describe('Edge Cases and Error Handling', () => {
      test('should handle empty object without children', () => {
        const field: SchemaField = {
          id: uuidv4(),
          name: 'emptyObject',
          type: 'object'
        };
        
        const result = convertSchemaFieldToJson(field);
        expect(result).toEqual({});
      });    test('should handle unknown field type', () => {
      const field = {
        id: uuidv4(),
        name: 'unknown',
        type: 'invalid'
      } as unknown as SchemaField;
      
      const result = convertSchemaFieldToJson(field);
      expect(result).toBe('unknown');
    });

      test('should handle field with zero min/max constraints', () => {
        const field: SchemaField = {
          id: uuidv4(),
          name: 'counter',
          type: 'number',
          logic: {
            min: 0,
            max: 0
          }
        };
        
        const result = convertSchemaFieldToJson(field);
        expect(result).toBe('number between 0 and 0');
      });

      test('should handle array with extreme constraints', () => {
        const field: SchemaField = {
          id: uuidv4(),
          name: 'largeArray',
          type: 'array',
          logic: {
            minItems: 100,
            maxItems: 1000
          },
          arrayItemType: {
            id: uuidv4(),
            name: 'item',
            type: 'text'
          }
        };
        
        const result = convertSchemaFieldToJson(field) as unknown[];
        expect(Array.isArray(result)).toBe(true);
        expect(result.length).toBe(101); // min + 1
      });
    });

    describe('Real World Scenarios', () => {
      test('should handle blog post schema as in TEST.md', () => {
        const blogSchema: SchemaField[] = [
          {
            id: '0',
            name: 'office',
            type: 'object',
            children: [
              {
                id: '01',
                name: 'tags',
                type: 'array',
                logic: { minItems: 2, maxItems: 5 },
                arrayItemType: {
                  id: '011',
                  name: 'items',
                  type: 'array',
                  logic: { minItems: 2, maxItems: 5 },
                  arrayItemType: {
                    id: '0111',
                    name: 'item',
                    type: 'object',
                    children: [
                      {
                        id: '01111',
                        name: 'title',
                        type: 'text',
                        logic: { required: true, minLength: 5, maxLength: 100 }
                      },
                      {
                        id: '01112',
                        name: 'description',
                        type: 'text',
                        logic: { required: true, minLength: 50 }
                      }
                    ]
                  }
                }
              }
            ]
          },
          {
            id: '5',
            name: 'status',
            type: 'text',
            logic: {
              required: true,
              enum: ['APPROVED', 'REVIEW', 'PUBLISHED']
            }
          }
        ];
        
        const result = convertSchemaToJson(blogSchema);
        
        // Check office structure
        expect(result.office).toBeDefined();
        const office = result.office as Record<string, unknown>;
        expect(office.tags).toBeDefined();
        
        const tags = office.tags as unknown[][];
        expect(Array.isArray(tags)).toBe(true);
        expect(tags.length).toBe(3); // min(2) + 1
        expect(Array.isArray(tags[0])).toBe(true);
        expect(tags[0].length).toBe(3); // min(2) + 1
        
        const item = tags[0][0] as Record<string, unknown>;
        expect(item.title).toBe('text with minimum 5 and maximum 100 characters');
        expect(item.description).toBe('text with minimum 50 characters');
        
        // Check status
        expect(result.status).toBe('text enum: APPROVED, REVIEW, PUBLISHED');
      });

      test('should handle e-commerce product schema', () => {
        const productSchema: SchemaField[] = [
          {
            id: uuidv4(),
            name: 'product',
            type: 'object',
            children: [
              {
                id: uuidv4(),
                name: 'name',
                type: 'text',
                logic: { required: true, minLength: 2, maxLength: 100 }
              },
              {
                id: uuidv4(),
                name: 'price',
                type: 'number',
                logic: { required: true, min: 0.01 }
              },
              {
                id: uuidv4(),
                name: 'categories',
                type: 'array',
                logic: { minItems: 1, maxItems: 3 },
                arrayItemType: {
                  id: uuidv4(),
                  name: 'category',
                  type: 'text',
                  logic: { enum: ['Electronics', 'Clothing', 'Books', 'Home'] }
                }
              },
              {
                id: uuidv4(),
                name: 'inStock',
                type: 'boolean'
              }
            ]
          }
        ];
        
        const result = convertSchemaToJson(productSchema);
        const product = result.product as Record<string, unknown>;
        
        expect(product.name).toBe('text with minimum 2 and maximum 100 characters');
        expect(product.price).toBe('number minimum 0.01');
        expect(product.inStock).toBe('boolean');
        
        const categories = product.categories as unknown[];
        expect(Array.isArray(categories)).toBe(true);
        expect(categories.length).toBe(2); // min(1) + 1
        expect(categories[0]).toBe('text enum: Electronics, Clothing, Books, Home');
      });
    });
  });
});
