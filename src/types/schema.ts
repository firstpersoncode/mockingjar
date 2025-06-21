import { JsonSchema } from 'mockingjar-lib/dist/types/schema';

export interface SavedSchema {
  id: string;
  name: string;
  description?: string;
  structure: JsonSchema;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}
