'use client';
import { useState, useEffect, useMemo, useCallback } from 'react';
import debounce from 'lodash.debounce';
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
  useTheme,
  useMediaQuery,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
  CircularProgress,
  Snackbar,
  Stack,
  Skeleton,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Visibility as PreviewIcon,
  ExpandMore as ExpandMoreIcon,
  AddCircle as AddChildIcon,
  Settings as SettingsIcon,
  KeyboardArrowRight as ArrowRightIcon,
  KeyboardArrowDown as ArrowDownIcon,
  CopyAll,
  CheckCircleOutline,
} from '@mui/icons-material';
import { v4 as uuidv4 } from 'uuid';
import { SchemaField, JsonSchema } from '@/types/schema';
import { findAndUpdateField, findAndRemoveField } from './utils/fieldUtils';
import { createSchemaTemplates } from './utils/templateUtils';
import { format } from 'date-fns';
interface SchemaBuilderProps {
  updatedAt?: Date;
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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [schema, setSchema] = useState<JsonSchema>(() => initialSchema);
  const [selectedField, setSelectedField] = useState<SchemaField | null>(null);
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [fieldPropertiesDialogOpen, setFieldPropertiesDialogOpen] =
    useState(false);
  const [jsonPreviewDialogOpen, setJsonPreviewDialogOpen] = useState(false);
  const [copyToClipboardMessage, setCopyToClipboardMessage] = useState('');

  // Local state for name editing
  const [editingName, setEditingName] = useState(false);
  const [tempName, setTempName] = useState(schema.name);

  // State for managing collapsed/expanded state of object fields
  const [collapsedFields, setCollapsedFields] = useState<Set<string>>(
    new Set()
  );

  // Memoize schema templates to prevent recreation on every render
  const schemaTemplates = useMemo(() => createSchemaTemplates(), []);

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

  // Handle name editing
  const handleStartNameEdit = () => {
    setEditingName(true);
    setTempName(schema.name);
  };

  const handleSaveName = () => {
    if (onUpdateName && tempName.trim() !== schema.name) {
      // Update local schema state immediately for UI responsiveness
      const updatedSchema = { ...schema, name: tempName.trim() };
      setSchema(updatedSchema);
      // Call the parent's update function with both name and current schema
      onUpdateName(tempName.trim(), updatedSchema);
    }
    setEditingName(false);
  };

  const handleCancelNameEdit = () => {
    setTempName(schema.name);
    setEditingName(false);
  };

  const selectField = useCallback((field: SchemaField) => {
    setSelectedField(field);
    setFieldPropertiesDialogOpen(true);
  }, []);

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

  // Memoize schema templates to prevent recreation on every render

  const applyTemplate = (
    templateKey: keyof ReturnType<typeof createSchemaTemplates>
  ) => {
    const template = schemaTemplates[templateKey];
    setSchema({
      name: template.name,
      description: `Generated from ${template.name} template`,
      fields: template.fields,
    });
    setTemplateDialogOpen(false);
  };

  const updateField = useCallback((updatedField: SchemaField) => {
    setSchema((prev) => ({
      ...prev,
      fields: findAndUpdateField(
        prev.fields,
        updatedField.id,
        () => updatedField
      ),
    }));
    setSelectedField(updatedField);
  }, []);

  const removeField = useCallback((fieldId: string) => {
    setSchema((prev) => ({
      ...prev,
      fields: findAndRemoveField(prev.fields, fieldId),
    }));
    setSelectedField(null);
  }, []);

  const handleSaveSchema = useCallback(() => {
    onSave(schema);
  }, [onSave, schema]);

  // Simple function to add a field directly to the schema (for tree view button)
  const addFieldToTree = useCallback(() => {
    const newField: SchemaField = {
      id: uuidv4(),
      name: 'newField',
      type: 'text',
      logic: { required: false },
    };

    setSchema((prev) => ({
      ...prev,
      fields: [...prev.fields, newField],
    }));
  }, []);

  const generatePreview = useMemo((): Record<string, unknown> => {
    const generateFieldPreview = (field: SchemaField): unknown => {
      switch (field.type) {
        case 'text':
        case 'email':
        case 'url':
          return field.logic?.enum
            ? `enum: [${field.logic.enum.join(', ')}]`
            : 'string';
        case 'number':
          return field.logic?.enum
            ? `enum: [${field.logic.enum.join(', ')}]`
            : 'number';
        case 'boolean':
          return 'boolean';
        case 'date':
          return 'date';
        case 'array':
          // Show collapsed indicator if field is collapsed and has arrayItemType
          if (collapsedFields.has(field.id) && field.arrayItemType) {
            return `[ ...1 item type ]`;
          }

          if (field.arrayItemType) {
            return [generateFieldPreview(field.arrayItemType)];
          }
          return ['any'];
        case 'object':
          const obj: Record<string, unknown> = {};

          // Show collapsed indicator instead of children if field is collapsed
          if (
            collapsedFields.has(field.id) &&
            field.children &&
            field.children.length > 0
          ) {
            return `{ ...${field.children.length} field${
              field.children.length !== 1 ? 's' : ''
            } }`;
          }

          if (field.children && field.children.length > 0) {
            // Track used keys to handle duplicates
            const usedKeys = new Set<string>();

            field.children.forEach((child) => {
              let keyName = child.name;

              // Handle duplicate keys by appending a number
              if (usedKeys.has(keyName)) {
                let counter = 2;
                while (usedKeys.has(`${keyName}_${counter}`)) {
                  counter++;
                }
                keyName = `${keyName}_${counter}`;
              }

              usedKeys.add(keyName);
              obj[keyName] = generateFieldPreview(child);
            });
          }
          return obj;
        default:
          return 'unknown';
      }
    };

    const preview: Record<string, unknown> = {};
    const usedTopLevelKeys = new Set<string>();

    schema.fields.forEach((field) => {
      let keyName = field.name;

      // Handle duplicate keys by appending a number
      if (usedTopLevelKeys.has(keyName)) {
        let counter = 2;
        while (usedTopLevelKeys.has(`${keyName}_${counter}`)) {
          counter++;
        }
        keyName = `${keyName}_${counter}`;
      }

      usedTopLevelKeys.add(keyName);
      preview[keyName] = generateFieldPreview(field);
    });

    return preview;
  }, [schema.fields, collapsedFields]);

  const copyToClipboard = useCallback(async (data: unknown) => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(data, null, 2));
      setCopyToClipboardMessage('Copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  }, []);

  const renderArrayItemTree = (
    arrayItem: SchemaField,
    parentPath: string[],
    level: number
  ): React.ReactNode => {
    if (arrayItem.type === 'object') {
      return (
        <Box key={`${arrayItem.id}-arrayitem`}>
          <Box
            display='flex'
            alignItems='center'
            gap={1}
            py={0.5}
            pl={level * 5}
            sx={{
              cursor: 'pointer',
              '&:hover': { backgroundColor: 'action.hover' },
              backgroundColor: 'grey.50',
            }}
          >
            <Box sx={{ width: 24 }} /> {/* Spacer for alignment */}
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
                  const updates: Partial<SchemaField> = { type: newType };

                  if (newType === 'object') {
                    updates.children = arrayItem.children || [];
                  } else {
                    updates.children = undefined;
                  }

                  if (newType === 'array') {
                    updates.arrayItemType = arrayItem.arrayItemType || {
                      id: uuidv4(),
                      name: 'item',
                      type: 'text',
                      children: undefined,
                      arrayItemType: undefined,
                      logic: { required: false },
                    };
                  } else {
                    updates.arrayItemType = undefined;
                  }

                  const updatedArrayItem = { ...arrayItem, ...updates };
                  updateField(updatedArrayItem);
                }}
                displayEmpty
                sx={{
                  fontSize: '0.75rem',
                  '& .MuiSelect-select': { py: 0.25, px: 1 },
                  '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                  backgroundColor: 'secondary.50',
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
              </Select>
            </FormControl>
            {/* Add Child button for array object items - inline with toolbar */}
            <Button
              variant='outlined'
              size='small'
              startIcon={<AddChildIcon />}
              onClick={(e) => {
                e.stopPropagation();
                const newChild: SchemaField = {
                  id: uuidv4(),
                  name: 'newField',
                  type: 'text',
                  logic: { required: false },
                };
                const updatedArrayItem = {
                  ...arrayItem,
                  children: [...(arrayItem.children || []), newChild],
                };
                updateField(updatedArrayItem);
              }}
              sx={{
                fontSize: '0.75rem',
                py: 0.25,
                px: 1,
                minWidth: 'auto',
                borderStyle: 'dashed',
                borderColor: 'grey.400',
                color: 'grey.600',
                '&:hover': {
                  borderColor: 'grey.600',
                  backgroundColor: 'grey.50',
                },
              }}
            >
              Add Field
            </Button>
            <Box sx={{ flexGrow: 1 }} />
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
          </Box>

          {arrayItem.children &&
            arrayItem.children.length > 0 &&
            renderTreeItems(
              arrayItem.children,
              [...parentPath, 'arrayItem'],
              level + 1
            )}
        </Box>
      );
    } else if (arrayItem.type === 'array' && arrayItem.arrayItemType) {
      return (
        <Box key={`${arrayItem.id}-nestedarray`}>
          <Box
            display='flex'
            alignItems='center'
            gap={1}
            py={0.5}
            pl={level * 5}
            sx={{
              backgroundColor: 'grey.100',
            }}
          >
            <Box sx={{ width: 24 }} /> {/* Spacer for alignment */}
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
                  const updatedArrayItem = {
                    ...arrayItem,
                    arrayItemType: {
                      id: arrayItem.arrayItemType?.id || uuidv4(),
                      name: arrayItem.arrayItemType?.name || 'item',
                      type: newItemType,
                      children:
                        newItemType === 'object'
                          ? arrayItem.arrayItemType?.children || []
                          : undefined,
                      arrayItemType:
                        newItemType === 'array'
                          ? ({
                              id: uuidv4(),
                              name: 'item',
                              type: 'text',
                              children: undefined,
                              arrayItemType: undefined,
                              logic: { required: false },
                            } as SchemaField)
                          : undefined,
                      logic: arrayItem.arrayItemType?.logic || {
                        required: false,
                      },
                    } as SchemaField,
                  };

                  // Update the schema by finding and updating this specific arrayItem
                  setSchema((prev) => ({
                    ...prev,
                    fields: findAndUpdateField(
                      prev.fields,
                      arrayItem.id,
                      () => updatedArrayItem
                    ),
                  }));
                }}
                displayEmpty
                sx={{
                  fontSize: '0.75rem',
                  '& .MuiSelect-select': { py: 0.25, px: 1 },
                  '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                  backgroundColor: 'info.50',
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
                <MenuItem value='object'>Object</MenuItem>
                <MenuItem value='array'>Array</MenuItem>
              </Select>
            </FormControl>
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
            py={0.5}
            pl={level * 5}
            sx={{
              cursor: 'pointer',
              '&:hover': { backgroundColor: 'action.hover' },
            }}
          >
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
                {isCollapsed ? (
                  <ArrowRightIcon fontSize='small' />
                ) : (
                  <ArrowDownIcon fontSize='small' />
                )}
              </IconButton>
            ) : (
              <Box sx={{ width: 24 }} /> // Spacer to align fields without children
            )}

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
                  const updates: Partial<SchemaField> = { type: newType };

                  if (newType === 'object') {
                    updates.children = field.children || [];
                  } else {
                    updates.children = undefined;
                  }

                  if (newType === 'array') {
                    updates.arrayItemType = field.arrayItemType || {
                      id: uuidv4(),
                      name: 'item',
                      type: 'text',
                      children: undefined,
                      arrayItemType: undefined,
                      logic: { required: false },
                    };
                  } else {
                    updates.arrayItemType = undefined;
                  }

                  const updatedField = { ...field, ...updates };
                  updateField(updatedField);
                }}
                displayEmpty
                sx={{
                  fontSize: '0.75rem',
                  '& .MuiSelect-select': { py: 0.25, px: 1 },
                  '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                  backgroundColor:
                    parentPath.length > 0 ? 'grey.100' : 'primary.50',
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
                  const newChild: SchemaField = {
                    id: uuidv4(),
                    name: 'newField',
                    type: 'text',
                    logic: { required: false },
                  };
                  const updatedField = {
                    ...field,
                    children: [...(field.children || []), newChild],
                  };
                  updateField(updatedField);
                }}
                sx={{
                  fontSize: '0.7rem',
                  py: 0.25,
                  px: 1,
                  minWidth: 'auto',
                  borderStyle: 'dashed',
                  color: 'text.secondary',
                  borderColor: 'divider',
                  '&:hover': {
                    borderColor: 'primary.main',
                    backgroundColor: 'action.hover',
                  },
                }}
              >
                Add Field
              </Button>
            )}

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

            <Box sx={{ flexGrow: 1 }} />

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
          </Box>

          {/* Render array item as tree node - only when array field is not collapsed */}
          {field.type === 'array' && field.arrayItemType && !isCollapsed && (
            <Box key={`${field.id}-arrayitem`}>
              <Box
                display='flex'
                alignItems='center'
                gap={1}
                py={0.5}
                pl={(level + 1) * 5}
                sx={{
                  cursor: 'pointer',
                  '&:hover': { backgroundColor: 'action.hover' },
                  backgroundColor: 'grey.50',
                }}
              >
                {/* Collapsible arrow for array items with children */}
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
                    {collapsedFields.has(field.arrayItemType!.id) ? (
                      <ArrowRightIcon fontSize='small' />
                    ) : (
                      <ArrowDownIcon fontSize='small' />
                    )}
                  </IconButton>
                ) : (
                  <Box sx={{ width: 24 }} /> // Spacer to align array items without children
                )}
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
                      const updatedArrayItem = {
                        id: field.arrayItemType?.id || uuidv4(),
                        name: field.arrayItemType?.name || 'item',
                        type: newItemType,
                        children:
                          newItemType === 'object'
                            ? field.arrayItemType?.children || []
                            : undefined,
                        arrayItemType:
                          newItemType === 'array'
                            ? ({
                                id: uuidv4(),
                                name: 'item',
                                type: 'text',
                                children: undefined,
                                arrayItemType: undefined,
                                logic: { required: false },
                              } as SchemaField)
                            : undefined,
                        logic: field.arrayItemType?.logic || {
                          required: false,
                        },
                      } as SchemaField;

                      const updatedField = {
                        ...field,
                        arrayItemType: updatedArrayItem,
                      };
                      updateField(updatedField);
                    }}
                    displayEmpty
                    sx={{
                      fontSize: '0.75rem',
                      '& .MuiSelect-select': { py: 0.25, px: 1 },
                      '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                      backgroundColor: 'secondary.50',
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
                      const newChild: SchemaField = {
                        id: uuidv4(),
                        name: 'newField',
                        type: 'text',
                        logic: { required: false },
                      };
                      const updatedArrayItem = {
                        ...field.arrayItemType!,
                        children: [
                          ...(field.arrayItemType!.children || []),
                          newChild,
                        ],
                      };
                      const updatedField = {
                        ...field,
                        arrayItemType: updatedArrayItem,
                      };
                      updateField(updatedField);
                    }}
                    sx={{
                      fontSize: '0.75rem',
                      py: 0.25,
                      px: 1,
                      minWidth: 'auto',
                      borderStyle: 'dashed',
                      borderColor: 'grey.400',
                      color: 'grey.600',
                      '&:hover': {
                        borderColor: 'grey.600',
                        backgroundColor: 'grey.50',
                      },
                    }}
                  >
                    Add Field
                  </Button>
                )}

                {/* Children count display when collapsed for array items */}
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

                <Box sx={{ flexGrow: 1 }} />
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
        gap: { xs: 2, md: 3 },
        height: { lg: 'calc(100vh - 120px)' },
      }}
    >
      {/* Schema Tree */}
      <Box sx={{ flex: { lg: '1 1 50%' } }}>
        <Paper
          sx={{
            p: { xs: 1, sm: 2 },
            height: {
              xs: '400px',
              sm: '500px',
              lg: '100%',
            },
            overflow: 'auto',
          }}
        >
          <Box
            display='flex'
            justifyContent='space-between'
            alignItems='center'
            mb={{ xs: 1, sm: 2 }}
            flexWrap='wrap'
            gap={1}
          >
            <Typography
              variant='h6'
              sx={{
                fontSize: { xs: '1rem', sm: '1.25rem' },
              }}
            >
              Schema Structure
            </Typography>
            <Box display='flex' gap={1}>
              <Button
                variant='outlined'
                size='small'
                onClick={() => setTemplateDialogOpen(true)}
                sx={{ fontSize: { xs: '0.7rem', sm: '0.8rem' } }}
              >
                Templates
              </Button>
            </Box>
          </Box>

          {/* Schema Name Editor */}
          <Box sx={{ mb: 2 }}>
            {editingName ? (
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <TextField
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  placeholder='Enter schema name'
                  size='small'
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSaveName();
                    } else if (e.key === 'Escape') {
                      handleCancelNameEdit();
                    }
                  }}
                  sx={{ flexGrow: 1 }}
                />
                <Button
                  variant='contained'
                  size='small'
                  onClick={handleSaveName}
                  disabled={isUpdatingName || !tempName.trim()}
                  sx={{ minWidth: 'auto', px: 2 }}
                >
                  {isUpdatingName ? <CircularProgress size={16} /> : 'Save'}
                </Button>
                <Button
                  variant='outlined'
                  size='small'
                  onClick={handleCancelNameEdit}
                  disabled={isUpdatingName}
                  sx={{ minWidth: 'auto', px: 2 }}
                >
                  Cancel
                </Button>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <Typography
                  variant='body1'
                  sx={{
                    flexGrow: 1,
                    fontWeight: 500,
                    py: 0.75,
                    px: 1.5,
                    backgroundColor: 'grey.50',
                    borderRadius: 1,
                    border: '1px solid transparent',
                    cursor: 'pointer',
                    minHeight: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    '&:hover': {
                      backgroundColor: 'grey.100',
                      borderColor: 'grey.300',
                    },
                  }}
                  onClick={handleStartNameEdit}
                >
                  {schema.name || 'Untitled Schema'}
                </Typography>
              </Box>
            )}
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
      <Box sx={{ flex: { lg: '1 1 50%' } }}>
        <Paper
          sx={{
            p: { xs: 1, sm: 2 },
            height: {
              xs: '400px',
              sm: '500px',
              lg: '100%',
            },
            overflow: 'auto',
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
            <Stack direction='row' alignItems='center' gap={1}>
              <Typography
                variant='h6'
                sx={{
                  fontSize: { xs: '1rem', sm: '1.25rem' },
                }}
              >
                JSON Preview
              </Typography>
              <Box>
                {isSaving ? (
                  <Skeleton width={200} />
                ) : updatedAt ? (
                  <Stack direction='row' alignItems='center' gap={0.5}>
                    <Typography
                      variant='body2'
                      color='text.secondary'
                      sx={{
                        fontSize: { xs: '0.75rem', sm: '0.875rem' },
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
            <Box display='flex' gap={{ xs: 0.5, sm: 1 }} alignItems='center'>
              <IconButton
                onClick={() => copyToClipboard(generatePreview)}
                size={isMobile ? 'small' : 'medium'}
                title='Copy to clipboard'
              >
                <CopyAll />
              </IconButton>
              <IconButton
                onClick={() => setJsonPreviewDialogOpen(true)}
                size={isMobile ? 'small' : 'medium'}
                title='Open in dialog'
              >
                <PreviewIcon />
              </IconButton>
              <Button
                variant='contained'
                onClick={!isSaving ? handleSaveSchema : undefined}
                // disabled={isSaving}
                size={isMobile ? 'small' : 'medium'}
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
              backgroundColor: 'black',
              p: { xs: 1, sm: 2 },
              borderRadius: 1,
              overflow: 'auto',
              fontSize: { xs: '0.75rem', sm: '0.875rem' },
              lineHeight: { xs: 1.3, sm: 1.4 },
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              maxHeight: 'calc(100% - 80px)',
              color: "#fffade"
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
              <Paper
                key={key}
                sx={{
                  p: 2,
                  cursor: 'pointer',
                  border: '1px solid',
                  borderColor: 'divider',
                  '&:hover': {
                    borderColor: 'primary.main',
                    backgroundColor: 'action.hover',
                  },
                }}
                onClick={() =>
                  applyTemplate(key as keyof typeof schemaTemplates)
                }
              >
                <Typography variant='h6' gutterBottom>
                  {template.name}
                </Typography>
                <Typography variant='body2' color='text.secondary' gutterBottom>
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
              </Paper>
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTemplateDialogOpen(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>

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
                    const updates: Partial<SchemaField> = { type: newType };

                    if (newType === 'object') {
                      updates.children = selectedField.children || [];
                    } else {
                      updates.children = undefined;
                    }

                    if (newType === 'array') {
                      updates.arrayItemType = selectedField.arrayItemType || {
                        id: uuidv4(),
                        name: 'item',
                        type: 'text',
                        children: undefined,
                        arrayItemType: undefined,
                        logic: { required: false },
                      };
                    } else {
                      updates.arrayItemType = undefined;
                    }

                    const updatedField = { ...selectedField, ...updates };
                    updateField(updatedField);
                    setSelectedField(updatedField);
                  }}
                  label='Field Type'
                >
                  <MenuItem value='text'>Text</MenuItem>
                  <MenuItem value='number'>Number</MenuItem>
                  <MenuItem value='boolean'>Boolean</MenuItem>
                  <MenuItem value='date'>Date</MenuItem>
                  <MenuItem value='email'>Email</MenuItem>
                  <MenuItem value='url'>URL</MenuItem>
                  <MenuItem value='array'>Array</MenuItem>
                  <MenuItem value='object'>Object</MenuItem>
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
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  sx={{ backgroundColor: 'grey.50' }}
                >
                  <Typography variant='subtitle2'>Validation Rules</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Box
                    sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
                  >
                    {/* String validation rules */}
                    {(selectedField.type === 'text' ||
                      selectedField.type === 'email' ||
                      selectedField.type === 'url') && (
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
                              const updatedField = {
                                ...selectedField,
                                logic: {
                                  ...selectedField.logic,
                                  minLength: e.target.value
                                    ? parseInt(e.target.value)
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
                              const updatedField = {
                                ...selectedField,
                                logic: {
                                  ...selectedField.logic,
                                  maxLength: e.target.value
                                    ? parseInt(e.target.value)
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
                            const updatedField = {
                              ...selectedField,
                              logic: {
                                ...selectedField.logic,
                                min: e.target.value
                                  ? parseInt(e.target.value)
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
                          label='Maximum Value'
                          type='number'
                          value={selectedField.logic?.max || ''}
                          onChange={(e) => {
                            const updatedField = {
                              ...selectedField,
                              logic: {
                                ...selectedField.logic,
                                max: e.target.value
                                  ? parseInt(e.target.value)
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
                            const updatedField = {
                              ...selectedField,
                              logic: {
                                ...selectedField.logic,
                                minItems: e.target.value
                                  ? parseInt(e.target.value)
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
                          label='Max Items'
                          type='number'
                          value={selectedField.logic?.maxItems || ''}
                          onChange={(e) => {
                            const updatedField = {
                              ...selectedField,
                              logic: {
                                ...selectedField.logic,
                                maxItems: e.target.value
                                  ? parseInt(e.target.value)
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
                    )}

                    {/* Enum values only for text, number, and email types */}
                    {(selectedField.type === 'text' ||
                      selectedField.type === 'number' ||
                      selectedField.type === 'email') && (
                      <>
                        <Divider sx={{ my: 1 }} />
                        <EnumField
                          initialValue={
                            selectedField.logic?.enum?.join(', ')
                          }
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
              backgroundColor: 'grey.100',
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
          <Button
            onClick={() => copyToClipboard(generatePreview)}
            startIcon={<CopyAll />}
          >
            Copy to Clipboard
          </Button>
          <Button onClick={() => setJsonPreviewDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={!!copyToClipboardMessage}
        autoHideDuration={3000}
        onClose={() => setCopyToClipboardMessage('')}
        message={copyToClipboardMessage}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      />
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
