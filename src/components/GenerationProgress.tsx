import React from 'react';
import {
  Box,
  LinearProgress,
  Typography,
  Skeleton,
  Alert,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Collapse
} from '@mui/material';
import {
  CheckCircle,
  Error,
  Warning,
  AutoFixHigh,
  PlayArrow,
  ExpandMore,
  ExpandLess
} from '@mui/icons-material';
import { GenerationProgress } from '@/types/generation';

interface GenerationProgressProps {
  progress: GenerationProgress;
  showDetails?: boolean;
  onToggleDetails?: () => void;
}

const stageIcons = {
  preparing: <PlayArrow color="info" />,
  generating: <PlayArrow color="primary" />,
  validating: <CheckCircle color="success" />,
  fixing: <AutoFixHigh color="warning" />,
  completed: <CheckCircle color="success" />,
  failed: <Error color="error" />
};

const stageColors = {
  preparing: 'info',
  generating: 'primary',
  validating: 'success',
  fixing: 'warning',
  completed: 'success',
  failed: 'error'
} as const;

export default function GenerationProgressComponent({
  progress,
  showDetails = false,
  onToggleDetails
}: GenerationProgressProps) {
  const [detailsOpen, setDetailsOpen] = React.useState(false);

  const handleToggleDetails = () => {
    setDetailsOpen(!detailsOpen);
    onToggleDetails?.();
  };

  const getProgressColor = (): 'primary' | 'success' | 'warning' | 'error' => {
    switch (progress.stage) {
      case 'completed':
        return 'success';
      case 'failed':
        return 'error';
      case 'fixing':
        return 'warning';
      default:
        return 'primary';
    }
  };

  return (
    <Box sx={{ width: '100%', mb: 2 }}>
      {/* Main Progress Bar */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        {stageIcons[progress.stage]}
        <Box sx={{ ml: 1, mr: 1, flex: 1 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {progress.message}
          </Typography>
          <LinearProgress
            variant="determinate"
            value={progress.progress}
            color={getProgressColor()}
            sx={{ height: 8, borderRadius: 4 }}
          />
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
          {progress.progress}%
        </Typography>
      </Box>

      {/* Current Field */}
      {progress.currentField && (
        <Box sx={{ mb: 1 }}>
          <Chip
            icon={<AutoFixHigh />}
            label={`Working on: ${progress.currentField}`}
            color={stageColors[progress.stage]}
            size="small"
            variant="outlined"
          />
        </Box>
      )}

      {/* Attempts Counter */}
      {progress.attempts && progress.maxAttempts && (
        <Box sx={{ mb: 1 }}>
          <Typography variant="caption" color="text.secondary">
            Attempt {progress.attempts} of {progress.maxAttempts}
          </Typography>
        </Box>
      )}

      {/* Failed Fields */}
      {progress.failedFields && progress.failedFields.length > 0 && (
        <Box sx={{ mb: 1 }}>
          <Alert
            severity="warning"
            sx={{ mb: 1 }}
            action={
              showDetails && (
                <Box
                  onClick={handleToggleDetails}
                  sx={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                >
                  <Typography variant="caption" sx={{ mr: 0.5 }}>
                    Details
                  </Typography>
                  {detailsOpen ? <ExpandLess /> : <ExpandMore />}
                </Box>
              )
            }
          >
            <Typography variant="body2">
              {progress.failedFields.length} field(s) need regeneration
            </Typography>
          </Alert>

          {showDetails && (
            <Collapse in={detailsOpen}>
              <List dense>
                {progress.failedFields.map((field, index) => (
                  <ListItem key={index} sx={{ py: 0.5 }}>
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      <Warning color="warning" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText
                      primary={field}
                      primaryTypographyProps={{ variant: 'body2' }}
                    />
                  </ListItem>
                ))}
              </List>
            </Collapse>
          )}
        </Box>
      )}

      {/* Stage-specific content */}
      {progress.stage === 'generating' && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Generating data structure...
          </Typography>
          <Skeleton variant="rectangular" height={60} sx={{ mb: 1 }} />
          <Skeleton variant="text" width="80%" />
          <Skeleton variant="text" width="60%" />
        </Box>
      )}

      {progress.stage === 'validating' && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Validating generated data...
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Skeleton variant="rectangular" width={80} height={32} />
            <Skeleton variant="rectangular" width={100} height={32} />
            <Skeleton variant="rectangular" width={90} height={32} />
          </Box>
        </Box>
      )}

      {progress.stage === 'fixing' && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Regenerating problematic fields...
          </Typography>
          {progress.failedFields?.map((field, index) => (
            <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
              <Skeleton variant="circular" width={20} height={20} sx={{ mr: 1 }} />
              <Skeleton variant="text" width={`${Math.random() * 40 + 40}%`} />
            </Box>
          ))}
        </Box>
      )}

      {progress.stage === 'completed' && (
        <Alert severity="success" sx={{ mt: 2 }}>
          <Typography variant="body2">
            Data generation completed successfully!
          </Typography>
        </Alert>
      )}

      {progress.stage === 'failed' && (
        <Alert severity="error" sx={{ mt: 2 }}>
          <Typography variant="body2">
            Generation failed. Please try again or adjust your schema.
          </Typography>
        </Alert>
      )}
    </Box>
  );
}
