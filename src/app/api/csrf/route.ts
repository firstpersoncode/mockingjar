import { NextResponse } from 'next/server';
import { generateCSRFToken, validateSession } from '@/lib/api-protection';

export async function GET() {
  try {
    // Validate session before providing CSRF token
    const sessionValidation = await validateSession();
    if (!sessionValidation.isValid) {
      return sessionValidation.response;
    }

    const token = generateCSRFToken();

    // Set CSRF token as an HTTP-only cookie and return in response
    const response = NextResponse.json({ csrfToken: token });

    // Set the token in multiple places for flexibility
    response.cookies.set('XSRF-TOKEN', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Error generating CSRF token:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
