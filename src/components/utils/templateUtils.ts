'use client';
import { v4 as uuidv4 } from 'uuid';
import { SchemaField } from '@/types/schema';

// Move schema templates outside component to prevent recreation on every render
export const createSchemaTemplates = () => ({
  user: {
    name: 'User Profile',
    fields: [
      { id: uuidv4(), name: 'id', type: 'number' as const, logic: { required: true } } as SchemaField,
      { id: uuidv4(), name: 'firstName', type: 'text' as const, logic: { required: true, minLength: 2, maxLength: 50 } } as SchemaField,
      { id: uuidv4(), name: 'lastName', type: 'text' as const, logic: { required: true, minLength: 2, maxLength: 50 } } as SchemaField,
      { id: uuidv4(), name: 'email', type: 'email' as const, logic: { required: true } } as SchemaField,
      { id: uuidv4(), name: 'dateOfBirth', type: 'date' as const, logic: { required: false } } as SchemaField,
      { id: uuidv4(), name: 'isActive', type: 'boolean' as const, logic: { required: true } } as SchemaField,
    ]
  },
  product: {
    name: 'E-commerce Product',
    fields: [
      { id: uuidv4(), name: 'id', type: 'number' as const, logic: { required: true } } as SchemaField,
      { id: uuidv4(), name: 'name', type: 'text' as const, logic: { required: true, minLength: 3, maxLength: 100 } } as SchemaField,
      { id: uuidv4(), name: 'description', type: 'text' as const, logic: { required: false, maxLength: 500 } } as SchemaField,
      { id: uuidv4(), name: 'price', type: 'number' as const, logic: { required: true, min: 0 } } as SchemaField,
      { id: uuidv4(), name: 'category', type: 'text' as const, logic: { required: true, enum: ['Electronics', 'Clothing', 'Books', 'Home', 'Sports'] } } as SchemaField,
      { id: uuidv4(), name: 'inStock', type: 'boolean' as const, logic: { required: true } } as SchemaField,
      { id: uuidv4(), name: 'tags', type: 'array' as const, arrayItemType: { 
        id: uuidv4(), 
        name: 'tag', 
        type: 'object' as const,
        children: [
          { id: uuidv4(), name: 'name', type: 'text' as const, logic: { required: true } } as SchemaField,
          { id: uuidv4(), name: 'color', type: 'text' as const, logic: { required: false, enum: ['red', 'blue', 'green', 'yellow'] } } as SchemaField,
        ],
        logic: { required: false }
      } as SchemaField, logic: { minItems: 0, maxItems: 10 } } as SchemaField,
    ]
  },
  address: {
    name: 'Address',
    fields: [
      { id: uuidv4(), name: 'street', type: 'text' as const, logic: { required: true, minLength: 5, maxLength: 100 } } as SchemaField,
      { id: uuidv4(), name: 'city', type: 'text' as const, logic: { required: true, minLength: 2, maxLength: 50 } } as SchemaField,
      { id: uuidv4(), name: 'state', type: 'text' as const, logic: { required: true, minLength: 2, maxLength: 50 } } as SchemaField,
      { id: uuidv4(), name: 'zipCode', type: 'text' as const, logic: { required: true, pattern: '^[0-9]{5}(-[0-9]{4})?$' } } as SchemaField,
      { id: uuidv4(), name: 'country', type: 'text' as const, logic: { required: true, enum: ['USA', 'Canada', 'UK', 'Germany', 'France'] } } as SchemaField,
    ]
  },
  blog: {
    name: 'Blog Post',
    fields: [
      { id: uuidv4(), name: 'id', type: 'number' as const, logic: { required: true } } as SchemaField,
      { id: uuidv4(), name: 'title', type: 'text' as const, logic: { required: true, minLength: 10, maxLength: 200 } } as SchemaField,
      { id: uuidv4(), name: 'slug', type: 'text' as const, logic: { required: true, pattern: '^[a-z0-9-]+$' } } as SchemaField,
      { id: uuidv4(), name: 'content', type: 'text' as const, logic: { required: true, minLength: 100 } } as SchemaField,
      { id: uuidv4(), name: 'publishedAt', type: 'date' as const, logic: { required: false } } as SchemaField,
      { id: uuidv4(), name: 'isPublished', type: 'boolean' as const, logic: { required: true } } as SchemaField,
      { id: uuidv4(), name: 'author', type: 'object' as const, logic: { required: true }, children: [
        { id: uuidv4(), name: 'name', type: 'text' as const, logic: { required: true } } as SchemaField,
        { id: uuidv4(), name: 'email', type: 'email' as const, logic: { required: true } } as SchemaField,
      ]} as SchemaField,
      { id: uuidv4(), name: 'tags', type: 'array' as const, arrayItemType: { 
        id: uuidv4(), 
        name: 'tag', 
        type: 'object' as const,
        children: [
          { id: uuidv4(), name: 'name', type: 'text' as const, logic: { required: true } } as SchemaField,
          { id: uuidv4(), name: 'category', type: 'text' as const, logic: { required: false } } as SchemaField,
          { id: uuidv4(), name: 'metadata', type: 'object' as const, logic: { required: false }, children: [
            { id: uuidv4(), name: 'popularity', type: 'number' as const, logic: { required: false, min: 0, max: 100 } } as SchemaField,
            { id: uuidv4(), name: 'related', type: 'array' as const, arrayItemType: {
              id: uuidv4(),
              name: 'relatedTag',
              type: 'text' as const,
              logic: { required: false }
            } as SchemaField, logic: { minItems: 0, maxItems: 5 } } as SchemaField,
          ]} as SchemaField,
        ],
        logic: { required: false }
      } as SchemaField, logic: { minItems: 1, maxItems: 5 } } as SchemaField,
    ]
  },
  nestedArrays: {
    name: 'Nested Arrays Test',
    fields: [
      { id: uuidv4(), name: 'id', type: 'number' as const, logic: { required: true } } as SchemaField,
      { id: uuidv4(), name: 'departments', type: 'array' as const, arrayItemType: {
        id: uuidv4(),
        name: 'department',
        type: 'array' as const,
        arrayItemType: {
          id: uuidv4(),
          name: 'employee',
          type: 'object' as const,
          children: [
            { id: uuidv4(), name: 'name', type: 'text' as const, logic: { required: true } } as SchemaField,
            { id: uuidv4(), name: 'role', type: 'text' as const, logic: { required: true } } as SchemaField,
          ],
          logic: { required: true }
        } as SchemaField,
        logic: { minItems: 1, maxItems: 10 }
      } as SchemaField, logic: { minItems: 1, maxItems: 5 } } as SchemaField,
    ]
  }
});