export interface SchemaField {
  id: string;
  name: string;
  type: 'text' | 'number' | 'boolean' | 'date' | 'email' | 'url' | 'array' | 'object';
  logic?: {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
    pattern?: string;
    enum?: string[];
    minItems?: number;
    maxItems?: number;
  };
  children?: SchemaField[]; // For object type
  arrayItemType?: SchemaField; // For array type
  description?: string;
}

export interface JsonSchema {
  id?: string;
  name: string;
  description?: string;
  fields: SchemaField[];
}

export interface SavedSchema {
  id: string;
  name: string;
  description?: string;
  structure: JsonSchema;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}
