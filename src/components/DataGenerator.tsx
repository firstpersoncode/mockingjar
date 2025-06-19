'use client';
import { useMemo, useState } from 'react';
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
  IconButton,
  Snackbar,
  ButtonGroup,
  useTheme,
  useMediaQuery,
  Card,
  CardContent,
  Divider,
} from '@mui/material';
import {
  Download as DownloadIcon,
  ContentCopy as CopyIcon,
  Refresh as GenerateIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useSchemas, useGenerateData } from '@/hooks/useSchemas';
import { GenerationProgress } from '@/types/generation';
import GenerationProgressComponent from './GenerationProgress';
import { convertSchemaToJson } from '../lib/schema';

const generateSchema = z.object({
  schemaId: z.string().min(1, 'Please select a schema'),
  prompt: z.string().min(1, 'Please enter a prompt'),
  count: z.number().min(1).max(100),
});

type GenerateForm = z.infer<typeof generateSchema>;

export default function DataGenerator() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [generatedData, setGeneratedData] = useState<Record<
    string,
    unknown
  > | null>(null);

  const [copySuccess, setCopySuccess] = useState(false);
  const [currentProgress, setCurrentProgress] =
    useState<GenerationProgress | null>(null);
  const [generationMetadata, setGenerationMetadata] = useState<{
    totalFields: number;
    validFields: number;
    regeneratedFields: string[];
    attempts: number;
    generationTime: number;
  } | null>(null);

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
  const selectedSchema = schemas.find((s) => s.id === selectedSchemaId);
  const generatePreview = useMemo(
    (): Record<string, unknown> =>
      selectedSchema?.structure?.fields
        ? convertSchemaToJson(selectedSchema.structure.fields, {
            forPreview: true,
          })
        : {},
    [selectedSchema?.structure?.fields]
  );

  const onSubmit = async (data: GenerateForm) => {
    if (!selectedSchema) return;

    try {
      setCurrentProgress(null);
      setGenerationMetadata(null);

      const result = await generateData.mutateAsync({
        schema: selectedSchema.structure,
        prompt: data.prompt,
        count: data.count,
        onProgress: setCurrentProgress,
      });

      if (result.success && result.data) {
        setGeneratedData(result.data);
        setGenerationMetadata(result.metadata || null);
        setCurrentProgress({
          stage: 'completed',
          message: 'Data generation completed successfully!',
          progress: 100,
        });
      } else {
        throw new Error(result.errors?.[0] || 'Generation failed');
      }
    } catch (error) {
      console.error('Generation failed:', error);
      setCurrentProgress({
        stage: 'failed',
        message: error instanceof Error ? error.message : 'Generation failed',
        progress: 0,
      });
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
    link.download = `generated-data-${
      new Date().toISOString().split('T')[0]
    }.json`;
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
        height: { lg: 'calc(100vh - 120px)' },
        my: 2,
      }}
    >
      {/* Generation Controls */}
      <Box sx={{ flex: { lg: '1 1 50%' } }}>
        <Paper
          sx={{
            p: { xs: 2, sm: 3 },
            height: { lg: '100%' },
            overflow: 'auto',
          }}
        >
          <Typography
            variant='h6'
            gutterBottom
            sx={{
              fontSize: { xs: '1rem', sm: '1.25rem' },
            }}
          >
            Generate Data
          </Typography>

          <form onSubmit={handleSubmit(onSubmit)}>
            <Controller
              name='schemaId'
              control={control}
              render={({ field }) => (
                <FormControl
                  fullWidth
                  margin='normal'
                  size={isMobile ? 'small' : 'medium'}
                >
                  <InputLabel>Select Schema</InputLabel>
                  <Select
                    {...field}
                    label='Select Schema'
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
                      variant='caption'
                      color='error'
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
              name='prompt'
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label='Generation Prompt'
                  placeholder='e.g., Generate realistic user data for a tech company'
                  multiline
                  rows={4}
                  margin='normal'
                  error={!!errors.prompt}
                  helperText={
                    errors.prompt?.message ||
                    'Describe the type of data you want to generate'
                  }
                />
              )}
            />

            <Controller
              name='count'
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  type='number'
                  fullWidth
                  label='Number of Records'
                  margin='normal'
                  inputProps={{ min: 1, max: 100 }}
                  error={!!errors.count}
                  helperText={errors.count?.message || 'Generate 1-100 records'}
                  onChange={(e) => field.onChange(parseInt(e.target.value, 10))}
                />
              )}
            />

            <Button
              type='submit'
              variant='contained'
              size='large'
              fullWidth
              startIcon={
                generateData.isPending ? (
                  <CircularProgress size={20} />
                ) : (
                  <GenerateIcon />
                )
              }
              disabled={generateData.isPending || !selectedSchema}
              sx={{ mt: 3 }}
            >
              {generateData.isPending ? 'Generating...' : 'Generate Data'}
            </Button>
          </form>

          {/* Progress Display */}
          {currentProgress && (
            <Box sx={{ mt: 3 }}>
              <GenerationProgressComponent
                progress={currentProgress}
                showDetails={true}
              />
            </Box>
          )}

          {/* Generation Results Summary */}
          {generationMetadata && (
            <Card sx={{ mt: 2 }}>
              <CardContent sx={{ py: 2 }}>
                <Typography variant='subtitle2' gutterBottom>
                  Generation Summary
                </Typography>
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                    gap: 1,
                  }}
                >
                  <Box>
                    <Typography variant='caption' color='text.secondary'>
                      Total Fields
                    </Typography>
                    <Typography variant='body2' fontWeight='medium'>
                      {generationMetadata.totalFields}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant='caption' color='text.secondary'>
                      Valid Fields
                    </Typography>
                    <Typography variant='body2' fontWeight='medium'>
                      {generationMetadata.validFields}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant='caption' color='text.secondary'>
                      Attempts
                    </Typography>
                    <Typography variant='body2' fontWeight='medium'>
                      {generationMetadata.attempts}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant='caption' color='text.secondary'>
                      Time
                    </Typography>
                    <Typography variant='body2' fontWeight='medium'>
                      {(generationMetadata.generationTime / 1000).toFixed(1)}s
                    </Typography>
                  </Box>
                </Box>
                {generationMetadata.regeneratedFields.length > 0 && (
                  <Box sx={{ mt: 1 }}>
                    <Typography variant='caption' color='text.secondary'>
                      Regenerated Fields:
                    </Typography>
                    <Typography variant='body2' sx={{ fontSize: '0.75rem' }}>
                      {generationMetadata.regeneratedFields.join(', ')}
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          )}

          {generateData.isError && (
            <Alert severity='error' sx={{ mt: 2 }}>
              {generateData.error instanceof Error
                ? generateData.error.message
                : 'Failed to generate data'}
            </Alert>
          )}
        </Paper>
      </Box>

      {/* Generated Data Preview */}
      <Box sx={{ flex: { lg: '1 1 50%' } }}>
        <Paper
          sx={{
            p: 3,
          }}
        >
          {selectedSchema && (
            <Box sx={{ mb: 2 }}>
              <Typography variant='subtitle2' gutterBottom>
                Preview:
              </Typography>
              <Box
                component='pre'
                sx={{
                  p: { xs: 1, sm: 2 },
                  borderRadius: 1,
                  maxHeight: '300px',
                  overflow: 'auto',
                  fontSize: { xs: '0.75rem', sm: '0.875rem' },
                  lineHeight: { xs: 1.3, sm: 1.4 },
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  color: '#fffade',
                  backgroundColor: '#000',
                }}
              >
                {JSON.stringify(generatePreview, null, 2)}
              </Box>
            </Box>
          )}

          <Box
            display='flex'
            justifyContent='space-between'
            alignItems='center'
            mb={2}
            flexWrap='wrap'
            gap={1}
          >
            <Typography
              variant='h6'
              sx={{
                fontSize: { xs: '1rem', sm: '1.25rem' },
              }}
            >
              Generated Data ({generatedData ? '0' : '1'} record)
            </Typography>

            {generatedData && (
              <ButtonGroup
                variant='outlined'
                size={isMobile ? 'small' : 'medium'}
                orientation={isMobile ? 'vertical' : 'horizontal'}
              >
                <Button
                  startIcon={<CopyIcon />}
                  onClick={() => copyToClipboard(generatedData)}
                >
                  Copy All
                </Button>
                <Button startIcon={<DownloadIcon />} onClick={downloadData}>
                  Download
                </Button>
              </ButtonGroup>
            )}
          </Box>

          {!generatedData ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <InfoIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
              <Typography variant='body2' color='text.secondary'>
                No data generated yet. Select a schema and provide a prompt to
                generate data.
              </Typography>
              {currentProgress?.stage === 'failed' && (
                <Alert severity='error' sx={{ mt: 2, textAlign: 'left' }}>
                  <Typography variant='body2'>
                    Generation failed. Please check your schema and prompt, then
                    try again.
                  </Typography>
                </Alert>
              )}
            </Box>
          ) : (
            <Box sx={{ width: '100%' }}>
              <Divider sx={{ mb: 2 }} />
              <Box
                display='flex'
                justifyContent='space-between'
                alignItems='flex-start'
              >
                <Box
                  component='pre'
                  sx={{
                    backgroundColor: 'grey.50',
                    p: 2,
                    borderRadius: 1,
                    fontSize: '0.75rem',
                    overflow: 'auto',
                    flexGrow: 1,
                    mr: 1,
                    maxHeight: '300px',
                  }}
                >
                  {JSON.stringify(generatedData, null, 2)}
                </Box>
                <IconButton
                  size='small'
                  onClick={() => copyToClipboard(generatedData)}
                  title='Copy this record'
                >
                  <CopyIcon fontSize='small' />
                </IconButton>
              </Box>
            </Box>
          )}
        </Paper>
      </Box>

      {/* Copy Success Snackbar */}
      <Snackbar
        open={copySuccess}
        autoHideDuration={3000}
        onClose={() => setCopySuccess(false)}
        message='Copied to clipboard!'
      />
    </Box>
  );
}
