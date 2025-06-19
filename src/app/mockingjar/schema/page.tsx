'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Box, Typography, Grid } from '@mui/material';
import SchemaList from '@/components/SchemaList';
import SideBar from '@/components/SideBar';
import AppBar from '@/components/AppBar';

export default function BuilderPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === 'loading') {
    return (
      <Box
        display='flex'
        justifyContent='center'
        alignItems='center'
        minHeight='100vh'
      >
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  if (!session) {
    router.replace('/mockingjar/auth/signin');
  }

  return (
    <Grid container>
      <Grid size={{ xs: 12, md: 2 }}>
        <SideBar />
      </Grid>
      <Grid size={{ xs: 12, md: 10 }} sx={{ p: 2 }}>
        <AppBar title='Schema Library' />
        <SchemaList />
      </Grid>
    </Grid>
  );
}
