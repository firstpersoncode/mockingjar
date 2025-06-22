'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  Card,
  CardContent,
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
  CardActionArea,
  useTheme,
  useMediaQuery,
  Fab,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  Schema as SchemaIcon,
  KeyboardArrowDown as ArrowDownIcon,
} from '@mui/icons-material';
import { useSchemas, useSaveSchema, useDeleteSchema } from '@/hooks/useSchemas';
import { JsonSchema, SchemaField } from 'mockingjar-lib/dist/types/schema';
import { createSchemaTemplates } from '@/lib/template';

export default function SchemaList() {
  const router = useRouter();
  const { data: schemas, isLoading, error } = useSchemas();
  const saveSchema = useSaveSchema();
  const deleteSchema = useDeleteSchema();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  // Memoize schema templates to prevent recreation on every render
  const schemaTemplates = useMemo(() => createSchemaTemplates(), []);

  // Create dropdown state
  const [createDropdownAnchor, setCreateDropdownAnchor] =
    useState<null | HTMLElement>(null);

  // Create dialog state (for "From Scratch" option)
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newSchemaName, setNewSchemaName] = useState('');
  const [newSchemaDescription, setNewSchemaDescription] = useState('');

  // Template selection dialog state
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);

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
      router.push(`/mockingjar/schema/${result.id}`);
    } catch (error) {
      console.error('Failed to create schema:', error);
    }
  };

  const handleCreateDropdownOpen = (event: React.MouseEvent<HTMLElement>) => {
    setCreateDropdownAnchor(event.currentTarget);
  };

  const handleCreateDropdownClose = () => {
    setCreateDropdownAnchor(null);
  };

  const handleCreateFromScratch = () => {
    handleCreateDropdownClose();
    setCreateDialogOpen(true);
  };

  const handleCreateFromTemplate = () => {
    handleCreateDropdownClose();
    setTemplateDialogOpen(true);
  };

  const handleTemplateSelect = async (
    templateKey: keyof typeof schemaTemplates
  ) => {
    const template = schemaTemplates[templateKey];
    const newSchema: JsonSchema = {
      name: template.name,
      description: `Generated from ${template.name} template`,
      fields: template.fields as SchemaField[],
    };

    try {
      const result = await saveSchema.mutateAsync(newSchema);
      setTemplateDialogOpen(false);
      // Navigate to the new schema builder
      router.push(`/mockingjar/schema/${result.id}`);
    } catch (error) {
      console.error('Failed to create schema from template:', error);
    }
  };

  const handleEditSchema = (schemaId: string) => {
    router.push(`/mockingjar/schema/${schemaId}`);
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

  const handleMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    schemaId: string
  ) => {
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
      <Box
        display='flex'
        justifyContent='center'
        alignItems='center'
        minHeight='400px'
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity='error' sx={{ mb: 2 }}>
        Failed to load schemas. Please try again.
      </Alert>
    );
  }

  return (
    <>
      <Box
        display='flex'
        justifyContent='space-between'
        alignItems='flex-start'
        my={3}
      >
        <Box>
          <Typography variant='body2' color='text.secondary'>
            Manage your JSON schemas for data generation
          </Typography>
        </Box>
        {isMobile ? (
          <Fab
            sx={{ position: 'fixed', bottom: 20, right: 16 }}
            onClick={handleCreateDropdownOpen}
            color='primary'
          >
            <AddIcon />
          </Fab>
        ) : (
          <Button
            variant='contained'
            endIcon={<ArrowDownIcon />}
            onClick={handleCreateDropdownOpen}
            size='large'
          >
            Create Schema
          </Button>
        )}
      </Box>

      {schemas && schemas.length === 0 ? (
        <Box
          display='flex'
          flexDirection='column'
          alignItems='center'
          justifyContent='center'
          minHeight='400px'
          textAlign='center'
        >
          <SchemaIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
          <Typography variant='h5' gutterBottom color='text.secondary'>
            No schemas yet
          </Typography>
          <Typography variant='body1' color='text.secondary' mb={3}>
            Create your first schema to start generating mock data
          </Typography>
          <Button
            variant='contained'
            startIcon={<AddIcon />}
            onClick={handleCreateDropdownOpen}
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
                transition:
                  'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: 4,
                },
              }}
            >
              <CardActionArea
                component='span'
                onClick={() => handleEditSchema(schema.id)}
              >
                <CardContent sx={{ width: '100%', height: '100%' }}>
                  <Box
                    display='flex'
                    justifyContent='space-between'
                    alignItems='flex-start'
                    mb={1}
                  >
                    <Typography
                      variant='h6'
                      component='h2'
                      noWrap
                      sx={{ flexGrow: 1, mr: 1 }}
                    >
                      {schema.name}
                    </Typography>
                    <IconButton
                      size='small'
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMenuOpen(e, schema.id);
                      }}
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </Box>

                  {schema.description && (
                    <Typography
                      variant='body2'
                      color='text.secondary'
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

                  <Box display='flex' flexWrap='wrap' gap={1} mb={2}>
                    <Chip
                      label={`${schema.structure.fields.length} fields`}
                      size='small'
                      variant='outlined'
                    />
                  </Box>

                  <Typography variant='caption' color='text.secondary'>
                    Created {formatDate(schema.createdAt)}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          ))}
        </Box>
      )}

      {/* Create Schema Dropdown Menu */}
      <Menu
        anchorEl={createDropdownAnchor}
        open={Boolean(createDropdownAnchor)}
        onClose={handleCreateDropdownClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem onClick={handleCreateFromScratch}>
          <AddIcon sx={{ mr: 1 }} />
          From Scratch
        </MenuItem>
        <MenuItem onClick={handleCreateFromTemplate}>
          <SchemaIcon sx={{ mr: 1 }} />
          From Template
        </MenuItem>
      </Menu>

      {/* Template Selection Dialog */}
      <Dialog
        open={templateDialogOpen}
        onClose={() => setTemplateDialogOpen(false)}
        maxWidth='md'
        fullWidth
      >
        <DialogTitle>Choose Schema Template</DialogTitle>
        <DialogContent>
          <Typography variant='body2' color='text.secondary' gutterBottom>
            Select a pre-built template to get started quickly. You can
            customize the fields after applying the template.
          </Typography>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
              gap: 2,
              mt: 2,
            }}
          >
            {Object.entries(schemaTemplates).map(([key, template]) => (
              <Card
                key={key}
                sx={{
                  cursor: 'pointer',
                  border: '1px solid',
                  borderColor: 'divider',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    borderColor: 'primary.main',
                    backgroundColor: 'action.hover',
                    transform: 'translateY(-2px)',
                    boxShadow: 2,
                  },
                }}
                onClick={() =>
                  handleTemplateSelect(key as keyof typeof schemaTemplates)
                }
              >
                <CardContent>
                  <Typography variant='h6' gutterBottom>
                    {template.name}
                  </Typography>
                  <Typography
                    variant='body2'
                    color='text.secondary'
                    gutterBottom
                  >
                    {template.fields.length} fields
                  </Typography>
                  <Box
                    sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}
                  >
                    {template.fields.slice(0, 4).map((field) => (
                      <Chip
                        key={field.id}
                        label={field.name}
                        size='small'
                        variant='outlined'
                        sx={{ fontSize: '0.7rem' }}
                      />
                    ))}
                    {template.fields.length > 4 && (
                      <Chip
                        label={`+${template.fields.length - 4} more`}
                        size='small'
                        variant='outlined'
                        color='primary'
                        sx={{ fontSize: '0.7rem' }}
                      />
                    )}
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTemplateDialogOpen(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>

      {/* Action Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
      >
        <MenuItem
          onClick={() => selectedSchemaId && handleEditSchema(selectedSchemaId)}
        >
          <EditIcon sx={{ mr: 1 }} />
          Edit Schema
        </MenuItem>
        <MenuItem
          onClick={() =>
            selectedSchemaId && handleDeleteClick(selectedSchemaId)
          }
          sx={{ color: 'error.main' }}
        >
          <DeleteIcon sx={{ mr: 1 }} />
          Delete Schema
        </MenuItem>
      </Menu>

      {/* Create Schema Dialog */}
      <Dialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        maxWidth='sm'
        fullWidth
      >
        <DialogTitle>Create New Schema</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin='dense'
            label='Schema Name'
            fullWidth
            variant='outlined'
            value={newSchemaName}
            onChange={(e) => setNewSchemaName(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            margin='dense'
            label='Description (optional)'
            fullWidth
            multiline
            rows={3}
            variant='outlined'
            value={newSchemaDescription}
            onChange={(e) => setNewSchemaDescription(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleCreateSchema}
            variant='contained'
            disabled={!newSchemaName.trim() || saveSchema.isPending}
          >
            {saveSchema.isPending ? <CircularProgress size={24} /> : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Schema</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this schema? This action cannot be
            undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleDeleteConfirm}
            color='error'
            variant='contained'
            disabled={deleteSchema.isPending}
          >
            {deleteSchema.isPending ? <CircularProgress size={24} /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
