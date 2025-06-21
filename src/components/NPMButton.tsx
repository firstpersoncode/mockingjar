'use client';

import React from 'react';
import { IconButton, Box, Tooltip } from '@mui/material';

export default function NPMButton({ 
  href = 'https://www.npmjs.com/package/mockingjar-lib',
  size = 40 
}: {
  href?: string;
  size?: number;
}) {
  return (
    <Tooltip title="View Core Engine on NPM Package">
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
          borderRadius: "50%",
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
          <Box component="img"
            src="/npm.jpg"
            alt="NPM Logo"
            sx={{
              width: "100%",
              height: "100%",
              objectFit: 'contain',
            }}
          />
        </Box>
      </IconButton>
    </Tooltip>
  );
}
