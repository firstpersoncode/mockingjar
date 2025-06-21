'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { debounce } from 'lodash';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Switch,
  FormControlLabel,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
  CircularProgress,
  Stack,
  Skeleton,
  InputAdornment,
  Card,
  CardContent,
  CardActionArea,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Visibility as PreviewIcon,
  ExpandMore as ExpandMoreIcon,
  AddCircle as AddChildIcon,
  Settings as SettingsIcon,
  KeyboardArrowDown as ArrowDownIcon,
  CheckCircleOutline,
} from '@mui/icons-material';
import { SchemaField, JsonSchema } from 'mockingjar-lib/dist/types/schema';
import { SavedSchema } from '@/types/schema';
import { format } from 'date-fns';
import { useSchemas } from '@/hooks/useSchemas';
import { add, convertSchemaToJson, remove, update } from 'mockingjar-lib';
interface SchemaBuilderProps {
  updatedAt?: Date;
  schemaId?: string; // Optional schema ID, defaults to "new" for new schemas
  initialSchema?: JsonSchema;
  onSave: (schema: JsonSchema) => void;
  onUpdate?: (schema: JsonSchema) => void;
  onUpdateName?: (name: string, currentSchema: JsonSchema) => void;
  isSaving?: boolean;
  isUpdatingName?: boolean;
  saveError?: string;
  saveSuccess?: boolean;
}

export default function SchemaBuilder({
  updatedAt,
  schemaId = 'new',
  initialSchema = {
    name: 'New Schema',
    description: '',
    fields: [],
  },
  onSave,
  onUpdate,
  onUpdateName,
  isSaving = false,
  isUpdatingName = false,
  saveError,
  saveSuccess,
}: SchemaBuilderProps) {
  const [schema, setSchema] = useState<JsonSchema>(() => initialSchema);
  const [selectedField, setSelectedField] = useState<SchemaField | null>(null);
  const [fieldPropertiesDialogOpen, setFieldPropertiesDialogOpen] =
    useState(false);
  const [jsonPreviewDialogOpen, setJsonPreviewDialogOpen] = useState(false);
  const [schemaSelectionDialogOpen, setSchemaSelectionDialogOpen] =
    useState(false);
  const [targetFieldIdForSchema, setTargetFieldIdForSchema] = useState<
    string | null
  >(null);

  // Hook to get available schemas
  const { data: schemas = [], isLoading: schemasLoading } = useSchemas();

  // Local state for name editing
  const [tempName, setTempName] = useState(schema.name);

  // State for managing collapsed/expanded state of object fields
  const [collapsedFields, setCollapsedFields] = useState<Set<string>>(
    new Set()
  );

  // Sync with initialSchema prop changes
  useEffect(() => {
    if (initialSchema) {
      setSchema(initialSchema);
      setTempName(initialSchema.name);
    }
  }, [initialSchema]);

  // Create debounced auto-save function (5 seconds of inactivity)
  const debouncedAutoSave = useMemo(
    () =>
      debounce((schemaToSave: JsonSchema) => {
        if (onUpdate) {
          onUpdate(schemaToSave);
        }
      }, 5000),
    [onUpdate]
  );

  // Auto-save when schema changes (but not on initial load)
  useEffect(() => {
    // Skip auto-save for initial schema load
    if (
      initialSchema &&
      JSON.stringify(schema) === JSON.stringify(initialSchema)
    ) {
      return;
    }

    // Skip auto-save if schema is empty (new schema case)
    if (schema.fields.length === 0 && schema.name === 'New Schema') {
      return;
    }

    // Trigger debounced auto-save
    debouncedAutoSave(schema);

    // Cleanup function to cancel pending auto-save on unmount
    return () => {
      debouncedAutoSave.cancel();
    };
  }, [schema, debouncedAutoSave, initialSchema]);

  // Cleanup debounced function on unmount
  useEffect(() => {
    return () => {
      debouncedAutoSave.cancel();
    };
  }, [debouncedAutoSave]);

  const handleSaveName = () => {
    if (onUpdateName && tempName.trim() !== schema.name) {
      // Update local schema state immediately for UI responsiveness
      const updatedSchema = { ...schema, name: tempName.trim() };
      setSchema(updatedSchema);
      // Call the parent's update function with both name and current schema
      onUpdateName(tempName.trim(), updatedSchema);
    }
  };

  const selectField = useCallback((field: SchemaField) => {
    setSelectedField(field);
    setFieldPropertiesDialogOpen(true);
  }, []);

  // Helper function to format dates
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Handler for opening schema selection dialog
  const handleSchemaSelection = useCallback((fieldId: string) => {
    setTargetFieldIdForSchema(fieldId);
    setSchemaSelectionDialogOpen(true);
  }, []);

  // Handler for selecting a schema from the dialog
  const handleSchemaSelected = useCallback(
    (selectedSchema: SavedSchema) => {
      if (!targetFieldIdForSchema) return;

      setSchema((prevSchema) =>
        update.fieldTypeSchema(
          targetFieldIdForSchema,
          prevSchema,
          selectedSchema.structure
        )
      );

      // Close dialog and clear target field
      setSchemaSelectionDialogOpen(false);
      setTargetFieldIdForSchema(null);
    },
    [targetFieldIdForSchema]
  );

  // Toggle collapse state for a field (UI only)
  const toggleFieldCollapse = useCallback((fieldId: string) => {
    setCollapsedFields((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(fieldId)) {
        newSet.delete(fieldId);
      } else {
        newSet.add(fieldId);
      }
      return newSet;
    });
  }, []);

  const updateField = useCallback((updatedField: SchemaField) => {
    setSchema((prevSchema) =>
      update.field(updatedField.id, updatedField, prevSchema)
    );
    setSelectedField(updatedField);
  }, []);

  const removeField = useCallback((fieldId: string) => {
    setSchema((prevSchema) => remove.field(fieldId, prevSchema));
    setSelectedField(null);
  }, []);

  const handleSaveSchema = useCallback(() => {
    onSave(schema);
  }, [onSave, schema]);

  // Simple function to add a field directly to the schema (for tree view button)
  const addFieldToTree = useCallback(() => {
    setSchema(add.field);
  }, []);

  const generatePreview = useMemo(
    (): Record<string, unknown> =>
      convertSchemaToJson(schema, { collapsedFields, forPreview: true }),
    [schema, collapsedFields]
  );

  const renderArrayItemTree = (
    arrayItem: SchemaField,
    parentPath: string[],
    level: number
  ): React.ReactNode => {
    if (arrayItem.type === 'object') {
      return (
        <Box key={`${arrayItem.id}-arrayitem`} sx={{ mb: 1 }}>
          <Box
            display='flex'
            alignItems='center'
            gap={1}
            py={1}
            px={1}
            ml={level * 5}
            sx={{
              '&:hover': { backgroundColor: 'action.hover' },
              backgroundColor: `rgba(0,0,0,${level * 0.015})`,
              borderRadius: 2,
              border: '1px dashed',
              borderColor: 'divider',
              mb: 1,
            }}
          >
            <Button
              variant='outlined'
              size='small'
              startIcon={<SettingsIcon />}
              onClick={(e) => {
                e.stopPropagation();
                selectField(arrayItem);
              }}
              sx={{
                fontSize: '0.75rem',
                py: 0.25,
                px: 1,
                minWidth: 'auto',
                fontWeight: 'normal',
                fontStyle: 'italic',
                textTransform: 'none',
                justifyContent: 'flex-start',
                '& .MuiButton-startIcon': {
                  marginRight: 0.5,
                  marginLeft: 0,
                },
                // backgroundColor: 'background.default',
              }}
            >
              {arrayItem.name} (array item)
            </Button>
            {/* Editable array item type selection - replaces static chip */}
            <FormControl size='small' sx={{ minWidth: 80 }}>
              <Select
                value={arrayItem.type}
                onChange={(e) => {
                  const newType = e.target.value as SchemaField['type'];
                  if (newType === 'schema') {
                    handleSchemaSelection(arrayItem.id);
                    return;
                  }

                  // Update the schema by finding and updating this specific arrayItem
                  setSchema((prevSchema) =>
                    update.fieldType(arrayItem.id, newType, prevSchema)
                  );
                }}
                displayEmpty
                sx={{
                  fontSize: '0.75rem',
                  '& .MuiSelect-select': { py: 0.25, px: 1 },
                  '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                  borderRadius: 1,
                  minHeight: '20px',
                  // backgroundColor: 'background.default',
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <MenuItem value='text'>Text</MenuItem>
                <MenuItem value='number'>Number</MenuItem>
                <MenuItem value='boolean'>Boolean</MenuItem>
                <MenuItem value='date'>Date</MenuItem>
                <MenuItem value='email'>Email</MenuItem>
                <MenuItem value='url'>URL</MenuItem>
                <MenuItem value='array'>Array</MenuItem>
                <MenuItem value='object'>Object</MenuItem>
                <MenuItem value='schema'>Schema</MenuItem>
              </Select>
            </FormControl>
            {/* Add Child button for array object items - inline with toolbar */}
            <Button
              variant='outlined'
              size='small'
              startIcon={<AddChildIcon />}
              onClick={(e) => {
                e.stopPropagation();
                setSchema((prevSchema) =>
                  add.objectField(arrayItem.id, prevSchema)
                );
              }}
              sx={{
                fontSize: '0.75rem',
                py: 0.25,
                px: 1,
                minWidth: 'auto',
                borderStyle: 'dashed',
                borderColor: 'grey.400',
                color: 'grey.600',
                // backgroundColor: 'background.default',
                '&:hover': {
                  borderColor: 'grey.600',
                  backgroundColor: 'grey.50',
                },
              }}
            >
              Add Field
            </Button>

            {arrayItem.logic?.required && (
              <Chip
                label='Required'
                size='small'
                color='error'
                variant='outlined'
                sx={{ fontSize: '0.65rem', height: '18px' }}
                onClick={(e) => e.stopPropagation()}
              />
            )}

            {arrayItem.logic?.enum && (
              <Chip
                label='Enum'
                size='small'
                color='info'
                variant='outlined'
                sx={{ fontSize: '0.65rem', height: '18px' }}
                onClick={(e) => e.stopPropagation()}
              />
            )}

            {(arrayItem.logic?.minItems || arrayItem.logic?.maxItems) && (
              <Chip
                label={`Min: ${arrayItem.logic?.minItems || '0'} Max: ${
                  arrayItem.logic?.maxItems || '10'
                }`}
                size='small'
                color='info'
                variant='outlined'
                sx={{ fontSize: '0.65rem', height: '18px' }}
                onClick={(e) => e.stopPropagation()}
              />
            )}

            <Box sx={{ flexGrow: 1 }} />

            {/* Children count display when collapsed */}
            {arrayItem.children &&
              arrayItem.children.length > 0 &&
              collapsedFields.has(arrayItem!.id) && (
                <Chip
                  label={`${arrayItem.children.length} field${
                    arrayItem.children.length !== 1 ? 's' : ''
                  }`}
                  size='small'
                  color='info'
                  variant='outlined'
                  sx={{ fontSize: '0.65rem', height: '18px' }}
                  onClick={(e) => e.stopPropagation()}
                />
              )}

            {/* Collapsible arrow for fields with children */}
            {arrayItem.children && arrayItem.children.length > 0 ? (
              <IconButton
                size='small'
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFieldCollapse(arrayItem!.id);
                }}
                sx={{ p: 0.25 }}
              >
                <ArrowDownIcon
                  fontSize='small'
                  sx={{
                    transform: !collapsedFields.has(arrayItem!.id)
                      ? 'rotate(180deg)'
                      : undefined,
                  }}
                />
              </IconButton>
            ) : (
              <Box sx={{ width: 24 }} /> // Spacer to align fields without children
            )}
          </Box>

          {arrayItem.children &&
            arrayItem.children.length > 0 &&
            !collapsedFields.has(arrayItem!.id) &&
            renderTreeItems(
              arrayItem.children,
              [...parentPath, 'arrayItem'],
              level + 1
            )}
        </Box>
      );
    } else if (arrayItem.type === 'array' && arrayItem.arrayItemType) {
      return (
        <Box key={`${arrayItem.id}-nestedarray`} sx={{ mb: 1 }}>
          <Box
            display='flex'
            alignItems='center'
            gap={1}
            py={1}
            px={1}
            ml={level * 5}
            sx={{
              backgroundColor: `rgba(0,0,0,${level * 0.015})`,
              borderRadius: 2,
              border: '1px dashed',
              borderColor: 'divider',
              mb: 1,
            }}
          >
            <Button
              variant='outlined'
              size='small'
              startIcon={<SettingsIcon />}
              onClick={(e) => {
                e.stopPropagation();
                selectField(arrayItem);
              }}
              sx={{
                fontSize: '0.75rem',
                py: 0.25,
                px: 1,
                minWidth: 'auto',
                fontWeight: 'normal',
                fontStyle: 'italic',
                textTransform: 'none',
                justifyContent: 'flex-start',
                color: 'text.secondary',
                '& .MuiButton-startIcon': {
                  marginRight: 0.5,
                  marginLeft: 0,
                },
                // backgroundColor: 'background.default',
              }}
            >
              {arrayItem.name} (nested array)
            </Button>
            {/* Editable nested array item type selection */}
            <FormControl size='small' sx={{ minWidth: 100 }}>
              <Select
                value={arrayItem.arrayItemType?.type || 'text'}
                onChange={(e) => {
                  const newItemType = e.target.value as SchemaField['type'];

                  if (newItemType === 'schema') {
                    handleSchemaSelection(arrayItem.id);
                    return;
                  }

                  // Update the schema by finding and updating this specific arrayItem
                  setSchema((prevSchema) =>
                    update.arrayItemFieldType(
                      arrayItem.id,
                      newItemType,
                      prevSchema
                    )
                  );
                }}
                displayEmpty
                sx={{
                  fontSize: '0.75rem',
                  '& .MuiSelect-select': { py: 0.25, px: 1 },
                  '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                  borderRadius: 1,
                  minHeight: '20px',
                  // backgroundColor: 'background.default',
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <MenuItem value='text'>Text</MenuItem>
                <MenuItem value='number'>Number</MenuItem>
                <MenuItem value='boolean'>Boolean</MenuItem>
                <MenuItem value='date'>Date</MenuItem>
                <MenuItem value='email'>Email</MenuItem>
                <MenuItem value='url'>URL</MenuItem>
                <MenuItem value='object'>Object</MenuItem>
                <MenuItem value='array'>Array</MenuItem>
                <MenuItem value='schema'>Schema</MenuItem>
              </Select>
            </FormControl>

            {(arrayItem.logic?.minItems || arrayItem.logic?.maxItems) && (
              <Chip
                label={`Min: ${arrayItem.logic?.minItems || '0'} Max: ${
                  arrayItem.logic?.maxItems || '10'
                }`}
                size='small'
                color='info'
                variant='outlined'
                sx={{ fontSize: '0.65rem', height: '18px' }}
                onClick={(e) => e.stopPropagation()}
              />
            )}

            <Box sx={{ flexGrow: 1 }} />
          </Box>

          {renderArrayItemTree(
            arrayItem.arrayItemType,
            [...parentPath, 'arrayItem'],
            level + 1
          )}
        </Box>
      );
    }
    return null;
  };

  const renderTreeItems = (
    fields: SchemaField[],
    parentPath: string[] = [],
    level: number = 0
  ) => {
    return fields.map((field) => {
      const isCollapsed = collapsedFields.has(field.id);
      const hasChildren =
        (field.type === 'object' &&
          field.children &&
          field.children.length > 0) ||
        (field.type === 'array' && field.arrayItemType); // Always show arrow for arrays with items
      const childrenCount =
        field.type === 'object'
          ? field.children?.length || 0
          : field.type === 'array' && field.arrayItemType
          ? 1
          : 0; // Arrays always show "1 item" when collapsed

      return (
        <Box key={field.id}>
          <Box
            display='flex'
            alignItems='center'
            gap={1}
            py={1}
            px={1}
            ml={level * 5}
            sx={{
              '&:hover': { backgroundColor: 'action.hover' },
              backgroundColor: `rgba(0,0,0,${level * 0.015})`,
              borderRadius: 2,
              border: '1px dashed',
              borderColor: 'divider',
              mb: 1,
            }}
          >
            {/* Field name button with settings icon */}
            <Button
              variant='outlined'
              size='small'
              startIcon={<SettingsIcon />}
              onClick={(e) => {
                e.stopPropagation();
                selectField(field);
              }}
              sx={{
                fontSize: '0.8rem',
                py: 0.25,
                px: 1,
                minWidth: 'auto',
                fontWeight: parentPath.length > 0 ? 'normal' : 'medium',
                textTransform: 'none',
                justifyContent: 'flex-start',
                '& .MuiButton-startIcon': {
                  marginRight: 0.5,
                  marginLeft: 0,
                },
                // backgroundColor: 'background.default',
              }}
            >
              {field.name}
            </Button>

            {/* Editable field type chip */}
            <FormControl size='small' sx={{ minWidth: 80 }}>
              <Select
                value={field.type}
                onChange={(e) => {
                  const newType = e.target.value as SchemaField['type'];

                  if (newType === 'schema') {
                    handleSchemaSelection(field.id);
                    return;
                  }

                  setSchema((prevSchema) =>
                    update.fieldType(field.id, newType, prevSchema)
                  );
                }}
                displayEmpty
                sx={{
                  fontSize: '0.75rem',
                  '& .MuiSelect-select': { py: 0.25, px: 1 },
                  '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                  borderRadius: 1,
                  minHeight: '20px',
                  // backgroundColor: 'background.default',
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <MenuItem value='text'>Text</MenuItem>
                <MenuItem value='number'>Number</MenuItem>
                <MenuItem value='boolean'>Boolean</MenuItem>
                <MenuItem value='date'>Date</MenuItem>
                <MenuItem value='email'>Email</MenuItem>
                <MenuItem value='url'>URL</MenuItem>
                <MenuItem value='array'>Array</MenuItem>
                <MenuItem value='object'>Object</MenuItem>
                <MenuItem value='schema'>Schema</MenuItem>
              </Select>
            </FormControl>

            {/* Add Child button for object types - inline with toolbar */}
            {field.type === 'object' && (
              <Button
                size='small'
                variant='outlined'
                startIcon={<AddChildIcon />}
                onClick={(e) => {
                  e.stopPropagation();

                  setSchema((prevSchema) =>
                    add.objectField(field.id, prevSchema)
                  );
                }}
                sx={{
                  fontSize: '0.7rem',
                  py: 0.25,
                  px: 1,
                  minWidth: 'auto',
                  borderStyle: 'dashed',
                  color: 'text.secondary',
                  borderColor: 'divider',
                  // backgroundColor: 'background.default',
                  '&:hover': {
                    borderColor: 'primary.main',
                    backgroundColor: 'action.hover',
                  },
                }}
              >
                Add Field
              </Button>
            )}

            {field.logic?.required && (
              <Chip
                label='Required'
                size='small'
                color='error'
                variant='outlined'
                sx={{ fontSize: '0.65rem', height: '18px' }}
                onClick={(e) => e.stopPropagation()}
              />
            )}

            {field.logic?.enum && (
              <Chip
                label='Enum'
                size='small'
                color='info'
                variant='outlined'
                sx={{ fontSize: '0.65rem', height: '18px' }}
                onClick={(e) => e.stopPropagation()}
              />
            )}

            {(field.logic?.minItems || field.logic?.maxItems) && (
              <Chip
                label={`Min: ${field.logic?.minItems || '0'} Max: ${
                  field.logic?.maxItems || '10'
                }`}
                size='small'
                color='info'
                variant='outlined'
                sx={{ fontSize: '0.65rem', height: '18px' }}
                onClick={(e) => e.stopPropagation()}
              />
            )}

            <Box sx={{ flexGrow: 1 }} />

            {/* Children count display when collapsed */}
            {hasChildren && isCollapsed && (
              <Chip
                label={`${childrenCount} field${
                  childrenCount !== 1 ? 's' : ''
                }`}
                size='small'
                color='info'
                variant='outlined'
                sx={{ fontSize: '0.65rem', height: '18px' }}
                onClick={(e) => e.stopPropagation()}
              />
            )}

            {/* Collapsible arrow for fields with children */}
            {hasChildren ? (
              <IconButton
                size='small'
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFieldCollapse(field.id);
                }}
                sx={{ p: 0.25 }}
              >
                <ArrowDownIcon
                  fontSize='small'
                  sx={{
                    transform: !isCollapsed ? 'rotate(180deg)' : undefined,
                  }}
                />
              </IconButton>
            ) : (
              <Box sx={{ width: 24 }} /> // Spacer to align fields without children
            )}
          </Box>

          {/* Render array item as tree node - only when array field is not collapsed */}
          {field.type === 'array' && field.arrayItemType && !isCollapsed && (
            <Box key={`${field.id}-arrayitem`}>
              <Box
                display='flex'
                alignItems='center'
                gap={1}
                py={1}
                px={1}
                ml={(level + 1) * 5}
                sx={{
                  '&:hover': { backgroundColor: 'action.hover' },
                  backgroundColor: `rgba(0,0,0,${(level + 1) * 0.015})`,
                  borderRadius: 2,
                  border: '1px dashed',
                  borderColor: 'divider',
                  mb: 1,
                }}
              >
                <Button
                  variant='outlined'
                  size='small'
                  startIcon={<SettingsIcon />}
                  onClick={(e) => {
                    e.stopPropagation();
                    selectField(field.arrayItemType!);
                  }}
                  sx={{
                    fontSize: '0.75rem',
                    py: 0.25,
                    px: 1,
                    minWidth: 'auto',
                    fontWeight: 'normal',
                    fontStyle: 'italic',
                    textTransform: 'none',
                    justifyContent: 'flex-start',
                    '& .MuiButton-startIcon': {
                      marginRight: 0.5,
                      marginLeft: 0,
                    },
                    // backgroundColor: 'background.default',
                  }}
                >
                  {field.arrayItemType?.name || 'item'} (array item)
                </Button>

                {/* Editable array item type selection - replaces static chip */}
                <FormControl size='small' sx={{ minWidth: 80 }}>
                  <Select
                    value={field.arrayItemType?.type || 'text'}
                    onChange={(e) => {
                      const newItemType = e.target.value as SchemaField['type'];

                      if (newItemType === 'schema') {
                        handleSchemaSelection(field.id);
                        return;
                      }

                      setSchema((prevSchema) =>
                        update.arrayItemFieldType(
                          field.id,
                          newItemType,
                          prevSchema
                        )
                      );
                    }}
                    displayEmpty
                    sx={{
                      fontSize: '0.75rem',
                      '& .MuiSelect-select': { py: 0.25, px: 1 },
                      '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                      // backgroundColor: 'background.default',
                      borderRadius: 1,
                      minHeight: '20px',
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MenuItem value='text'>Text</MenuItem>
                    <MenuItem value='number'>Number</MenuItem>
                    <MenuItem value='boolean'>Boolean</MenuItem>
                    <MenuItem value='date'>Date</MenuItem>
                    <MenuItem value='email'>Email</MenuItem>
                    <MenuItem value='url'>URL</MenuItem>
                    <MenuItem value='array'>Array</MenuItem>
                    <MenuItem value='object'>Object</MenuItem>
                    <MenuItem value='schema'>Schema</MenuItem>
                  </Select>
                </FormControl>

                {/* Add Child button for array object items - inline with toolbar */}
                {field.arrayItemType?.type === 'object' && (
                  <Button
                    variant='outlined'
                    size='small'
                    startIcon={<AddChildIcon />}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSchema((prevSchema) =>
                        add.arrayItemObjectField(field.id, prevSchema)
                      );
                    }}
                    sx={{
                      fontSize: '0.75rem',
                      py: 0.25,
                      px: 1,
                      minWidth: 'auto',
                      borderStyle: 'dashed',
                      borderColor: 'grey.400',
                      color: 'grey.600',
                      // backgroundColor: 'background.default',
                      '&:hover': {
                        borderColor: 'grey.600',
                        backgroundColor: 'grey.50',
                      },
                    }}
                  >
                    Add Field
                  </Button>
                )}

                {field.arrayItemType?.logic?.required && (
                  <Chip
                    label='Required'
                    size='small'
                    color='error'
                    variant='outlined'
                    sx={{ fontSize: '0.65rem', height: '18px' }}
                    onClick={(e) => e.stopPropagation()}
                  />
                )}

                {field.arrayItemType?.logic?.enum && (
                  <Chip
                    label='Enum'
                    size='small'
                    color='info'
                    variant='outlined'
                    sx={{ fontSize: '0.65rem', height: '18px' }}
                    onClick={(e) => e.stopPropagation()}
                  />
                )}

                {(field.arrayItemType?.logic?.minItems ||
                  field.arrayItemType?.logic?.maxItems) && (
                  <Chip
                    label={`Min: ${
                      field.arrayItemType?.logic?.minItems || '0'
                    } Max: ${field.arrayItemType?.logic?.maxItems || '10'}`}
                    size='small'
                    color='info'
                    variant='outlined'
                    sx={{ fontSize: '0.65rem', height: '18px' }}
                    onClick={(e) => e.stopPropagation()}
                  />
                )}

                <Box sx={{ flexGrow: 1 }} />

                {/* Children count display when collapsed */}
                {((field.arrayItemType?.type === 'object' &&
                  field.arrayItemType?.children &&
                  field.arrayItemType.children.length > 0) ||
                  (field.arrayItemType?.type === 'array' &&
                    field.arrayItemType?.arrayItemType)) &&
                  collapsedFields.has(field.arrayItemType!.id) && (
                    <Chip
                      label={
                        field.arrayItemType?.type === 'object'
                          ? `${
                              field.arrayItemType.children?.length || 0
                            } field${
                              (field.arrayItemType.children?.length || 0) !== 1
                                ? 's'
                                : ''
                            }`
                          : '1 nested array'
                      }
                      size='small'
                      color='info'
                      variant='outlined'
                      sx={{ fontSize: '0.65rem', height: '18px' }}
                      onClick={(e) => e.stopPropagation()}
                    />
                  )}

                {/* Collapsible arrow for fields with children */}
                {(field.arrayItemType?.type === 'object' &&
                  field.arrayItemType?.children &&
                  field.arrayItemType.children.length > 0) ||
                (field.arrayItemType?.type === 'array' &&
                  field.arrayItemType?.arrayItemType) ? (
                  <IconButton
                    size='small'
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFieldCollapse(field.arrayItemType!.id);
                    }}
                    sx={{ p: 0.25 }}
                  >
                    <ArrowDownIcon
                      fontSize='small'
                      sx={{
                        transform: !collapsedFields.has(field.arrayItemType!.id)
                          ? 'rotate(180deg)'
                          : undefined,
                      }}
                    />
                  </IconButton>
                ) : (
                  <Box sx={{ width: 24 }} /> // Spacer to align fields without children
                )}
              </Box>

              {/* Render children of array object items - only for object types when expanded */}
              {field.arrayItemType?.type === 'object' &&
                field.arrayItemType?.children &&
                field.arrayItemType.children.length > 0 &&
                !collapsedFields.has(field.arrayItemType.id) &&
                renderTreeItems(
                  field.arrayItemType.children,
                  [...parentPath, field.id, 'arrayItem'],
                  level + 2
                )}
            </Box>
          )}

          {/* Render nested array items recursively - only when parent array is expanded and nested array is expanded */}
          {field.type === 'array' &&
            field.arrayItemType &&
            field.arrayItemType.type === 'array' &&
            !isCollapsed &&
            !collapsedFields.has(field.arrayItemType.id) &&
            renderArrayItemTree(
              field.arrayItemType,
              [...parentPath, field.id, 'arrayItem'],
              level + 1
            )}

          {/* Render children only when not collapsed */}
          {!isCollapsed && (
            <>
              {/* Render children for object fields */}
              {field.children &&
                field.children.length > 0 &&
                renderTreeItems(
                  field.children,
                  [...parentPath, field.id],
                  level + 1
                )}
            </>
          )}
        </Box>
      );
    });
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', lg: 'row' },
        alignItems: 'flex-start',
        gap: { xs: 2, md: 3 },
        my: 2,
      }}
    >
      {/* Schema Tree */}
      <Box sx={{ flex: { lg: '1 1 60%' } }}>
        <Paper
          sx={{
            p: { xs: 1, sm: 2 },
            border: '2px dashed',
            borderColor: 'divider',
          }}
        >
          <Box
            display='flex'
            justifyContent='space-between'
            alignItems='center'
            mb={{ xs: 1, sm: 2 }}
            gap={2}
          >
            {/* <Typography
              variant='h6'
              sx={{
                fontSize: { xs: '1rem', sm: '1.25rem' },
              }}
            >
              Schema
            </Typography> */}

            <TextField
              sx={{ flex: 1 }}
              fullWidth
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
              placeholder='Enter schema name'
              size='small'
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSaveName();
                }
              }}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position='start'>
                      <Typography
                        variant='body2'
                        color='text.secondary'
                        sx={{ fontStyle: 'italic' }}
                      >
                        Name:
                      </Typography>
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position='end'>
                      <Button
                        variant='contained'
                        size='small'
                        onClick={handleSaveName}
                        disabled={
                          isUpdatingName ||
                          !tempName.trim() ||
                          tempName === schema.name
                        }
                        sx={{
                          fontSize: '0.7rem',
                          py: 0.25,
                          minHeight: 0,
                        }}
                      >
                        {isUpdatingName ? (
                          <CircularProgress size={16} />
                        ) : (
                          'Save'
                        )}
                      </Button>
                    </InputAdornment>
                  ),
                },
              }}
            />
          </Box>

          {schema.fields.length === 0 ? (
            <Typography
              variant='body2'
              color='text.secondary'
              sx={{
                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                textAlign: 'center',
                py: 2,
              }}
            >
              No fields added yet. Use the &quot;Add Field&quot; button below to
              add your first field.
            </Typography>
          ) : (
            <Box>{renderTreeItems(schema.fields)}</Box>
          )}

          {/* Inline Add Field Button - Always visible */}
          <Box sx={{ mt: 2 }}>
            <Button
              variant='outlined'
              size='large'
              startIcon={<AddIcon />}
              onClick={addFieldToTree}
              sx={{
                fontSize: '0.75rem',
                textTransform: 'none',
                borderStyle: 'dashed',
                color: 'text.secondary',
                borderColor: 'grey.300',
                // backgroundColor: 'background.default',
                '&:hover': {
                  borderColor: 'primary.main',
                  color: 'primary.main',
                  backgroundColor: 'primary.50',
                },
              }}
            >
              Add Field
            </Button>
          </Box>
        </Paper>
      </Box>

      {/* JSON Preview */}
      <Box sx={{ flex: { lg: '1 1 40%' }, position: 'sticky', top: 0 }}>
        <Paper
          sx={{
            p: { xs: 1, sm: 2 },
          }}
        >
          <Box
            display='flex'
            justifyContent='space-between'
            alignItems='center'
            mb={{ xs: 1, sm: 2 }}
            flexWrap='wrap'
            gap={{ xs: 1, sm: 0 }}
          >
            <Stack direction='row' alignItems='center' gap={2}>
              <Typography
                variant='h6'
                sx={{
                  fontSize: { xs: '1rem', sm: '1.25rem' },
                }}
              >
                Preview
              </Typography>
              <Box>
                {isSaving ? (
                  <Skeleton width={150} />
                ) : updatedAt ? (
                  <Stack direction='row' alignItems='center' gap={0.5}>
                    <Typography
                      variant='body2'
                      color='text.secondary'
                      sx={{
                        fontSize: '0.7rem',
                        fontStyle: 'italic',
                      }}
                    >
                      {format(
                        new Date(updatedAt as Date),
                        "dd MMM yyyy 'at' HH:mm"
                      )}
                    </Typography>
                    <CheckCircleOutline
                      sx={{ fontSize: '1rem', color: 'success.main' }}
                    />
                  </Stack>
                ) : (
                  <Typography
                    variant='body2'
                    color='text.secondary'
                    sx={{
                      fontSize: { xs: '0.75rem', sm: '0.875rem' },
                      fontStyle: 'italic',
                    }}
                  >
                    Not saved yet
                  </Typography>
                )}
              </Box>
            </Stack>
            <Box display='flex' gap={0.5} alignItems='center'>
              <IconButton
                onClick={() => setJsonPreviewDialogOpen(true)}
                size='small'
                title='Open in dialog'
              >
                <PreviewIcon />
              </IconButton>
              <Button
                variant='contained'
                onClick={!isSaving ? handleSaveSchema : undefined}
                // disabled={isSaving}
                size='small'
                sx={{
                  fontSize: { xs: '0.75rem', sm: '0.875rem' },
                  px: { xs: 1, sm: 2 },
                }}
                startIcon={
                  isSaving ? (
                    <CircularProgress color='inherit' size={16} />
                  ) : (
                    <SaveIcon />
                  )
                }
              >
                Save
              </Button>
            </Box>
          </Box>

          <Box
            component='pre'
            sx={{
              p: { xs: 1, sm: 2 },
              borderRadius: 1,
              overflow: 'auto',
              fontSize: { xs: '0.75rem', sm: '0.875rem' },
              lineHeight: { xs: 1.3, sm: 1.4 },
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              color: '#fffade',
              backgroundColor: '#000',
              maxHeight: '300px',
            }}
          >
            {JSON.stringify(generatePreview, null, 2)}
          </Box>

          {saveError && (
            <Alert severity='error' sx={{ mt: 2 }}>
              {saveError}
            </Alert>
          )}

          {saveSuccess && (
            <Alert severity='success' sx={{ mt: 2 }}>
              Schema saved successfully!
            </Alert>
          )}
        </Paper>
      </Box>

      {/* Field Properties Dialog */}
      <Dialog
        open={fieldPropertiesDialogOpen}
        onClose={() => setFieldPropertiesDialogOpen(false)}
        maxWidth='sm'
        fullWidth
        sx={{ '& .MuiDialog-paper': { maxHeight: '80vh' } }}
      >
        <DialogTitle>
          Field Properties
          {selectedField && (
            <Typography variant='body2' color='text.secondary'>
              Editing: {selectedField.name} ({selectedField.type})
            </Typography>
          )}
        </DialogTitle>
        <DialogContent>
          {selectedField && (
            <Box sx={{ pt: 1 }}>
              <TextField
                fullWidth
                label='Field Name'
                value={selectedField.name}
                onChange={(e) => {
                  const updatedField = {
                    ...selectedField,
                    name: e.target.value,
                  };
                  updateField(updatedField);
                  setSelectedField(updatedField);
                }}
                margin='normal'
                size='small'
              />

              <FormControl fullWidth margin='normal' size='small'>
                <InputLabel>Field Type</InputLabel>
                <Select
                  value={selectedField.type}
                  onChange={(e) => {
                    const newType = e.target.value as SchemaField['type'];

                    if (newType === 'schema') {
                      handleSchemaSelection(selectedField.id);
                      return;
                    }

                    setSchema((prevSchema) =>
                      update.fieldType(selectedField.id, newType, prevSchema)
                    );

                    setSelectedField({ ...selectedField, type: newType });
                  }}
                  label='Field Type'
                  // sx={{ backgroundColor: 'background.default' }}
                >
                  <MenuItem value='text'>Text</MenuItem>
                  <MenuItem value='number'>Number</MenuItem>
                  <MenuItem value='boolean'>Boolean</MenuItem>
                  <MenuItem value='date'>Date</MenuItem>
                  <MenuItem value='email'>Email</MenuItem>
                  <MenuItem value='url'>URL</MenuItem>
                  <MenuItem value='array'>Array</MenuItem>
                  <MenuItem value='object'>Object</MenuItem>
                  <MenuItem value='schema'>Schema</MenuItem>
                </Select>
              </FormControl>

              <TextField
                fullWidth
                label='Description'
                value={selectedField.description || ''}
                onChange={(e) => {
                  const updatedField = {
                    ...selectedField,
                    description: e.target.value,
                  };
                  updateField(updatedField);
                  setSelectedField(updatedField);
                }}
                margin='normal'
                multiline
                rows={2}
                size='small'
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={selectedField.logic?.required || false}
                    onChange={(e) => {
                      const updatedField = {
                        ...selectedField,
                        logic: {
                          ...selectedField.logic,
                          required: e.target.checked,
                        },
                      };
                      updateField(updatedField);
                      setSelectedField(updatedField);
                    }}
                  />
                }
                label='Required'
                sx={{ mt: 2 }}
              />

              {/* Advanced Validation Rules */}
              <Accordion sx={{ mt: 2 }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant='subtitle2'>Validation Rules</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Box
                    sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
                  >
                    {/* String validation rules */}
                    {selectedField.type === 'text' && (
                      <>
                        <Box
                          sx={{
                            display: 'flex',
                            gap: 2,
                            flexDirection: { xs: 'column', sm: 'row' },
                          }}
                        >
                          <TextField
                            label='Min Length'
                            type='number'
                            value={selectedField.logic?.minLength || ''}
                            onChange={(e) => {
                              let value = e.target.value;
                              if (value && parseInt(value) < 0) {
                                value = '0'; // Prevent negative values
                              }

                              if (value && parseInt(value) > 500) {
                                value = '500'; // Limit max to 500
                              }

                              const updatedField = {
                                ...selectedField,
                                logic: {
                                  ...selectedField.logic,
                                  minLength: value
                                    ? parseInt(value)
                                    : undefined,
                                },
                              };
                              updateField(updatedField);
                              setSelectedField(updatedField);
                            }}
                            size='small'
                            sx={{ flex: 1 }}
                          />
                          <TextField
                            label='Max Length'
                            type='number'
                            value={selectedField.logic?.maxLength || ''}
                            onChange={(e) => {
                              let value = e.target.value;
                              if (value && parseInt(value) < 0) {
                                value = '0'; // Prevent negative values
                              }

                              if (value && parseInt(value) > 500) {
                                value = '500'; // Limit max to 500
                              }
                              const updatedField = {
                                ...selectedField,
                                logic: {
                                  ...selectedField.logic,
                                  maxLength: value
                                    ? parseInt(value)
                                    : undefined,
                                },
                              };
                              updateField(updatedField);
                              setSelectedField(updatedField);
                            }}
                            size='small'
                            sx={{ flex: 1 }}
                          />
                        </Box>
                        <TextField
                          label='Pattern (RegEx)'
                          value={selectedField.logic?.pattern || ''}
                          onChange={(e) => {
                            const updatedField = {
                              ...selectedField,
                              logic: {
                                ...selectedField.logic,
                                pattern: e.target.value || undefined,
                              },
                            };
                            updateField(updatedField);
                            setSelectedField(updatedField);
                          }}
                          size='small'
                          helperText='Regular expression pattern for validation'
                        />
                      </>
                    )}

                    {/* Number validation rules */}
                    {selectedField.type === 'number' && (
                      <Box
                        sx={{
                          display: 'flex',
                          gap: 2,
                          flexDirection: { xs: 'column', sm: 'row' },
                        }}
                      >
                        <TextField
                          label='Minimum Value'
                          type='number'
                          value={selectedField.logic?.min || ''}
                          onChange={(e) => {
                            let value = e.target.value;
                            if (value && parseInt(value) < 0) {
                              value = '0'; // Prevent negative values
                            }

                            const updatedField = {
                              ...selectedField,
                              logic: {
                                ...selectedField.logic,
                                min: value ? parseInt(value) : undefined,
                              },
                            };
                            updateField(updatedField);
                            setSelectedField(updatedField);
                          }}
                          size='small'
                          sx={{ flex: 1 }}
                        />
                        <TextField
                          label='Maximum Value'
                          type='number'
                          value={selectedField.logic?.max || ''}
                          onChange={(e) => {
                            let value = e.target.value;
                            if (value && parseInt(value) < 0) {
                              value = '0'; // Prevent negative values
                            }

                            const updatedField = {
                              ...selectedField,
                              logic: {
                                ...selectedField.logic,
                                max: value ? parseInt(value) : undefined,
                              },
                            };
                            updateField(updatedField);
                            setSelectedField(updatedField);
                          }}
                          size='small'
                          sx={{ flex: 1 }}
                        />
                      </Box>
                    )}

                    {/* Array validation rules */}
                    {selectedField.type === 'array' && (
                      <Box
                        sx={{
                          display: 'flex',
                          gap: 2,
                          flexDirection: { xs: 'column', sm: 'row' },
                        }}
                      >
                        <TextField
                          label='Min Items'
                          type='number'
                          value={selectedField.logic?.minItems || ''}
                          onChange={(e) => {
                            let value = e.target.value;
                            if (value && parseInt(value) < 0) {
                              value = '0'; // Prevent negative values
                            }

                            if (value && parseInt(value) > 10) {
                              value = '10'; // Limit max to 10
                            }

                            const updatedField = {
                              ...selectedField,
                              logic: {
                                ...selectedField.logic,
                                minItems: value ? parseInt(value) : undefined,
                              },
                            };
                            updateField(updatedField);
                            setSelectedField(updatedField);
                          }}
                          size='small'
                          sx={{ flex: 1 }}
                        />
                        <TextField
                          label='Max Items'
                          type='number'
                          value={selectedField.logic?.maxItems || ''}
                          onChange={(e) => {
                            let value = e.target.value;
                            if (value && parseInt(value) < 0) {
                              value = '0'; // Prevent negative values
                            }

                            if (value && parseInt(value) > 10) {
                              value = '10'; // Limit max to 10
                            }

                            const updatedField = {
                              ...selectedField,
                              logic: {
                                ...selectedField.logic,
                                maxItems: value ? parseInt(value) : undefined,
                              },
                            };
                            updateField(updatedField);
                            setSelectedField(updatedField);
                          }}
                          size='small'
                          sx={{ flex: 1 }}
                        />
                      </Box>
                    )}

                    {/* Enum values only for text, number, and email types */}
                    {(selectedField.type === 'text' ||
                      selectedField.type === 'number') && (
                      <>
                        <Divider sx={{ my: 1 }} />
                        <EnumField
                          initialValue={selectedField.logic?.enum?.join(', ')}
                          onChange={(value) => {
                            const updatedField = {
                              ...selectedField,
                              logic: {
                                ...selectedField.logic,
                                enum: value
                                  ? value
                                      .split(',')
                                      .map((v) => v.trim())
                                      .filter((v) => v)
                                  : undefined,
                              },
                            };
                            updateField(updatedField);
                            setSelectedField(updatedField);
                          }}
                        />
                      </>
                    )}
                  </Box>
                </AccordionDetails>
              </Accordion>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFieldPropertiesDialogOpen(false)}>
            Close
          </Button>
          {selectedField && (
            <Button
              color='error'
              onClick={() => {
                removeField(selectedField.id);
                setFieldPropertiesDialogOpen(false);
              }}
              startIcon={<DeleteIcon />}
            >
              Delete Field
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* JSON Preview Dialog */}
      <Dialog
        open={jsonPreviewDialogOpen}
        onClose={() => setJsonPreviewDialogOpen(false)}
        maxWidth='lg'
        fullWidth
        sx={{ '& .MuiDialog-paper': { maxHeight: '80vh' } }}
      >
        <DialogTitle>
          JSON Preview
          <Typography variant='body2' color='text.secondary'>
            Full schema structure preview
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Box
            component='pre'
            sx={{
              p: 2,
              borderRadius: 1,
              overflow: 'auto',
              fontSize: '0.875rem',
              lineHeight: 1.4,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              maxHeight: '60vh',
              fontFamily: 'monospace',
            }}
          >
            {JSON.stringify(generatePreview, null, 2)}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setJsonPreviewDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Schema Selection Dialog */}
      <Dialog
        open={schemaSelectionDialogOpen}
        onClose={() => setSchemaSelectionDialogOpen(false)}
        maxWidth='md'
        fullWidth
      >
        <DialogTitle>Select Schema</DialogTitle>
        <DialogContent>
          {schemasLoading ? (
            <Box display='flex' justifyContent='center' p={3}>
              <CircularProgress />
            </Box>
          ) : schemas.filter(
              (availableSchema) => availableSchema.id !== schemaId
            ).length === 0 ? (
            <Typography
              color='text.secondary'
              sx={{ p: 3, textAlign: 'center' }}
            >
              No other schemas available
            </Typography>
          ) : (
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  sm: 'repeat(2, 1fr)',
                  md: 'repeat(2, 1fr)',
                },
                gap: 2,
                mt: 1,
                maxHeight: '60vh',
                overflow: 'auto',
              }}
            >
              {schemas
                .filter((availableSchema) => availableSchema.id !== schemaId)
                .map((schemaItem) => (
                  <Card
                    key={schemaItem.id}
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
                      onClick={() => handleSchemaSelected(schemaItem)}
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
                            {schemaItem.name}
                          </Typography>
                        </Box>

                        {schemaItem.description && (
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
                            {schemaItem.description}
                          </Typography>
                        )}

                        <Box display='flex' flexWrap='wrap' gap={1} mb={2}>
                          <Chip
                            label={`${schemaItem.structure.fields.length} fields`}
                            size='small'
                            variant='outlined'
                          />
                        </Box>

                        <Typography variant='caption' color='text.secondary'>
                          Created {formatDate(schemaItem.createdAt)}
                        </Typography>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSchemaSelectionDialogOpen(false)}>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

function EnumField({
  onChange,
  initialValue,
}: {
  onChange: (value: string) => void;
  initialValue?: string;
}) {
  const [value, setValue] = useState(() => initialValue || '');
  return (
    <>
      <Typography variant='subtitle2' gutterBottom>
        Predefined Values (Optional)
      </Typography>
      <TextField
        label='Enum Values'
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          onChange(e.target.value);
        }}
        size='small'
        helperText='Comma-separated values to restrict field to specific options'
        multiline
        rows={2}
      />
    </>
  );
}
