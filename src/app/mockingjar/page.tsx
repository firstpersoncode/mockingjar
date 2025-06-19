'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

export default function Page() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;

    if (session) {
      router.replace('/mockingjar/schema');
    } else {
      router.replace('/mockingjar/auth/signin');
    }
  }, [session, status, router]);

  return (
    <Box
      display='flex'
      justifyContent='center'
      alignItems='center'
      minHeight='100vh'
      flexDirection='column'
      gap={2}
    >
      <CircularProgress />
      <Typography variant='body1' color='text.secondary'>
        Loading...
      </Typography>
    </Box>
  );
}
