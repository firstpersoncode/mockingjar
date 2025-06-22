'use client';
import { v4 as uuidv4 } from 'uuid';
import { SchemaField } from 'mockingjar-lib/dist/types/schema';

// Move schema templates outside component to prevent recreation on every render
export const createSchemaTemplates = () => ({
  user: {
    name: 'User Profile',
    fields: [
      {
        id: uuidv4(),
        name: 'id',
        type: 'number' as const,
        logic: { required: true },
      } as SchemaField,
      {
        id: uuidv4(),
        name: 'firstName',
        type: 'text' as const,
        logic: { required: true, minLength: 2, maxLength: 50 },
      } as SchemaField,
      {
        id: uuidv4(),
        name: 'lastName',
        type: 'text' as const,
        logic: { required: true, minLength: 2, maxLength: 50 },
      } as SchemaField,
      {
        id: uuidv4(),
        name: 'email',
        type: 'email' as const,
        logic: { required: true },
      } as SchemaField,
      {
        id: uuidv4(),
        name: 'dateOfBirth',
        type: 'date' as const,
        logic: { required: false },
      } as SchemaField,
      {
        id: uuidv4(),
        name: 'isActive',
        type: 'boolean' as const,
        logic: { required: true },
      } as SchemaField,
    ],
  },
  
  product: {
    name: 'E-commerce Product',
    fields: [
      {
        id: uuidv4(),
        name: 'id',
        type: 'number' as const,
        logic: { required: true },
      } as SchemaField,
      {
        id: uuidv4(),
        name: 'name',
        type: 'text' as const,
        logic: { required: true, minLength: 3, maxLength: 100 },
      } as SchemaField,
      {
        id: uuidv4(),
        name: 'description',
        type: 'text' as const,
        logic: { required: false, maxLength: 500 },
      } as SchemaField,
      {
        id: uuidv4(),
        name: 'price',
        type: 'number' as const,
        logic: { required: true, min: 0 },
      } as SchemaField,
      {
        id: uuidv4(),
        name: 'category',
        type: 'text' as const,
        logic: {
          required: true,
          enum: ['Electronics', 'Clothing', 'Books', 'Home', 'Sports'],
        },
      } as SchemaField,
      {
        id: uuidv4(),
        name: 'inStock',
        type: 'boolean' as const,
        logic: { required: true },
      } as SchemaField,
      {
        id: uuidv4(),
        name: 'tags',
        type: 'array' as const,
        arrayItemType: {
          id: uuidv4(),
          name: 'tag',
          type: 'object' as const,
          children: [
            {
              id: uuidv4(),
              name: 'name',
              type: 'text' as const,
              logic: { required: true },
            } as SchemaField,
            {
              id: uuidv4(),
              name: 'color',
              type: 'text' as const,
              logic: {
                required: false,
                enum: ['red', 'blue', 'green', 'yellow'],
              },
            } as SchemaField,
          ],
          logic: { required: false },
        } as SchemaField,
        logic: { minItems: 0, maxItems: 10 },
      } as SchemaField,
    ],
  },

  address: {
    name: 'Address',
    fields: [
      {
        id: uuidv4(),
        name: 'street',
        type: 'text' as const,
        logic: { required: true, minLength: 5, maxLength: 100 },
      } as SchemaField,
      {
        id: uuidv4(),
        name: 'city',
        type: 'text' as const,
        logic: { required: true, minLength: 2, maxLength: 50 },
      } as SchemaField,
      {
        id: uuidv4(),
        name: 'state',
        type: 'text' as const,
        logic: { required: true, minLength: 2, maxLength: 50 },
      } as SchemaField,
      {
        id: uuidv4(),
        name: 'zipCode',
        type: 'text' as const,
        logic: { required: true, pattern: '^[0-9]{5}(-[0-9]{4})?$' },
      } as SchemaField,
      {
        id: uuidv4(),
        name: 'country',
        type: 'text' as const,
        logic: {
          required: true,
          enum: ['USA', 'Canada', 'UK', 'Germany', 'France'],
        },
      } as SchemaField,
    ],
  },

  blog: {
    name: 'Blog Post',
    fields: [
      {
        id: uuidv4(),
        name: 'id',
        type: 'number' as const,
        logic: { required: true },
      } as SchemaField,
      {
        id: uuidv4(),
        name: 'title',
        type: 'text' as const,
        logic: { required: true, minLength: 10, maxLength: 200 },
      } as SchemaField,
      {
        id: uuidv4(),
        name: 'slug',
        type: 'text' as const,
        logic: { required: true, pattern: '^[a-z0-9-]+$' },
      } as SchemaField,
      {
        id: uuidv4(),
        name: 'content',
        type: 'text' as const,
        logic: { required: true, minLength: 100 },
      } as SchemaField,
      {
        id: uuidv4(),
        name: 'publishedAt',
        type: 'date' as const,
        logic: { required: false },
      } as SchemaField,
      {
        id: uuidv4(),
        name: 'isPublished',
        type: 'boolean' as const,
        logic: { required: true },
      } as SchemaField,
      {
        id: uuidv4(),
        name: 'author',
        type: 'object' as const,
        logic: { required: true },
        children: [
          {
            id: uuidv4(),
            name: 'name',
            type: 'text' as const,
            logic: { required: true },
          } as SchemaField,
          {
            id: uuidv4(),
            name: 'email',
            type: 'email' as const,
            logic: { required: true },
          } as SchemaField,
        ],
      } as SchemaField,
      {
        id: uuidv4(),
        name: 'tags',
        type: 'array' as const,
        arrayItemType: {
          id: uuidv4(),
          name: 'tag',
          type: 'object' as const,
          children: [
            {
              id: uuidv4(),
              name: 'name',
              type: 'text' as const,
              logic: { required: true },
            } as SchemaField,
            {
              id: uuidv4(),
              name: 'category',
              type: 'text' as const,
              logic: { required: false },
            } as SchemaField,
            {
              id: uuidv4(),
              name: 'metadata',
              type: 'object' as const,
              logic: { required: false },
              children: [
                {
                  id: uuidv4(),
                  name: 'popularity',
                  type: 'number' as const,
                  logic: { required: false, min: 0, max: 100 },
                } as SchemaField,
                {
                  id: uuidv4(),
                  name: 'related',
                  type: 'array' as const,
                  arrayItemType: {
                    id: uuidv4(),
                    name: 'relatedTag',
                    type: 'text' as const,
                    logic: { required: false },
                  } as SchemaField,
                  logic: { minItems: 0, maxItems: 5 },
                } as SchemaField,
              ],
            } as SchemaField,
          ],
          logic: { required: false },
        } as SchemaField,
        logic: { minItems: 1, maxItems: 5 },
      } as SchemaField,
    ],
  },
  
  order: {
    name: 'Order Management',
    fields: [
      {
        id: uuidv4(),
        name: 'id',
        type: 'number' as const,
        logic: { required: true },
      } as SchemaField,
      {
        id: uuidv4(),
        name: 'orderNumber',
        type: 'text' as const,
        logic: { required: true, pattern: '^ORD-[0-9]{6}$' },
      } as SchemaField,
      {
        id: uuidv4(),
        name: 'customerId',
        type: 'number' as const,
        logic: { required: true },
      } as SchemaField,
      {
        id: uuidv4(),
        name: 'status',
        type: 'text' as const,
        logic: {
          required: true,
          enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
        },
      } as SchemaField,
      {
        id: uuidv4(),
        name: 'totalAmount',
        type: 'number' as const,
        logic: { required: true, min: 0 },
      } as SchemaField,
      {
        id: uuidv4(),
        name: 'currency',
        type: 'text' as const,
        logic: {
          required: true,
          enum: ['USD', 'EUR', 'GBP', 'CAD', 'AUD'],
        },
      } as SchemaField,
      {
        id: uuidv4(),
        name: 'orderDate',
        type: 'date' as const,
        logic: { required: true },
      } as SchemaField,
      {
        id: uuidv4(),
        name: 'shippingAddress',
        type: 'object' as const,
        logic: { required: true },
        children: [
          {
            id: uuidv4(),
            name: 'street',
            type: 'text' as const,
            logic: { required: true, minLength: 5, maxLength: 100 },
          } as SchemaField,
          {
            id: uuidv4(),
            name: 'city',
            type: 'text' as const,
            logic: { required: true, minLength: 2, maxLength: 50 },
          } as SchemaField,
          {
            id: uuidv4(),
            name: 'zipCode',
            type: 'text' as const,
            logic: { required: true, pattern: '^[0-9]{5}(-[0-9]{4})?$' },
          } as SchemaField,
          {
            id: uuidv4(),
            name: 'country',
            type: 'text' as const,
            logic: { required: true },
          } as SchemaField,
        ],
      } as SchemaField,
      {
        id: uuidv4(),
        name: 'items',
        type: 'array' as const,
        arrayItemType: {
          id: uuidv4(),
          name: 'item',
          type: 'object' as const,
          children: [
            {
              id: uuidv4(),
              name: 'productId',
              type: 'number' as const,
              logic: { required: true },
            } as SchemaField,
            {
              id: uuidv4(),
              name: 'productName',
              type: 'text' as const,
              logic: { required: true, minLength: 1, maxLength: 100 },
            } as SchemaField,
            {
              id: uuidv4(),
              name: 'quantity',
              type: 'number' as const,
              logic: { required: true, min: 1 },
            } as SchemaField,
            {
              id: uuidv4(),
              name: 'unitPrice',
              type: 'number' as const,
              logic: { required: true, min: 0 },
            } as SchemaField,
          ],
          logic: { required: true },
        } as SchemaField,
        logic: { minItems: 1, maxItems: 50 },
      } as SchemaField,
    ],
  },

  customer: {
    name: 'Customer Profile',
    fields: [
      {
        id: uuidv4(),
        name: 'id',
        type: 'number' as const,
        logic: { required: true },
      } as SchemaField,
      {
        id: uuidv4(),
        name: 'customerNumber',
        type: 'text' as const,
        logic: { required: true, pattern: '^CUST-[0-9]{6}$' },
      } as SchemaField,
      {
        id: uuidv4(),
        name: 'firstName',
        type: 'text' as const,
        logic: { required: true, minLength: 2, maxLength: 50 },
      } as SchemaField,
      {
        id: uuidv4(),
        name: 'lastName',
        type: 'text' as const,
        logic: { required: true, minLength: 2, maxLength: 50 },
      } as SchemaField,
      {
        id: uuidv4(),
        name: 'email',
        type: 'email' as const,
        logic: { required: true },
      } as SchemaField,
      {
        id: uuidv4(),
        name: 'phone',
        type: 'text' as const,
        logic: { required: false, pattern: '^\\+?[1-9]\\d{1,14}$' },
      } as SchemaField,
      {
        id: uuidv4(),
        name: 'dateOfBirth',
        type: 'date' as const,
        logic: { required: false },
      } as SchemaField,
      {
        id: uuidv4(),
        name: 'tier',
        type: 'text' as const,
        logic: {
          required: true,
          enum: ['bronze', 'silver', 'gold', 'platinum'],
        },
      } as SchemaField,
      {
        id: uuidv4(),
        name: 'isActive',
        type: 'boolean' as const,
        logic: { required: true },
      } as SchemaField,
      {
        id: uuidv4(),
        name: 'registrationDate',
        type: 'date' as const,
        logic: { required: true },
      } as SchemaField,
      {
        id: uuidv4(),
        name: 'preferences',
        type: 'object' as const,
        logic: { required: false },
        children: [
          {
            id: uuidv4(),
            name: 'newsletter',
            type: 'boolean' as const,
            logic: { required: true },
          } as SchemaField,
          {
            id: uuidv4(),
            name: 'smsNotifications',
            type: 'boolean' as const,
            logic: { required: true },
          } as SchemaField,
          {
            id: uuidv4(),
            name: 'language',
            type: 'text' as const,
            logic: {
              required: true,
              enum: ['en', 'es', 'fr', 'de', 'it'],
            },
          } as SchemaField,
        ],
      } as SchemaField,
    ],
  },

  employee: {
    name: 'Employee Record',
    fields: [
      {
        id: uuidv4(),
        name: 'id',
        type: 'number' as const,
        logic: { required: true },
      } as SchemaField,
      {
        id: uuidv4(),
        name: 'employeeId',
        type: 'text' as const,
        logic: { required: true, pattern: '^EMP-[0-9]{4}$' },
      } as SchemaField,
      {
        id: uuidv4(),
        name: 'firstName',
        type: 'text' as const,
        logic: { required: true, minLength: 2, maxLength: 50 },
      } as SchemaField,
      {
        id: uuidv4(),
        name: 'lastName',
        type: 'text' as const,
        logic: { required: true, minLength: 2, maxLength: 50 },
      } as SchemaField,
      {
        id: uuidv4(),
        name: 'email',
        type: 'email' as const,
        logic: { required: true },
      } as SchemaField,
      {
        id: uuidv4(),
        name: 'department',
        type: 'text' as const,
        logic: {
          required: true,
          enum: ['Engineering', 'Marketing', 'Sales', 'HR', 'Finance', 'Operations'],
        },
      } as SchemaField,
      {
        id: uuidv4(),
        name: 'position',
        type: 'text' as const,
        logic: { required: true, minLength: 2, maxLength: 100 },
      } as SchemaField,
      {
        id: uuidv4(),
        name: 'salary',
        type: 'number' as const,
        logic: { required: true, min: 0 },
      } as SchemaField,
      {
        id: uuidv4(),
        name: 'hireDate',
        type: 'date' as const,
        logic: { required: true },
      } as SchemaField,
      {
        id: uuidv4(),
        name: 'isFullTime',
        type: 'boolean' as const,
        logic: { required: true },
      } as SchemaField,
      {
        id: uuidv4(),
        name: 'manager',
        type: 'object' as const,
        logic: { required: false },
        children: [
          {
            id: uuidv4(),
            name: 'employeeId',
            type: 'text' as const,
            logic: { required: true },
          } as SchemaField,
          {
            id: uuidv4(),
            name: 'name',
            type: 'text' as const,
            logic: { required: true },
          } as SchemaField,
        ],
      } as SchemaField,
      {
        id: uuidv4(),
        name: 'skills',
        type: 'array' as const,
        arrayItemType: {
          id: uuidv4(),
          name: 'skill',
          type: 'object' as const,
          children: [
            {
              id: uuidv4(),
              name: 'name',
              type: 'text' as const,
              logic: { required: true },
            } as SchemaField,
            {
              id: uuidv4(),
              name: 'level',
              type: 'text' as const,
              logic: {
                required: true,
                enum: ['beginner', 'intermediate', 'advanced', 'expert'],
              },
            } as SchemaField,
          ],
          logic: { required: true },
        } as SchemaField,
        logic: { minItems: 0, maxItems: 20 },
      } as SchemaField,
    ],
  },

  event: {
    name: 'Event Management',
    fields: [
      {
        id: uuidv4(),
        name: 'id',
        type: 'number' as const,
        logic: { required: true },
      } as SchemaField,
      {
        id: uuidv4(),
        name: 'title',
        type: 'text' as const,
        logic: { required: true, minLength: 5, maxLength: 200 },
      } as SchemaField,
      {
        id: uuidv4(),
        name: 'description',
        type: 'text' as const,
        logic: { required: false, maxLength: 1000 },
      } as SchemaField,
      {
        id: uuidv4(),
        name: 'category',
        type: 'text' as const,
        logic: {
          required: true,
          enum: ['conference', 'workshop', 'seminar', 'webinar', 'networking', 'social'],
        },
      } as SchemaField,
      {
        id: uuidv4(),
        name: 'startDate',
        type: 'date' as const,
        logic: { required: true },
      } as SchemaField,
      {
        id: uuidv4(),
        name: 'endDate',
        type: 'date' as const,
        logic: { required: true },
      } as SchemaField,
      {
        id: uuidv4(),
        name: 'location',
        type: 'object' as const,
        logic: { required: true },
        children: [
          {
            id: uuidv4(),
            name: 'venue',
            type: 'text' as const,
            logic: { required: true, minLength: 2, maxLength: 100 },
          } as SchemaField,
          {
            id: uuidv4(),
            name: 'address',
            type: 'text' as const,
            logic: { required: true, minLength: 5, maxLength: 200 },
          } as SchemaField,
          {
            id: uuidv4(),
            name: 'city',
            type: 'text' as const,
            logic: { required: true, minLength: 2, maxLength: 50 },
          } as SchemaField,
          {
            id: uuidv4(),
            name: 'country',
            type: 'text' as const,
            logic: { required: true, minLength: 2, maxLength: 50 },
          } as SchemaField,
        ],
      } as SchemaField,
      {
        id: uuidv4(),
        name: 'capacity',
        type: 'number' as const,
        logic: { required: true, min: 1 },
      } as SchemaField,
      {
        id: uuidv4(),
        name: 'price',
        type: 'number' as const,
        logic: { required: true, min: 0 },
      } as SchemaField,
      {
        id: uuidv4(),
        name: 'isPublic',
        type: 'boolean' as const,
        logic: { required: true },
      } as SchemaField,
      {
        id: uuidv4(),
        name: 'organizer',
        type: 'object' as const,
        logic: { required: true },
        children: [
          {
            id: uuidv4(),
            name: 'name',
            type: 'text' as const,
            logic: { required: true },
          } as SchemaField,
          {
            id: uuidv4(),
            name: 'email',
            type: 'email' as const,
            logic: { required: true },
          } as SchemaField,
          {
            id: uuidv4(),
            name: 'company',
            type: 'text' as const,
            logic: { required: false },
          } as SchemaField,
        ],
      } as SchemaField,
    ],
  },

  inventory: {
    name: 'Inventory Item',
    fields: [
      {
        id: uuidv4(),
        name: 'id',
        type: 'number' as const,
        logic: { required: true },
      } as SchemaField,
      {
        id: uuidv4(),
        name: 'sku',
        type: 'text' as const,
        logic: { required: true, pattern: '^[A-Z0-9-]{6,12}$' },
      } as SchemaField,
      {
        id: uuidv4(),
        name: 'name',
        type: 'text' as const,
        logic: { required: true, minLength: 2, maxLength: 100 },
      } as SchemaField,
      {
        id: uuidv4(),
        name: 'category',
        type: 'text' as const,
        logic: {
          required: true,
          enum: ['Raw Materials', 'Finished Goods', 'Work in Progress', 'Spare Parts'],
        },
      } as SchemaField,
      {
        id: uuidv4(),
        name: 'currentStock',
        type: 'number' as const,
        logic: { required: true, min: 0 },
      } as SchemaField,
      {
        id: uuidv4(),
        name: 'minimumStock',
        type: 'number' as const,
        logic: { required: true, min: 0 },
      } as SchemaField,
      {
        id: uuidv4(),
        name: 'maximumStock',
        type: 'number' as const,
        logic: { required: true, min: 0 },
      } as SchemaField,
      {
        id: uuidv4(),
        name: 'unitPrice',
        type: 'number' as const,
        logic: { required: true, min: 0 },
      } as SchemaField,
      {
        id: uuidv4(),
        name: 'supplier',
        type: 'object' as const,
        logic: { required: true },
        children: [
          {
            id: uuidv4(),
            name: 'name',
            type: 'text' as const,
            logic: { required: true, minLength: 2, maxLength: 100 },
          } as SchemaField,
          {
            id: uuidv4(),
            name: 'contactEmail',
            type: 'email' as const,
            logic: { required: true },
          } as SchemaField,
          {
            id: uuidv4(),
            name: 'phone',
            type: 'text' as const,
            logic: { required: false, pattern: '^\\+?[1-9]\\d{1,14}$' },
          } as SchemaField,
        ],
      } as SchemaField,
      {
        id: uuidv4(),
        name: 'warehouse',
        type: 'object' as const,
        logic: { required: true },
        children: [
          {
            id: uuidv4(),
            name: 'location',
            type: 'text' as const,
            logic: { required: true },
          } as SchemaField,
          {
            id: uuidv4(),
            name: 'section',
            type: 'text' as const,
            logic: { required: true },
          } as SchemaField,
          {
            id: uuidv4(),
            name: 'row',
            type: 'text' as const,
            logic: { required: false },
          } as SchemaField,
          {
            id: uuidv4(),
            name: 'shelf',
            type: 'text' as const,
            logic: { required: false },
          } as SchemaField,
        ],
      } as SchemaField,
      {
        id: uuidv4(),
        name: 'lastRestocked',
        type: 'date' as const,
        logic: { required: false },
      } as SchemaField,
    ],
  },

  invoice: {
    name: 'Invoice',
    fields: [
      {
        id: uuidv4(),
        name: 'id',
        type: 'number' as const,
        logic: { required: true },
      } as SchemaField,
      {
        id: uuidv4(),
        name: 'invoiceNumber',
        type: 'text' as const,
        logic: { required: true, pattern: '^INV-[0-9]{6}$' },
      } as SchemaField,
      {
        id: uuidv4(),
        name: 'issueDate',
        type: 'date' as const,
        logic: { required: true },
      } as SchemaField,
      {
        id: uuidv4(),
        name: 'dueDate',
        type: 'date' as const,
        logic: { required: true },
      } as SchemaField,
      {
        id: uuidv4(),
        name: 'status',
        type: 'text' as const,
        logic: {
          required: true,
          enum: ['draft', 'sent', 'paid', 'overdue', 'cancelled'],
        },
      } as SchemaField,
      {
        id: uuidv4(),
        name: 'client',
        type: 'object' as const,
        logic: { required: true },
        children: [
          {
            id: uuidv4(),
            name: 'name',
            type: 'text' as const,
            logic: { required: true, minLength: 2, maxLength: 100 },
          } as SchemaField,
          {
            id: uuidv4(),
            name: 'email',
            type: 'email' as const,
            logic: { required: true },
          } as SchemaField,
          {
            id: uuidv4(),
            name: 'address',
            type: 'text' as const,
            logic: { required: true, minLength: 10, maxLength: 200 },
          } as SchemaField,
          {
            id: uuidv4(),
            name: 'taxId',
            type: 'text' as const,
            logic: { required: false, pattern: '^[0-9]{2}-[0-9]{7}$' },
          } as SchemaField,
        ],
      } as SchemaField,
      {
        id: uuidv4(),
        name: 'lineItems',
        type: 'array' as const,
        arrayItemType: {
          id: uuidv4(),
          name: 'lineItem',
          type: 'object' as const,
          children: [
            {
              id: uuidv4(),
              name: 'description',
              type: 'text' as const,
              logic: { required: true, minLength: 5, maxLength: 200 },
            } as SchemaField,
            {
              id: uuidv4(),
              name: 'quantity',
              type: 'number' as const,
              logic: { required: true, min: 1 },
            } as SchemaField,
            {
              id: uuidv4(),
              name: 'unitPrice',
              type: 'number' as const,
              logic: { required: true, min: 0 },
            } as SchemaField,
            {
              id: uuidv4(),
              name: 'total',
              type: 'number' as const,
              logic: { required: true, min: 0 },
            } as SchemaField,
          ],
          logic: { required: true },
        } as SchemaField,
        logic: { minItems: 1, maxItems: 100 },
      } as SchemaField,
      {
        id: uuidv4(),
        name: 'subtotal',
        type: 'number' as const,
        logic: { required: true, min: 0 },
      } as SchemaField,
      {
        id: uuidv4(),
        name: 'taxRate',
        type: 'number' as const,
        logic: { required: true, min: 0, max: 1 },
      } as SchemaField,
      {
        id: uuidv4(),
        name: 'taxAmount',
        type: 'number' as const,
        logic: { required: true, min: 0 },
      } as SchemaField,
      {
        id: uuidv4(),
        name: 'total',
        type: 'number' as const,
        logic: { required: true, min: 0 },
      } as SchemaField,
      {
        id: uuidv4(),
        name: 'currency',
        type: 'text' as const,
        logic: {
          required: true,
          enum: ['USD', 'EUR', 'GBP', 'CAD', 'AUD'],
        },
      } as SchemaField,
    ],
  },

  company: {
    name: 'Company Profile',
    fields: [
      {
        id: uuidv4(),
        name: 'id',
        type: 'number' as const,
        logic: { required: true },
      } as SchemaField,
      {
        id: uuidv4(),
        name: 'name',
        type: 'text' as const,
        logic: { required: true, minLength: 2, maxLength: 100 },
      } as SchemaField,
      {
        id: uuidv4(),
        name: 'legalName',
        type: 'text' as const,
        logic: { required: true, minLength: 2, maxLength: 150 },
      } as SchemaField,
      {
        id: uuidv4(),
        name: 'registrationNumber',
        type: 'text' as const,
        logic: { required: true, pattern: '^[A-Z0-9]{8,12}$' },
      } as SchemaField,
      {
        id: uuidv4(),
        name: 'taxId',
        type: 'text' as const,
        logic: { required: true, pattern: '^[0-9]{2}-[0-9]{7}$' },
      } as SchemaField,
      {
        id: uuidv4(),
        name: 'industry',
        type: 'text' as const,
        logic: {
          required: true,
          enum: ['Technology', 'Healthcare', 'Finance', 'Manufacturing', 'Retail', 'Education', 'Other'],
        },
      } as SchemaField,
      {
        id: uuidv4(),
        name: 'size',
        type: 'text' as const,
        logic: {
          required: true,
          enum: ['startup', 'small', 'medium', 'large', 'enterprise'],
        },
      } as SchemaField,
      {
        id: uuidv4(),
        name: 'foundedDate',
        type: 'date' as const,
        logic: { required: true },
      } as SchemaField,
      {
        id: uuidv4(),
        name: 'headquarters',
        type: 'object' as const,
        logic: { required: true },
        children: [
          {
            id: uuidv4(),
            name: 'address',
            type: 'text' as const,
            logic: { required: true, minLength: 10, maxLength: 200 },
          } as SchemaField,
          {
            id: uuidv4(),
            name: 'city',
            type: 'text' as const,
            logic: { required: true, minLength: 2, maxLength: 50 },
          } as SchemaField,
          {
            id: uuidv4(),
            name: 'state',
            type: 'text' as const,
            logic: { required: true, minLength: 2, maxLength: 50 },
          } as SchemaField,
          {
            id: uuidv4(),
            name: 'country',
            type: 'text' as const,
            logic: { required: true, minLength: 2, maxLength: 50 },
          } as SchemaField,
          {
            id: uuidv4(),
            name: 'zipCode',
            type: 'text' as const,
            logic: { required: true, pattern: '^[0-9]{5}(-[0-9]{4})?$' },
          } as SchemaField,
        ],
      } as SchemaField,
      {
        id: uuidv4(),
        name: 'contact',
        type: 'object' as const,
        logic: { required: true },
        children: [
          {
            id: uuidv4(),
            name: 'email',
            type: 'email' as const,
            logic: { required: true },
          } as SchemaField,
          {
            id: uuidv4(),
            name: 'phone',
            type: 'text' as const,
            logic: { required: true, pattern: '^\\+?[1-9]\\d{1,14}$' },
          } as SchemaField,
          {
            id: uuidv4(),
            name: 'website',
            type: 'text' as const,
            logic: { required: false, pattern: '^https?://[\\w\\.-]+\\.[a-zA-Z]{2,}$' },
          } as SchemaField,
        ],
      } as SchemaField,
      {
        id: uuidv4(),
        name: 'isActive',
        type: 'boolean' as const,
        logic: { required: true },
      } as SchemaField,
    ],
  },

  recipe: {
    name: 'Recipe',
    fields: [
      {
        id: uuidv4(),
        name: 'id',
        type: 'number' as const,
        logic: { required: true },
      } as SchemaField,
      {
        id: uuidv4(),
        name: 'title',
        type: 'text' as const,
        logic: { required: true, minLength: 3, maxLength: 100 },
      } as SchemaField,
      {
        id: uuidv4(),
        name: 'description',
        type: 'text' as const,
        logic: { required: false, maxLength: 500 },
      } as SchemaField,
      {
        id: uuidv4(),
        name: 'cuisine',
        type: 'text' as const,
        logic: {
          required: true,
          enum: ['Italian', 'Chinese', 'Mexican', 'Indian', 'French', 'Japanese', 'American', 'Mediterranean'],
        },
      } as SchemaField,
      {
        id: uuidv4(),
        name: 'difficulty',
        type: 'text' as const,
        logic: {
          required: true,
          enum: ['easy', 'medium', 'hard'],
        },
      } as SchemaField,
      {
        id: uuidv4(),
        name: 'servings',
        type: 'number' as const,
        logic: { required: true, min: 1, max: 20 },
      } as SchemaField,
      {
        id: uuidv4(),
        name: 'prepTime',
        type: 'number' as const,
        logic: { required: true, min: 1 },
      } as SchemaField,
      {
        id: uuidv4(),
        name: 'cookTime',
        type: 'number' as const,
        logic: { required: true, min: 1 },
      } as SchemaField,
      {
        id: uuidv4(),
        name: 'ingredients',
        type: 'array' as const,
        arrayItemType: {
          id: uuidv4(),
          name: 'ingredient',
          type: 'object' as const,
          children: [
            {
              id: uuidv4(),
              name: 'name',
              type: 'text' as const,
              logic: { required: true, minLength: 2, maxLength: 50 },
            } as SchemaField,
            {
              id: uuidv4(),
              name: 'amount',
              type: 'number' as const,
              logic: { required: true, min: 0 },
            } as SchemaField,
            {
              id: uuidv4(),
              name: 'unit',
              type: 'text' as const,
              logic: {
                required: true,
                enum: ['cup', 'tablespoon', 'teaspoon', 'gram', 'kilogram', 'pound', 'ounce', 'liter', 'milliliter', 'piece'],
              },
            } as SchemaField,
            {
              id: uuidv4(),
              name: 'notes',
              type: 'text' as const,
              logic: { required: false, maxLength: 100 },
            } as SchemaField,
          ],
          logic: { required: true },
        } as SchemaField,
        logic: { minItems: 1, maxItems: 30 },
      } as SchemaField,
      {
        id: uuidv4(),
        name: 'instructions',
        type: 'array' as const,
        arrayItemType: {
          id: uuidv4(),
          name: 'step',
          type: 'object' as const,
          children: [
            {
              id: uuidv4(),
              name: 'stepNumber',
              type: 'number' as const,
              logic: { required: true, min: 1 },
            } as SchemaField,
            {
              id: uuidv4(),
              name: 'instruction',
              type: 'text' as const,
              logic: { required: true, minLength: 10, maxLength: 500 },
            } as SchemaField,
            {
              id: uuidv4(),
              name: 'duration',
              type: 'number' as const,
              logic: { required: false, min: 1 },
            } as SchemaField,
          ],
          logic: { required: true },
        } as SchemaField,
        logic: { minItems: 1, maxItems: 20 },
      } as SchemaField,
      {
        id: uuidv4(),
        name: 'nutrition',
        type: 'object' as const,
        logic: { required: false },
        children: [
          {
            id: uuidv4(),
            name: 'calories',
            type: 'number' as const,
            logic: { required: false, min: 0 },
          } as SchemaField,
          {
            id: uuidv4(),
            name: 'protein',
            type: 'number' as const,
            logic: { required: false, min: 0 },
          } as SchemaField,
          {
            id: uuidv4(),
            name: 'carbs',
            type: 'number' as const,
            logic: { required: false, min: 0 },
          } as SchemaField,
          {
            id: uuidv4(),
            name: 'fat',
            type: 'number' as const,
            logic: { required: false, min: 0 },
          } as SchemaField,
        ],
      } as SchemaField,
      {
        id: uuidv4(),
        name: 'tags',
        type: 'array' as const,
        arrayItemType: {
          id: uuidv4(),
          name: 'tag',
          type: 'text' as const,
          logic: { required: true },
        } as SchemaField,
        logic: { minItems: 0, maxItems: 10 },
      } as SchemaField,
      {
        id: uuidv4(),
        name: 'isVegetarian',
        type: 'boolean' as const,
        logic: { required: true },
      } as SchemaField,
      {
        id: uuidv4(),
        name: 'isVegan',
        type: 'boolean' as const,
        logic: { required: true },
      } as SchemaField,
      {
        id: uuidv4(),
        name: 'isGlutenFree',
        type: 'boolean' as const,
        logic: { required: true },
      } as SchemaField,
    ],
  },

});
