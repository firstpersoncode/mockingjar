import { SchemaField } from '@/types/schema';
import { v4 as uuidv4 } from 'uuid';
import { findAndUpdateField, findAndRemoveField } from '../fieldUtils';

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
});
