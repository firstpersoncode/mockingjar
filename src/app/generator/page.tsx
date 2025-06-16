'use client';

import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { Box, Typography, Grid } from '@mui/material';
import SideBar from '@/components/SideBar';
import DataGenerator from '@/components/DataGenerator';
import AppBar from '@/components/AppBar';

export default function GeneratorPage() {
  const { data: session, status } = useSession();

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
    redirect('/auth/signin');
  }

  return (
    <Grid container>
      <Grid size={{ xs: 12, md: 2 }}>
        <SideBar />
      </Grid>
      <Grid size={{ xs: 12, md: 10 }} sx={{ p: 2 }}>
        <AppBar title='Data Generator' />
        <DataGenerator />
      </Grid>
    </Grid>
  );
}
