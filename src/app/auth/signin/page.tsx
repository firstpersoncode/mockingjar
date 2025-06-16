'use client';
import { useState } from 'react';
import { signIn, getSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Container,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const signInSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type SignInForm = z.infer<typeof signInSchema>;

export default function SignInPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInForm>({
    resolver: zodResolver(signInSchema),
  });

  const onSubmit = async (data: SignInForm) => {
    setLoading(true);
    setError(null);

    try {
      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        setError('Invalid credentials');
      } else {
        // Refresh session and redirect
        await getSession();
        router.push('/builder');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
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
                JSON Builder
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

            <Box component="form" onSubmit={handleSubmit(onSubmit)}>
              <TextField
                {...register('email')}
                label="Email"
                type="email"
                fullWidth
                margin="normal"
                error={!!errors.email}
                helperText={errors.email?.message}
                disabled={loading}
                sx={{
                  '& .MuiInputBase-input': {
                    fontSize: { xs: '16px', sm: '1rem' }, // Prevents zoom on iOS
                  },
                }}
              />

              <TextField
                {...register('password')}
                label="Password"
                type="password"
                fullWidth
                margin="normal"
                error={!!errors.password}
                helperText={errors.password?.message}
                disabled={loading}
                sx={{
                  '& .MuiInputBase-input': {
                    fontSize: { xs: '16px', sm: '1rem' }, // Prevents zoom on iOS
                  },
                }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading}
                sx={{ 
                  mt: { xs: 2, sm: 3 }, 
                  mb: { xs: 1, sm: 2 },
                  py: { xs: 1.5, sm: 1.75 },
                  fontSize: { xs: '0.875rem', sm: '1rem' },
                }}
              >
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  'Sign In'
                )}
              </Button>
            </Box>

            <Typography 
              variant="body2" 
              color="text.secondary" 
              textAlign="center" 
              mt={{ xs: 1, sm: 2 }}
              sx={{
                fontSize: { xs: '0.75rem', sm: '0.875rem' },
              }}
            >
              For this MVP, any email/password combination will work.
              Your account will be created automatically.
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
}
