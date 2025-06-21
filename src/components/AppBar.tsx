'use client';

import React, { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import {
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  Tooltip,
} from '@mui/material';
import {
  AccountCircle,
  ArrowBack,
  Logout as LogoutIcon,
} from '@mui/icons-material';
import GitHubButton from './GitHubButton';
import NPMButton from './NPMButton';

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
    signOut({ callbackUrl: '/mockingjar/auth/signin' });
  };

  return (
    <>
      {/* AppBar */}
      <Stack
        direction='row'
        alignItems='center'
        sx={{
          width: '100%',
          borderBottom: '1px solid',
          borderColor: 'divider',
          py: 2,
          gap: 2,
          pt: { xs: 5, md: 2 },
        }}
      >
        {onBack && (
          <IconButton
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

        <Stack
          sx={{ position: { xs: 'fixed', md: 'static' }, right: 10, top: 10 }}
          direction='row'
          alignItems='center'
          spacing={1}
        >
          {!!session?.user && (
            <Tooltip title={session.user.name || 'User Menu'}>
              <IconButton
                onClick={handleUserMenuOpen}
                sx={{
                  color: 'inherit',
                  border: '.5px solid',
                  borderColor: 'divider',
                  ml: 1,
                }}
              >
                <AccountCircle />
              </IconButton>
            </Tooltip>
          )}

          <GitHubButton
            size={36}
            href='https://github.com/firstpersoncode/mockingjar'
          />

          <NPMButton
            size={36}
            href='https://www.npmjs.com/package/mockingjar-lib'
          />
        </Stack>
      </Stack>

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
    </>
  );
}
