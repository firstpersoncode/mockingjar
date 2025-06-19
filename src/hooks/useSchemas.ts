import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { JsonSchema, SavedSchema } from '@/types/schema';
import { GenerationProgress, GenerationResult } from '@/types/generation';

export interface GenerateDataParams {
  schema: JsonSchema;
  prompt: string;
  count: number;
  onProgress?: (progress: GenerationProgress) => void;
}

export interface GenerateDataResult extends GenerationResult {
  progressSteps?: GenerationProgress[];
}

export function useSchemas() {
  return useQuery({
    queryKey: ['schemas'],
    queryFn: async (): Promise<SavedSchema[]> => {
      const response = await fetch('/api/schemas');
      if (!response.ok) throw new Error('Failed to fetch schemas');
      return response.json();
    },
  });
}

export function useGetSchema(id: string) {
  return useQuery({
    queryKey: ['schemas', id],
    queryFn: async (): Promise<SavedSchema> => {
      const response = await fetch(`/api/schemas/${id}`);
      if (!response.ok) throw new Error('Failed to fetch schema');
      return response.json();
    },
    enabled: !!id,
  });
}

export function useSaveSchema() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (schema: JsonSchema) => {
      const response = await fetch('/api/schemas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(schema),
      });
      if (!response.ok) throw new Error('Failed to save schema');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schemas'] });
    },
  });
}

export function useUpdateSchema() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, schema }: { id: string; schema: JsonSchema }) => {
      const response = await fetch(`/api/schemas/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(schema),
      });
      if (!response.ok) throw new Error('Failed to update schema');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schemas'] });
    },
  });
}

export function useDeleteSchema() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/schemas/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete schema');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schemas'] });
    },
  });
}

export function useGenerateData() {
  return useMutation({
    mutationFn: async ({
      schema,
      prompt,
      count,
      onProgress,
    }: GenerateDataParams): Promise<GenerateDataResult> => {
      // Simulate progress for UI responsiveness
      onProgress?.({
        stage: 'preparing',
        message: 'Preparing generation request...',
        progress: 0
      });

      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ schema, prompt, count }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate data');
      }

      const result: GenerateDataResult = await response.json();

      // Replay progress steps for UI
      if (result.progressSteps && onProgress) {
        for (const step of result.progressSteps) {
          onProgress(step);
          // Small delay to show progress
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

      return result;
    },
    // retry: (failureCount, error) => {
    //   // Retry up to 2 times for network errors, but not for validation errors
    //   return failureCount < 2 && !error.message.includes('validation');
    // },
    // retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}
