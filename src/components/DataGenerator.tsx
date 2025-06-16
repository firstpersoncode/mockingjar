'use client';
import { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  Snackbar,
  ButtonGroup,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Download as DownloadIcon,
  ContentCopy as CopyIcon,
  Refresh as GenerateIcon,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useSchemas, useGenerateData } from '@/hooks/useSchemas';

const generateSchema = z.object({
  schemaId: z.string().min(1, 'Please select a schema'),
  prompt: z.string().min(1, 'Please enter a prompt'),
  count: z.number().min(1).max(100),
});

type GenerateForm = z.infer<typeof generateSchema>;

export default function DataGenerator() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [generatedData, setGeneratedData] = useState<Record<string, unknown>[]>([]);
  const [copySuccess, setCopySuccess] = useState(false);

  const { data: schemas = [], isLoading: schemasLoading } = useSchemas();
  const generateData = useGenerateData();

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<GenerateForm>({
    resolver: zodResolver(generateSchema),
    defaultValues: {
      schemaId: '',
      prompt: '',
      count: 5,
    },
  });

  const selectedSchemaId = watch('schemaId');
  const selectedSchema = schemas.find(s => s.id === selectedSchemaId);

  const onSubmit = async (data: GenerateForm) => {
    if (!selectedSchema) return;

    try {
      const result = await generateData.mutateAsync({
        schema: selectedSchema.structure,
        prompt: data.prompt,
        count: data.count,
      });
      setGeneratedData(result.data || []);
    } catch (error) {
      console.error('Generation failed:', error);
    }
  };

  const copyToClipboard = async (data: unknown) => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(data, null, 2));
      setCopySuccess(true);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const downloadData = () => {
    const dataStr = JSON.stringify(generatedData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `generated-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <Box 
      sx={{ 
        display: 'flex',
        flexDirection: { xs: 'column', lg: 'row' },
        gap: { xs: 2, md: 3 },
        height: { lg: 'calc(100vh - 120px)' }
      }}
    >
      {/* Generation Controls */}
      <Box sx={{ flex: { lg: '1 1 50%' } }}>
        <Paper sx={{ 
          p: { xs: 2, sm: 3 },
          height: { lg: '100%' },
          overflow: 'auto',
        }}>
          <Typography 
            variant="h6" 
            gutterBottom
            sx={{
              fontSize: { xs: '1rem', sm: '1.25rem' },
            }}
          >
            Generate Data
          </Typography>

          <form onSubmit={handleSubmit(onSubmit)}>
            <Controller
              name="schemaId"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth margin="normal" size={isMobile ? "small" : "medium"}>
                  <InputLabel>Select Schema</InputLabel>
                  <Select
                    {...field}
                    label="Select Schema"
                    error={!!errors.schemaId}
                    disabled={schemasLoading}
                    sx={{
                      '& .MuiSelect-select': {
                        fontSize: { xs: '14px', sm: '16px' },
                      },
                    }}
                  >
                    {schemas.map((schema) => (
                      <MenuItem key={schema.id} value={schema.id}>
                        {schema.name}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.schemaId && (
                    <Typography 
                      variant="caption" 
                      color="error" 
                      sx={{ 
                        ml: 2, 
                        mt: 0.5,
                        fontSize: { xs: '0.65rem', sm: '0.75rem' },
                      }}
                    >
                      {errors.schemaId.message}
                    </Typography>
                  )}
                </FormControl>
              )}
            />

            <Controller
              name="prompt"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Generation Prompt"
                  placeholder="e.g., Generate realistic user data for a tech company"
                  multiline
                  rows={4}
                  margin="normal"
                  error={!!errors.prompt}
                  helperText={errors.prompt?.message || 'Describe the type of data you want to generate'}
                />
              )}
            />

            <Controller
              name="count"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  type="number"
                  fullWidth
                  label="Number of Records"
                  margin="normal"
                  inputProps={{ min: 1, max: 100 }}
                  error={!!errors.count}
                  helperText={errors.count?.message || 'Generate 1-100 records'}
                  onChange={(e) => field.onChange(parseInt(e.target.value, 10))}
                />
              )}
            />

            <Button
              type="submit"
              variant="contained"
              size="large"
              fullWidth
              startIcon={generateData.isPending ? <CircularProgress size={20} /> : <GenerateIcon />}
              disabled={generateData.isPending || !selectedSchema}
              sx={{ mt: 3 }}
            >
              {generateData.isPending ? 'Generating...' : 'Generate Data'}
            </Button>
          </form>

          {generateData.isError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              Failed to generate data. Please check your prompt and try again.
            </Alert>
          )}

          {selectedSchema && (
            <Box mt={3}>
              <Typography variant="subtitle2" gutterBottom>
                Selected Schema Structure:
              </Typography>
              <Box
                component="pre"
                sx={{
                  backgroundColor: 'grey.100',
                  p: 2,
                  borderRadius: 1,
                  fontSize: '0.75rem',
                  overflow: 'auto',
                  maxHeight: '200px',
                }}
              >
                {JSON.stringify(selectedSchema.structure, null, 2)}
              </Box>
            </Box>
          )}
        </Paper>
      </Box>

      {/* Generated Data Preview */}
      <Box sx={{ flex: { lg: '1 1 50%' } }}>
        <Paper sx={{ 
          p: 3, 
          height: { 
            xs: '500px',
            lg: '100%' 
          }, 
          overflow: 'auto' 
        }}>
          <Box 
            display="flex" 
            justifyContent="space-between" 
            alignItems="center" 
            mb={2}
            flexWrap="wrap"
            gap={1}
          >
            <Typography 
              variant="h6"
              sx={{
                fontSize: { xs: '1rem', sm: '1.25rem' },
              }}
            >
              Generated Data ({generatedData.length} records)
            </Typography>
            
            {generatedData.length > 0 && (
              <ButtonGroup 
                variant="outlined" 
                size={isMobile ? "small" : "medium"}
                orientation={isMobile ? "vertical" : "horizontal"}
              >
                <Button
                  startIcon={<CopyIcon />}
                  onClick={() => copyToClipboard(generatedData)}
                >
                  Copy All
                </Button>
                <Button
                  startIcon={<DownloadIcon />}
                  onClick={downloadData}
                >
                  Download
                </Button>
              </ButtonGroup>
            )}
          </Box>

          {generatedData.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No data generated yet. Select a schema and provide a prompt to generate data.
            </Typography>
          ) : (
            <Box>
              {generatedData.map((record, index) => (
                <Accordion key={index} sx={{ mb: 1 }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="subtitle2">
                      Record {index + 1}
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                      <Box
                        component="pre"
                        sx={{
                          backgroundColor: 'grey.50',
                          p: 2,
                          borderRadius: 1,
                          fontSize: '0.75rem',
                          overflow: 'auto',
                          flexGrow: 1,
                          mr: 1,
                        }}
                      >
                        {JSON.stringify(record, null, 2)}
                      </Box>
                      <IconButton
                        size="small"
                        onClick={() => copyToClipboard(record)}
                        title="Copy this record"
                      >
                        <CopyIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </AccordionDetails>
                </Accordion>
              ))}
            </Box>
          )}
        </Paper>
      </Box>

      {/* Copy Success Snackbar */}
      <Snackbar
        open={copySuccess}
        autoHideDuration={3000}
        onClose={() => setCopySuccess(false)}
        message="Copied to clipboard!"
      />
    </Box>
  );
}
