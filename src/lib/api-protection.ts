import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import csrf from 'csrf';

// Initialize CSRF tokens handler
const tokens = new csrf();
const secret = process.env.CSRF_SECRET || tokens.secretSync();

/**
 * Validates user session and returns user ID if authenticated
 */
export async function validateSession(): Promise<{
  isValid: boolean;
  userId?: string;
  response?: NextResponse;
}> {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return {
        isValid: false,
        response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
      };
    }

    return {
      isValid: true,
      userId: session.user.id,
    };
  } catch (error) {
    console.error('Session validation error:', error);
    return {
      isValid: false,
      response: NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      ),
    };
  }
}

/**
 * Validates CSRF token from request
 */
export function validateCSRFToken(
  request: NextRequest,
  token?: string
): {
  isValid: boolean;
  response?: NextResponse;
} {
  try {
    // Get token from header, body, or cookie
    const csrfToken =
      token ||
      request.headers.get('X-CSRF-TOKEN') ||
      request.headers.get('X-XSRF-TOKEN') ||
      request.cookies.get('XSRF-TOKEN')?.value;

    if (!csrfToken) {
      return {
        isValid: false,
        response: NextResponse.json(
          { error: 'CSRF token missing' },
          { status: 403 }
        ),
      };
    }

    if (!tokens.verify(secret, csrfToken)) {
      return {
        isValid: false,
        response: NextResponse.json(
          { error: 'Invalid CSRF token' },
          { status: 403 }
        ),
      };
    }

    return { isValid: true };
  } catch (error) {
    console.error('CSRF validation error:', error);
    return {
      isValid: false,
      response: NextResponse.json(
        { error: 'CSRF validation failed' },
        { status: 403 }
      ),
    };
  }
}

/**
 * Generates a new CSRF token
 */
export function generateCSRFToken(): string {
  return tokens.create(secret);
}

/**
 * Combined protection: validates both session and CSRF token for state-changing operations
 */
export async function validateSessionAndCSRF(
  request: NextRequest,
  csrfToken?: string
): Promise<{
  isValid: boolean;
  userId?: string;
  response?: NextResponse;
}> {
  // First validate session
  const sessionValidation = await validateSession();
  if (!sessionValidation.isValid) {
    return sessionValidation;
  }

  // Then validate CSRF for POST, PUT, DELETE operations
  const method = request.method;
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
    const csrfValidation = validateCSRFToken(request, csrfToken);
    if (!csrfValidation.isValid) {
      return csrfValidation;
    }
  }

  return {
    isValid: true,
    userId: sessionValidation.userId,
  };
}
