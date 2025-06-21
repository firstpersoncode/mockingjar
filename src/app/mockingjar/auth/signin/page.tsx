'use client';

import { useState } from 'react';
import { signIn, getSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Card,
  CardContent,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Container,
} from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';

export default function SignInPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await signIn('google', {
        redirect: false,
        callbackUrl: '/mockingjar/schema',
      });

      if (result?.error) {
        setError('Failed to sign in with Google. Please try again.');
      } else if (result?.url) {
        // Refresh session and redirect
        await getSession();
        router.push('/mockingjar/schema');
      }
    } catch (err: unknown) {
      setError('An error occurred during sign-in. Please try again.' + (err instanceof Error ? `: ${err.message}` : ''));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        sx={{
          py: { xs: 2, sm: 4 },
          px: { xs: 1, sm: 2 },
        }}
      >
        <Card sx={{ 
          width: '100%', 
          maxWidth: { xs: '100%', sm: 400 },
          mx: { xs: 1, sm: 0 },
        }}>
          <CardContent sx={{ 
            p: { xs: 2, sm: 4 },
          }}>
            <Box textAlign="center" mb={{ xs: 3, sm: 4 }}>
              <Typography 
                variant="h4" 
                component="h1" 
                gutterBottom 
                color="primary"
                sx={{
                  fontSize: { xs: '1.75rem', sm: '2.125rem' },
                }}
              >
                MockingJar
              </Typography>
              <Typography 
                variant="body1" 
                color="text.secondary"
                sx={{
                  fontSize: { xs: '0.875rem', sm: '1rem' },
                }}
              >
                Sign in to create and generate JSON schemas
              </Typography>
            </Box>

            {error && (
              <Alert 
                severity="error" 
                sx={{ 
                  mb: { xs: 2, sm: 3 },
                  fontSize: { xs: '0.875rem', sm: '1rem' },
                }}
              >
                {error}
              </Alert>
            )}

            <Button
              onClick={handleGoogleSignIn}
              fullWidth
              variant="outlined"
              size="large"
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : <GoogleIcon />}
              sx={{ 
                mt: { xs: 1, sm: 2 }, 
                mb: { xs: 2, sm: 3 },
                py: { xs: 1.5, sm: 1.75 },
                fontSize: { xs: '0.875rem', sm: '1rem' },
                borderColor: '#4285f4',
                color: '#4285f4',
                '&:hover': {
                  borderColor: '#3367d6',
                  backgroundColor: 'rgba(66, 133, 244, 0.04)',
                },
              }}
            >
              {loading ? 'Signing in...' : 'Continue with Google'}
            </Button>

            <Typography 
              variant="body2" 
              color="text.secondary" 
              textAlign="center" 
              mt={{ xs: 1, sm: 2 }}
              sx={{
                fontSize: { xs: '0.75rem', sm: '0.875rem' },
              }}
            >
              Secure authentication powered by Google OAuth
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
}
