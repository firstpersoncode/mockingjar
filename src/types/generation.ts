export interface GenerationProgress {
  stage: 'preparing' | 'generating' | 'validating' | 'fixing' | 'completed' | 'failed';
  message: string;
  progress: number; // 0-100
  currentField?: string;
  failedFields?: string[];
  attempts?: number;
  maxAttempts?: number;
}

export interface GenerationResult {
  success: boolean;
  data?: Record<string, unknown>[];
  errors?: string[];
  progress: GenerationProgress;
  metadata?: {
    totalFields: number;
    validFields: number;
    regeneratedFields: string[];
    attempts: number;
    generationTime: number;
  };
}

export interface FieldGenerationContext {
  fieldPath: string;
  fieldType: string;
  parentContext?: Record<string, unknown>;
  siblingFields?: Record<string, unknown>;
  description?: string;
  constraints?: Record<string, unknown>;
}

export interface GenerationOptions {
  maxAttempts?: number;
  enableFallback?: boolean;
  progressCallback?: (progress: GenerationProgress) => void;
  timeout?: number;
}
