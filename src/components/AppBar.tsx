'use client';

import React, { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import {
  Box,
  AppBar as MuiAppBar,
  Toolbar,
  Typography,
  IconButton,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  AccountCircle,
  ArrowBack,
  Logout as LogoutIcon,
} from '@mui/icons-material';

export default function AppBar({
  title,
  onBack,
}: {
  title?: string;
  onBack?: () => void;
}) {
  const { data: session } = useSession();
  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(
    null
  );

  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setUserMenuAnchor(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchor(null);
  };

  const handleLogout = () => {
    signOut({ callbackUrl: '/auth/signin' });
  };

  return (
    <>
      {/* AppBar */}
      <MuiAppBar position='fixed'>
        <Toolbar>
          {onBack && (
            <IconButton
              edge='start'
              color='inherit'
              onClick={onBack}
              sx={{ mr: 2 }}
              title='Back'
            >
              <ArrowBack />
            </IconButton>
          )}
          <Typography variant='h6' noWrap component='div' sx={{ flexGrow: 1 }}>
            {title}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton
              onClick={handleUserMenuOpen}
              sx={{
                p: 0,
                color: 'inherit',
              }}
            >
              <AccountCircle sx={{ mr: 1 }} />
            </IconButton>
            <Typography
              variant='body2'
              sx={{
                display: { xs: 'none', sm: 'block' },
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: 150,
                mr: 2,
              }}
            >
              {session?.user?.email}
            </Typography>
            <IconButton
              onClick={handleLogout}
              sx={{
                color: 'inherit',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                },
              }}
              title='Logout'
            >
              <LogoutIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </MuiAppBar>

      {/* User Menu */}
      <Menu
        anchorEl={userMenuAnchor}
        open={Boolean(userMenuAnchor)}
        onClose={handleUserMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem onClick={handleLogout}>
          <LogoutIcon sx={{ mr: 1 }} />
          Logout
        </MenuItem>
      </Menu>

      <Box sx={{ height: '64px' }} />
    </>
  );
}
