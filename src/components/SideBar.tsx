'use client';

import React, { useMemo, useState } from 'react';
import {
  Box,
  Toolbar,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  useMediaQuery,
  useTheme,
  IconButton,
} from '@mui/material';
import {
  Schema as SchemaIcon,
  DataObject as DataIcon,
  History as HistoryIcon,
  Settings as SettingsIcon,
  Menu,
} from '@mui/icons-material';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const menuItems = [
  {
    text: 'Schema Builder',
    icon: <SchemaIcon sx={{ fontSize: '1rem' }} />,
    path: '/mockingjar/schema',
  },
  {
    text: 'Data Generator',
    icon: <DataIcon sx={{ fontSize: '1rem' }} />,
    path: '/mockingjar/generator',
  },
  {
    text: 'History',
    icon: <HistoryIcon sx={{ fontSize: '1rem' }} />,
    path: '/mockingjar/history',
    disabled: true,
  },
  {
    text: 'Settings',
    icon: <SettingsIcon sx={{ fontSize: '1rem' }} />,
    path: '/mockingjar/settings',
    disabled: true,
  },
];

export default function SideBar() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  // const [activeTab, setActiveTab] = useState('schema');

  const pathname = usePathname();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawer = useMemo(
    () => (
      <Box>
        <Toolbar>
          <Typography variant='h6' noWrap component='div'>
            MockingJar
          </Typography>
        </Toolbar>
        <List>
          {menuItems.map((item) => (
            <ListItem key={item.path} disablePadding>
              <ListItemButton
                disabled={item.disabled}
                LinkComponent={Link}
                href={item.path}
                selected={pathname === item.path}
                sx={{
                  minHeight: 48,
                  '&.Mui-selected': {
                    backgroundColor: theme.palette.primary.main + '20',
                    '&:hover': {
                      backgroundColor: theme.palette.primary.main + '30',
                    },
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    color:
                      pathname === item.path
                        ? theme.palette.primary.main
                        : 'inherit',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  slotProps={{
                    primary: {
                      sx: {
                        pr: 4,
                        fontSize: '0.75rem',
                        color:
                          pathname === item.path
                            ? theme.palette.primary.main
                            : 'inherit',
                      },
                    },
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>
    ),
    [pathname, theme]
  );

  return isMobile ? (
    <>
      <IconButton
        color='inherit'
        aria-label='open drawer'
        onClick={handleDrawerToggle}
        sx={{
          position: 'fixed',
          top: 10,
          left: 10,
          zIndex: 99999,
        }}
      >
        <Menu />
      </IconButton>
      <Drawer
        variant='temporary'
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{}}
      >
        {drawer}
      </Drawer>
    </>
  ) : (
    <Box
      sx={{
        position: 'sticky',
        top: 0,
        borderRight: '1px solid',
        borderColor: 'divider',
        height: '100vh',
        overflow: 'auto',
      }}
    >
      {drawer}
    </Box>
  );
}
