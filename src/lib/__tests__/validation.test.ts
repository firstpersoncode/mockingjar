import {
  convertToJsonSchema,
  validateData,
  normalizeData,
  getFailedFields,
  groupErrorsByField,
  ValidationError
} from '../validation';
import { JsonSchema, SchemaField } from '@/types/schema';

describe('validation module', () => {
  const createSchema = (fields: SchemaField[]): JsonSchema => ({
    name: 'test-schema',
    fields
  });

  describe('convertToJsonSchema', () => {
    it('should convert simple text field to JSON schema', () => {
      const fields: SchemaField[] = [
        {
          id: '1',
          name: 'firstName',
          type: 'text',
          logic: { required: true, minLength: 2, maxLength: 50 }
        }
      ];

      const result = convertToJsonSchema(fields);

      expect(result).toMatchObject({
        type: 'object',
        required: ['firstName'],
        additionalProperties: false
      });

      const properties = result.properties as Record<string, unknown>;
      expect(properties.firstName).toMatchObject({
        type: 'string',
        minLength: 2,
        maxLength: 50
      });
    });

    it('should convert email field with format validation', () => {
      const fields: SchemaField[] = [
        {
          id: '1',
          name: 'email',
          type: 'email',
          logic: { required: true }
        }
      ];

      const result = convertToJsonSchema(fields);
      const properties = result.properties as Record<string, unknown>;

      expect(properties.email).toMatchObject({
        type: 'string',
        format: 'email'
      });
    });

    it('should convert URL field with format validation', () => {
      const fields: SchemaField[] = [
        {
          id: '1',
          name: 'website',
          type: 'url',
          logic: { required: false }
        }
      ];

      const result = convertToJsonSchema(fields);
      const properties = result.properties as Record<string, unknown>;

      expect(properties.website).toMatchObject({
        type: 'string',
        format: 'uri'
      });
    });

    it('should convert number field with min/max constraints', () => {
      const fields: SchemaField[] = [
        {
          id: '1',
          name: 'age',
          type: 'number',
          logic: { min: 0, max: 120, required: true }
        }
      ];

      const result = convertToJsonSchema(fields);
      const properties = result.properties as Record<string, unknown>;

      expect(properties.age).toEqual({
        type: 'number',
        minimum: 0,
        maximum: 120
      });
    });

    it('should convert boolean field', () => {
      const fields: SchemaField[] = [
        {
          id: '1',
          name: 'isActive',
          type: 'boolean'
        }
      ];

      const result = convertToJsonSchema(fields);
      const properties = result.properties as Record<string, unknown>;

      expect(properties.isActive).toEqual({
        type: 'boolean'
      });
    });

    it('should convert date field with ISO format', () => {
      const fields: SchemaField[] = [
        {
          id: '1',
          name: 'createdAt',
          type: 'date',
          logic: { required: true }
        }
      ];

      const result = convertToJsonSchema(fields);
      const properties = result.properties as Record<string, unknown>;

      expect(properties.createdAt).toEqual({
        type: 'string',
        format: 'date-time'
      });
    });

    it('should convert array of strings with constraints', () => {
      const fields: SchemaField[] = [
        {
          id: '1',
          name: 'tags',
          type: 'array',
          logic: { minItems: 1, maxItems: 10 },
          arrayItemType: {
            id: '2',
            name: 'tag',
            type: 'text'
          }
        }
      ];

      const result = convertToJsonSchema(fields);
      const properties = result.properties as Record<string, unknown>;

      expect(properties.tags).toEqual({
        type: 'array',
        minItems: 1,
        maxItems: 10,
        items: {
          type: 'string'
        }
      });
    });

    it('should convert array of objects', () => {
      const fields: SchemaField[] = [
        {
          id: '1',
          name: 'addresses',
          type: 'array',
          arrayItemType: {
            id: '2',
            name: 'address',
            type: 'object',
            children: [
              {
                id: '3',
                name: 'street',
                type: 'text',
                logic: { required: true }
              },
              {
                id: '4',
                name: 'city',
                type: 'text',
                logic: { required: true }
              }
            ]
          }
        }
      ];

      const result = convertToJsonSchema(fields);
      const properties = result.properties as Record<string, unknown>;

      expect(properties.addresses).toEqual({
        type: 'array',
        items: {
          type: 'object',
          properties: {
            street: { type: 'string' },
            city: { type: 'string' }
          },
          required: ['street', 'city'],
          additionalProperties: false
        }
      });
    });

    it('should convert nested object with multiple levels', () => {
      const fields: SchemaField[] = [
        {
          id: '1',
          name: 'user',
          type: 'object',
          children: [
            {
              id: '2',
              name: 'profile',
              type: 'object',
              children: [
                {
                  id: '3',
                  name: 'displayName',
                  type: 'text',
                  logic: { required: true }
                },
                {
                  id: '4',
                  name: 'avatar',
                  type: 'url'
                }
              ]
            },
            {
              id: '5',
              name: 'preferences',
              type: 'object',
              children: [
                {
                  id: '6',
                  name: 'theme',
                  type: 'text',
                  logic: { enum: ['light', 'dark'] }
                }
              ]
            }
          ]
        }
      ];

      const result = convertToJsonSchema(fields);
      const properties = result.properties as Record<string, unknown>;

      expect(properties.user).toEqual({
        type: 'object',
        properties: {
          profile: {
            type: 'object',
            properties: {
              displayName: { type: 'string' },
              avatar: { type: 'string', format: 'uri' }
            },
            required: ['displayName'],
            additionalProperties: false
          },
          preferences: {
            type: 'object',
            properties: {
              theme: { type: 'string', enum: ['light', 'dark'] }
            },
            required: [],
            additionalProperties: false
          }
        },
        required: [],
        additionalProperties: false
      });
    });

    it('should handle text field with enum constraint', () => {
      const fields: SchemaField[] = [
        {
          id: '1',
          name: 'status',
          type: 'text',
          logic: { enum: ['active', 'inactive', 'pending'], required: true }
        }
      ];

      const result = convertToJsonSchema(fields);
      const properties = result.properties as Record<string, unknown>;

      expect(properties.status).toEqual({
        type: 'string',
        enum: ['active', 'inactive', 'pending']
      });
    });

    it('should handle text field with pattern constraint', () => {
      const fields: SchemaField[] = [
        {
          id: '1',
          name: 'username',
          type: 'text',
          logic: { pattern: '^[a-zA-Z0-9_]+$', minLength: 3, maxLength: 20 }
        }
      ];

      const result = convertToJsonSchema(fields);
      const properties = result.properties as Record<string, unknown>;

      expect(properties.username).toEqual({
        type: 'string',
        pattern: '^[a-zA-Z0-9_]+$',
        minLength: 3,
        maxLength: 20
      });
    });
  });

  describe('validateData', () => {
    it('should validate correct data against schema', () => {
      const schema = createSchema([
        {
          id: '1',
          name: 'name',
          type: 'text',
          logic: { required: true, minLength: 2 }
        },
        {
          id: '2',
          name: 'email',
          type: 'email',
          logic: { required: true }
        },
        {
          id: '3',
          name: 'age',
          type: 'number',
          logic: { min: 0, max: 120 }
        }
      ]);

      const validData = {
        name: 'John Doe',
        email: 'john@example.com',
        age: 30
      };

      const result = validateData(validData, schema);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.data).toEqual(validData);
    });

    it('should detect missing required fields', () => {
      const schema = createSchema([
        {
          id: '1',
          name: 'name',
          type: 'text',
          logic: { required: true }
        },
        {
          id: '2',
          name: 'email',
          type: 'email',
          logic: { required: true }
        }
      ]);

      const invalidData = {
        name: 'John Doe'
        // missing email
      };

      const result = validateData(invalidData, schema);

      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].field).toBe('root');
      expect(result.errors[0].message).toContain('email');
    });

    it('should detect invalid email format', () => {
      const schema = createSchema([
        {
          id: '1',
          name: 'email',
          type: 'email',
          logic: { required: true }
        }
      ]);

      const invalidData = {
        email: 'not-an-email'
      };

      const result = validateData(invalidData, schema);

      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].field).toBe('email');
      expect(result.errors[0].message).toContain('format');
    });

    it('should detect invalid URL format', () => {
      const schema = createSchema([
        {
          id: '1',
          name: 'website',
          type: 'url',
          logic: { required: true }
        }
      ]);

      const invalidData = {
        website: 'not-a-url'
      };

      const result = validateData(invalidData, schema);

      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].field).toBe('website');
      expect(result.errors[0].message).toContain('format');
    });

    it('should detect number constraint violations', () => {
      const schema = createSchema([
        {
          id: '1',
          name: 'age',
          type: 'number',
          logic: { min: 0, max: 120, required: true }
        }
      ]);

      const invalidData = {
        age: -5
      };

      const result = validateData(invalidData, schema);

      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].field).toBe('age');
      expect(result.errors[0].message).toContain('>=');
    });

    it('should detect string length violations', () => {
      const schema = createSchema([
        {
          id: '1',
          name: 'username',
          type: 'text',
          logic: { minLength: 3, maxLength: 10, required: true }
        }
      ]);

      const invalidData = {
        username: 'ab' // too short
      };

      const result = validateData(invalidData, schema);

      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].field).toBe('username');
      expect(result.errors[0].message).toContain('fewer than 3');
    });

    it('should validate array constraints', () => {
      const schema = createSchema([
        {
          id: '1',
          name: 'tags',
          type: 'array',
          logic: { minItems: 2, maxItems: 5 },
          arrayItemType: {
            id: '2',
            name: 'tag',
            type: 'text'
          }
        }
      ]);

      const invalidData = {
        tags: ['one'] // too few items
      };

      const result = validateData(invalidData, schema);

      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].field).toBe('tags');
      expect(result.errors[0].message).toContain('fewer than 2');
    });

    it('should validate nested object structure', () => {
      const schema = createSchema([
        {
          id: '1',
          name: 'user',
          type: 'object',
          children: [
            {
              id: '2',
              name: 'name',
              type: 'text',
              logic: { required: true }
            },
            {
              id: '3',
              name: 'email',
              type: 'email',
              logic: { required: true }
            }
          ]
        }
      ]);

      const invalidData = {
        user: {
          name: 'John'
          // missing email
        }
      };

      const result = validateData(invalidData, schema);

      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].field).toBe('user');
      expect(result.errors[0].message).toContain('email');
    });

    it('should validate date-time format', () => {
      const schema = createSchema([
        {
          id: '1',
          name: 'createdAt',
          type: 'date',
          logic: { required: true }
        }
      ]);

      const invalidData = {
        createdAt: 'not-a-date'
      };

      const result = validateData(invalidData, schema);

      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].field).toBe('createdAt');
      expect(result.errors[0].message).toContain('format');
    });

    it('should accept valid date-time format', () => {
      const schema = createSchema([
        {
          id: '1',
          name: 'createdAt',
          type: 'date',
          logic: { required: true }
        }
      ]);

      const validData = {
        createdAt: '2023-06-16T10:30:00.000Z'
      };

      const result = validateData(validData, schema);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should validate enum constraints', () => {
      const schema = createSchema([
        {
          id: '1',
          name: 'status',
          type: 'text',
          logic: { enum: ['active', 'inactive'], required: true }
        }
      ]);

      const invalidData = {
        status: 'unknown'
      };

      const result = validateData(invalidData, schema);

      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].field).toBe('status');
      expect(result.errors[0].message).toContain('allowed values');
    });

    it('should validate pattern constraints', () => {
      const schema = createSchema([
        {
          id: '1',
          name: 'username',
          type: 'text',
          logic: { pattern: '^[a-zA-Z0-9_]+$', required: true }
        }
      ]);

      const invalidData = {
        username: 'user-with-dashes'
      };

      const result = validateData(invalidData, schema);

      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].field).toBe('username');
      expect(result.errors[0].message).toContain('pattern');
    });
  });

  describe('normalizeData', () => {
    it('should normalize string numbers to numbers', () => {
      const schema = createSchema([
        {
          id: '1',
          name: 'age',
          type: 'number'
        }
      ]);

      const data = { age: '25' };
      const result = normalizeData(data, schema);

      expect(result).toEqual({ age: 25 });
    });

    it('should normalize string booleans to booleans', () => {
      const schema = createSchema([
        {
          id: '1',
          name: 'isActive',
          type: 'boolean'
        },
        {
          id: '2',
          name: 'isVerified',
          type: 'boolean'
        }
      ]);

      const data = { isActive: 'true', isVerified: 'false' };
      const result = normalizeData(data, schema);

      expect(result).toEqual({ isActive: true, isVerified: false });
    });

    it('should normalize date strings to ISO format', () => {
      const schema = createSchema([
        {
          id: '1',
          name: 'createdAt',
          type: 'date'
        }
      ]);

      const data = { createdAt: '2023-06-16' };
      const result = normalizeData(data, schema);

      expect(result).toEqual({ 
        createdAt: new Date('2023-06-16').toISOString() 
      });
    });

    it('should convert non-arrays to single-item arrays', () => {
      const schema = createSchema([
        {
          id: '1',
          name: 'tags',
          type: 'array',
          arrayItemType: {
            id: '2',
            name: 'tag',
            type: 'text'
          }
        }
      ]);

      const data = { tags: 'single-tag' };
      const result = normalizeData(data, schema);

      expect(result).toEqual({ tags: ['single-tag'] });
    });

    it('should normalize nested objects recursively', () => {
      const schema = createSchema([
        {
          id: '1',
          name: 'user',
          type: 'object',
          children: [
            {
              id: '2',
              name: 'age',
              type: 'number'
            },
            {
              id: '3',
              name: 'isActive',
              type: 'boolean'
            }
          ]
        }
      ]);

      const data = {
        user: {
          age: '30',
          isActive: 'true'
        }
      };

      const result = normalizeData(data, schema);

      expect(result).toEqual({
        user: {
          age: 30,
          isActive: true
        }
      });
    });

    it('should normalize array items recursively', () => {
      const schema = createSchema([
        {
          id: '1',
          name: 'users',
          type: 'array',
          arrayItemType: {
            id: '2',
            name: 'user',
            type: 'object',
            children: [
              {
                id: '3',
                name: 'age',
                type: 'number'
              }
            ]
          }
        }
      ]);

      const data = {
        users: [
          { age: '25' },
          { age: '30' }
        ]
      };

      const result = normalizeData(data, schema);

      expect(result).toEqual({
        users: [
          { age: 25 },
          { age: 30 }
        ]
      });
    });

    it('should handle null and undefined values gracefully', () => {
      const schema = createSchema([
        {
          id: '1',
          name: 'age',
          type: 'number'
        },
        {
          id: '2',
          name: 'name',
          type: 'text'
        }
      ]);

      const data = { age: null, name: undefined };
      const result = normalizeData(data, schema);

      expect(result).toEqual({ age: null, name: undefined });
    });

    it('should handle invalid number strings gracefully', () => {
      const schema = createSchema([
        {
          id: '1',
          name: 'age',
          type: 'number'
        }
      ]);

      const data = { age: 'not-a-number' };
      const result = normalizeData(data, schema);

      expect(result).toEqual({ age: 'not-a-number' });
    });

    it('should handle invalid date strings gracefully', () => {
      const schema = createSchema([
        {
          id: '1',
          name: 'createdAt',
          type: 'date'
        }
      ]);

      const data = { createdAt: 'not-a-date' };
      const result = normalizeData(data, schema);

      expect(result).toEqual({ createdAt: 'not-a-date' });
    });
  });

  describe('getFailedFields', () => {
    it('should extract unique field names from validation errors', () => {
      const errors: ValidationError[] = [
        { field: 'name', message: 'Required', value: null, path: '/name' },
        { field: 'email', message: 'Invalid format', value: 'bad-email', path: '/email' },
        { field: 'name', message: 'Too short', value: 'a', path: '/name' },
        { field: 'root', message: 'General error', value: {}, path: '' }
      ];

      const result = getFailedFields(errors);

      expect(result).toEqual(['name', 'email']);
    });

    it('should return empty array for no errors', () => {
      const result = getFailedFields([]);
      expect(result).toEqual([]);
    });

    it('should exclude root field errors', () => {
      const errors: ValidationError[] = [
        { field: 'root', message: 'General error', value: {}, path: '' }
      ];

      const result = getFailedFields(errors);
      expect(result).toEqual([]);
    });
  });

  describe('groupErrorsByField', () => {
    it('should group errors by field name', () => {
      const errors: ValidationError[] = [
        { field: 'name', message: 'Required', value: null, path: '/name' },
        { field: 'email', message: 'Invalid format', value: 'bad-email', path: '/email' },
        { field: 'name', message: 'Too short', value: 'a', path: '/name' }
      ];

      const result = groupErrorsByField(errors);

      expect(result).toEqual({
        name: [
          { field: 'name', message: 'Required', value: null, path: '/name' },
          { field: 'name', message: 'Too short', value: 'a', path: '/name' }
        ],
        email: [
          { field: 'email', message: 'Invalid format', value: 'bad-email', path: '/email' }
        ]
      });
    });

    it('should handle empty errors array', () => {
      const result = groupErrorsByField([]);
      expect(result).toEqual({});
    });

    it('should group root errors under root key', () => {
      const errors: ValidationError[] = [
        { field: 'root', message: 'General error', value: {}, path: '' },
        { field: '', message: 'Another root error', value: {}, path: '' }
      ];

      const result = groupErrorsByField(errors);

      expect(result).toEqual({
        root: [
          { field: 'root', message: 'General error', value: {}, path: '' },
          { field: '', message: 'Another root error', value: {}, path: '' }
        ]
      });
    });
  });

  describe('real-world scenarios', () => {
    it('should handle complex user profile schema', () => {
      const schema = createSchema([
        {
          id: '1',
          name: 'id',
          type: 'number',
          logic: { required: true, min: 1 }
        },
        {
          id: '2',
          name: 'email',
          type: 'email',
          logic: { required: true }
        },
        {
          id: '3',
          name: 'profile',
          type: 'object',
          children: [
            {
              id: '4',
              name: 'firstName',
              type: 'text',
              logic: { required: true, minLength: 1, maxLength: 50 }
            },
            {
              id: '5',
              name: 'lastName',
              type: 'text',
              logic: { required: true, minLength: 1, maxLength: 50 }
            },
            {
              id: '6',
              name: 'age',
              type: 'number',
              logic: { min: 13, max: 120 }
            },
            {
              id: '7',
              name: 'website',
              type: 'url'
            }
          ]
        },
        {
          id: '8',
          name: 'preferences',
          type: 'object',
          children: [
            {
              id: '9',
              name: 'theme',
              type: 'text',
              logic: { enum: ['light', 'dark', 'auto'] }
            },
            {
              id: '10',
              name: 'notifications',
              type: 'boolean'
            }
          ]
        },
        {
          id: '11',
          name: 'tags',
          type: 'array',
          logic: { maxItems: 10 },
          arrayItemType: {
            id: '12',
            name: 'tag',
            type: 'text',
            logic: { minLength: 1, maxLength: 20 }
          }
        },
        {
          id: '13',
          name: 'createdAt',
          type: 'date',
          logic: { required: true }
        }
      ]);

      const validData = {
        id: 1,
        email: 'john@example.com',
        profile: {
          firstName: 'John',
          lastName: 'Doe',
          age: 30,
          website: 'https://johndoe.com'
        },
        preferences: {
          theme: 'dark',
          notifications: true
        },
        tags: ['developer', 'react', 'typescript'],
        createdAt: '2023-06-16T10:30:00.000Z'
      };

      const result = validateData(validData, schema);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should handle e-commerce product schema', () => {
      const schema = createSchema([
        {
          id: '1',
          name: 'name',
          type: 'text',
          logic: { required: true, minLength: 3, maxLength: 100 }
        },
        {
          id: '2',
          name: 'price',
          type: 'number',
          logic: { required: true, min: 0 }
        },
        {
          id: '3',
          name: 'category',
          type: 'text',
          logic: { 
            required: true, 
            enum: ['electronics', 'clothing', 'books', 'home', 'sports'] 
          }
        },
        {
          id: '4',
          name: 'inStock',
          type: 'boolean',
          logic: { required: true }
        },
        {
          id: '5',
          name: 'variants',
          type: 'array',
          logic: { minItems: 1 },
          arrayItemType: {
            id: '6',
            name: 'variant',
            type: 'object',
            children: [
              {
                id: '7',
                name: 'size',
                type: 'text',
                logic: { required: true }
              },
              {
                id: '8',
                name: 'color',
                type: 'text',
                logic: { required: true }
              },
              {
                id: '9',
                name: 'sku',
                type: 'text',
                logic: { required: true, pattern: '^[A-Z0-9-]+$' }
              }
            ]
          }
        }
      ]);

      const validData = {
        name: 'Premium T-Shirt',
        price: 29.99,
        category: 'clothing',
        inStock: true,
        variants: [
          {
            size: 'M',
            color: 'blue',
            sku: 'TSHIRT-BLUE-M'
          },
          {
            size: 'L',
            color: 'red',
            sku: 'TSHIRT-RED-L'
          }
        ]
      };

      const result = validateData(validData, schema);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should validate and normalize mixed data types', () => {
      const schema = createSchema([
        {
          id: '1',
          name: 'id',
          type: 'number'
        },
        {
          id: '2',
          name: 'active',
          type: 'boolean'
        },
        {
          id: '3',
          name: 'createdAt',
          type: 'date'
        }
      ]);

      const mixedData = {
        id: '123',
        active: 'true',
        createdAt: '2023-06-16'
      };

      const normalized = normalizeData(mixedData, schema);
      const result = validateData(normalized, schema);

      expect(result.isValid).toBe(true);
      expect(normalized).toEqual({
        id: 123,
        active: true,
        createdAt: new Date('2023-06-16').toISOString()
      });
    });
  });
});
