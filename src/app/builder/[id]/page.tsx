'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { 
  Box, 
  Typography, 
  CircularProgress, 
  Alert,
  AppBar,
  Toolbar,
  IconButton,
} from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import SchemaBuilder from '@/components/SchemaBuilder';
import { useGetSchema, useSaveSchema, useUpdateSchema } from '@/hooks/useSchemas';
import { JsonSchema } from '@/types/schema';

export default function SchemaBuilderPage() {
  const router = useRouter();
  const params = useParams();
  const schemaId = params.id as string;
  
  const { data: savedSchema, isLoading, error } = useGetSchema(schemaId);
  const saveSchema = useSaveSchema();
  const updateSchema = useUpdateSchema();
  
  const [isNewSchema, setIsNewSchema] = useState(false);
  const [saveError, setSaveError] = useState<string | undefined>(undefined);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isUpdatingName, setIsUpdatingName] = useState(false);

  useEffect(() => {
    // Check if this is a "new" schema creation flow
    setIsNewSchema(schemaId === 'new');
  }, [schemaId]);

  useEffect(() => {
    if (saveSuccess) {
      const timer = setTimeout(() => setSaveSuccess(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [saveSuccess]);

  const handleSave = async (schema: JsonSchema) => {
    try {
      setSaveError(undefined);
      
      if (isNewSchema) {
        // Create new schema
        const result = await saveSchema.mutateAsync(schema);
        setSaveSuccess(true);
        // Navigate to the new schema's edit page
        router.replace(`/builder/${result.id}`);
        setIsNewSchema(false);
      } else {
        // Update existing schema
        await updateSchema.mutateAsync({ id: schemaId, schema });
        setSaveSuccess(true);
      }
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Failed to save schema');
    }
  };

  const handleUpdate = async (schema: JsonSchema) => {
    // Skip auto-save for new schemas that haven't been saved yet
    if (isNewSchema || !savedSchema) {
      return;
    }

    try {
      // Auto-save the schema changes to the database
      await updateSchema.mutateAsync({ id: schemaId, schema });
    } catch (error) {
      console.error('Auto-save failed:', error);
      // We don't show errors for auto-save to avoid noise
      // The user can still manually save if needed
    }
  };

  const handleUpdateName = async (name: string, currentSchema: JsonSchema) => {
    if (isNewSchema || !savedSchema) {
      // For new schemas, we don't update the database until save
      return;
    }

    try {
      setIsUpdatingName(true);
      
      // Use the current schema state instead of savedSchema.structure
      // This preserves any unsaved changes the user has made
      const updatedSchema: JsonSchema = {
        ...currentSchema,
        name: name,
      };
      
      // Update the schema in the database
      await updateSchema.mutateAsync({ id: schemaId, schema: updatedSchema });
    } catch (error) {
      console.error('Failed to update schema name:', error);
      // Note: We're not showing an error to the user for name updates
      // as they happen on every keystroke and would be too noisy
    } finally {
      setIsUpdatingName(false);
    }
  };

  const handleBack = () => {
    router.push('/builder');
  };

  if (isLoading && !isNewSchema) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error && !isNewSchema) {
    return (
      <Box sx={{ p: 3 }}>
        <AppBar position="static" sx={{ mb: 3 }}>
          <Toolbar>
            <IconButton
              edge="start"
              color="inherit"
              onClick={handleBack}
              sx={{ mr: 2 }}
            >
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h6">
              Error Loading Schema
            </Typography>
          </Toolbar>
        </AppBar>
        
        <Alert severity="error">
          Failed to load schema. Please try again or go back to the schema list.
        </Alert>
      </Box>
    );
  }

  const initialSchema = isNewSchema 
    ? { name: 'New Schema', description: '', fields: [] }
    : savedSchema?.structure;

  const pageTitle = isNewSchema 
    ? 'Create New Schema' 
    : `Edit: ${savedSchema?.name || 'Loading...'}`;

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppBar position="static">
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={handleBack}
            sx={{ mr: 2 }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            {pageTitle}
          </Typography>
          
          {saveSuccess && (
            <Alert 
              severity="success" 
              sx={{ 
                py: 0.5, 
                px: 2, 
                backgroundColor: 'success.light',
                color: 'success.contrastText',
                '& .MuiAlert-icon': {
                  color: 'success.contrastText',
                }
              }}
            >
              Schema saved successfully!
            </Alert>
          )}
        </Toolbar>
      </AppBar>

      <Box sx={{ flexGrow: 1, overflow: 'auto', p: 3 }}>
        {saveError && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setSaveError(undefined)}>
            {saveError}
          </Alert>
        )}

        {initialSchema ? (
          <SchemaBuilder
            initialSchema={initialSchema}
            onSave={handleSave}
            onUpdate={handleUpdate}
            onUpdateName={handleUpdateName}
            isSaving={saveSchema.isPending || updateSchema.isPending}
            isUpdatingName={isUpdatingName}
            saveError={saveError}
            saveSuccess={saveSuccess}
          />
        ) : (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
            <CircularProgress />
          </Box>
        )}
      </Box>
    </Box>
  );
}
