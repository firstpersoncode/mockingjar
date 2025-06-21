'use client';

import React from 'react';
import { IconButton, Box, Tooltip } from '@mui/material';
import { GitHub } from '@mui/icons-material';

export default function GitHubButton({ 
  href = 'https://github.com/firstpersoncode/mockingjar',
  size = 40 
}: {
  href?: string;
  size?: number;
}) {
  return (
    <Tooltip title="View on GitHub">
      <IconButton
        component="a"
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        sx={{
          width: size,
          height: size,
          position: 'relative',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2,
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            position: 'relative',
            zIndex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <GitHub 
            sx={{ 
              fontSize: size * 0.6,
              color: 'text.primary',
            }} 
          />
        </Box>
      </IconButton>
    </Tooltip>
  );
}
