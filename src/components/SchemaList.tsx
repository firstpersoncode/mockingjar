'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Alert,
  Menu,
  MenuItem,
  Chip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  Schema as SchemaIcon,
} from '@mui/icons-material';
import { useSchemas, useSaveSchema, useDeleteSchema } from '@/hooks/useSchemas';
import { JsonSchema } from '@/types/schema';

export default function SchemaList() {
  const router = useRouter();
  const { data: schemas, isLoading, error } = useSchemas();
  const saveSchema = useSaveSchema();
  const deleteSchema = useDeleteSchema();

  // Create dialog state
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newSchemaName, setNewSchemaName] = useState('');
  const [newSchemaDescription, setNewSchemaDescription] = useState('');

  // Delete confirmation state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [schemaToDelete, setSchemaToDelete] = useState<string | null>(null);

  // Menu state for schema actions
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedSchemaId, setSelectedSchemaId] = useState<string | null>(null);

  const handleCreateSchema = async () => {
    if (!newSchemaName.trim()) return;

    const newSchema: JsonSchema = {
      name: newSchemaName.trim(),
      description: newSchemaDescription.trim() || undefined,
      fields: [],
    };

    try {
      const result = await saveSchema.mutateAsync(newSchema);
      setCreateDialogOpen(false);
      setNewSchemaName('');
      setNewSchemaDescription('');
      // Navigate to the new schema builder
      router.push(`/schema/${result.id}`);
    } catch (error) {
      console.error('Failed to create schema:', error);
    }
  };

  const handleEditSchema = (schemaId: string) => {
    router.push(`/schema/${schemaId}`);
    handleMenuClose();
  };

  const handleDeleteClick = (schemaId: string) => {
    setSchemaToDelete(schemaId);
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  const handleDeleteConfirm = async () => {
    if (!schemaToDelete) return;

    try {
      await deleteSchema.mutateAsync(schemaToDelete);
      setDeleteDialogOpen(false);
      setSchemaToDelete(null);
    } catch (error) {
      console.error('Failed to delete schema:', error);
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, schemaId: string) => {
    setMenuAnchor(event.currentTarget);
    setSelectedSchemaId(schemaId);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setSelectedSchemaId(null);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        Failed to load schemas. Please try again.
      </Alert>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Schema Library
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your JSON schemas for data generation
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setCreateDialogOpen(true)}
          size="large"
        >
          Create Schema
        </Button>
      </Box>

      {schemas && schemas.length === 0 ? (
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          minHeight="400px"
          textAlign="center"
        >
          <SchemaIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h5" gutterBottom color="text.secondary">
            No schemas yet
          </Typography>
          <Typography variant="body1" color="text.secondary" mb={3}>
            Create your first schema to start generating mock data
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setCreateDialogOpen(true)}
          >
            Create Your First Schema
          </Button>
        </Box>
      ) : (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(3, 1fr)',
            },
            gap: 3,
          }}
        >
          {schemas?.map((schema) => (
            <Card
              key={schema.id}
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: 4,
                },
              }}
            >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                    <Typography variant="h6" component="h2" noWrap sx={{ flexGrow: 1, mr: 1 }}>
                      {schema.name}
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuOpen(e, schema.id)}
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </Box>
                  
                  {schema.description && (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        mb: 2,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {schema.description}
                    </Typography>
                  )}

                  <Box display="flex" flexWrap="wrap" gap={1} mb={2}>
                    <Chip
                      label={`${schema.structure.fields.length} fields`}
                      size="small"
                      variant="outlined"
                    />
                  </Box>

                  <Typography variant="caption" color="text.secondary">
                    Created {formatDate(schema.createdAt)}
                  </Typography>
                </CardContent>

                <CardActions>
                  <Button
                    size="small"
                    startIcon={<EditIcon />}
                    onClick={() => handleEditSchema(schema.id)}
                  >
                    Edit
                  </Button>
                </CardActions>
              </Card>
          ))}
        </Box>
      )}

      {/* Action Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => selectedSchemaId && handleEditSchema(selectedSchemaId)}>
          <EditIcon sx={{ mr: 1 }} />
          Edit Schema
        </MenuItem>
        <MenuItem 
          onClick={() => selectedSchemaId && handleDeleteClick(selectedSchemaId)}
          sx={{ color: 'error.main' }}
        >
          <DeleteIcon sx={{ mr: 1 }} />
          Delete Schema
        </MenuItem>
      </Menu>

      {/* Create Schema Dialog */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Schema</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Schema Name"
            fullWidth
            variant="outlined"
            value={newSchemaName}
            onChange={(e) => setNewSchemaName(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Description (optional)"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={newSchemaDescription}
            onChange={(e) => setNewSchemaDescription(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleCreateSchema}
            variant="contained"
            disabled={!newSchemaName.trim() || saveSchema.isPending}
          >
            {saveSchema.isPending ? <CircularProgress size={24} /> : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Schema</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this schema? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            disabled={deleteSchema.isPending}
          >
            {deleteSchema.isPending ? <CircularProgress size={24} /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
