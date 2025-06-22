# Security Implementation Guide

This document explains the security measures implemented in the Mockbird application to protect API routes with user session authentication and CSRF protection.

## Overview

The application now implements a comprehensive security layer that includes:

1. **Session-based Authentication**: All API routes (except signin) require valid user sessions
2. **CSRF Protection**: All state-changing operations (POST, PUT, DELETE, PATCH) require valid CSRF tokens
3. **Middleware Protection**: Edge-level protection for routes and pages
4. **Type-safe Utilities**: Reusable functions for consistent security implementation

## Architecture

### Core Security Components

#### 1. API Protection Utilities (`src/lib/api-protection.ts`)

This module provides:
- `validateSession()`: Validates user session and returns user ID
- `validateCSRFToken()`: Validates CSRF tokens from requests
- `validateSessionAndCSRF()`: Combined validation for complete protection

#### 2. CSRF Token Management (`src/app/api/csrf/route.ts`)

- **Endpoint**: `GET /api/csrf`
- **Purpose**: Generates and returns CSRF tokens for authenticated users
- **Security**: Only authenticated users can obtain CSRF tokens
- **Implementation**: Sets tokens in both response body and HTTP-only cookies

#### 3. Frontend Integration (`src/lib/protected-fetch.ts`)

Provides:
- `protectedFetch()`: Utility function for making CSRF-protected API requests

#### 4. Middleware Protection (`middleware.ts`)

- **Scope**: Edge-level protection for all routes
- **Features**: 
  - Redirects unauthenticated users from protected pages
  - Validates authentication for API routes
  - Allows CSRF endpoint to handle its own auth

## Implementation Details

### Backend Protection

All API routes now use the protection utilities:

```typescript
// Example: Protected route handler
import { validateSessionAndCSRF } from '@/lib/api-protection';

export async function POST(request: NextRequest) {
  const validation = await validateSessionAndCSRF(request);
  if (!validation.isValid) {
    return validation.response;
  }
  
  // Route logic with validated user ID
  const userId = validation.userId!;
  // ... rest of the handler
}
```

### Frontend Integration

The frontend uses the CSRF-protected fetch utility:

```typescript
// Example: Making a protected API request
import { protectedFetch } from '@/lib/protected-fetch';

const response = await protectedFetch('/api/schemas', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data),
});
```

### CSRF Token Flow

1. **Token Generation**: Client requests token from `/api/csrf`
2. **Token Storage**: Token stored in HTTP-only cookie and returned in response
3. **Token Usage**: Client includes token in `X-CSRF-TOKEN` header for state-changing requests
4. **Token Validation**: Server validates token against secret and cookie

## Security Features

### Session Protection

- **Database Sessions**: Uses NextAuth with database session strategy
- **Session Validation**: Every protected route validates session existence
- **User Isolation**: Data access restricted to authenticated user's own resources

### CSRF Protection

- **Token-based**: Uses cryptographically secure tokens
- **Double Submit Pattern**: Token in both cookie and header
- **State-changing Only**: CSRF protection applied to POST, PUT, DELETE, PATCH
- **Automatic Rotation**: Tokens can be refreshed as needed

### Additional Security Measures

- **HTTPS Enforcement**: Secure cookies in production
- **SameSite Cookies**: Prevents cross-site request forgery
- **HTTP-only Cookies**: Prevents XSS token theft
- **Path Restriction**: Cookies scoped to application paths

## Environment Configuration

Add to your `.env.local`:

```bash
CSRF_SECRET="your-secure-csrf-secret-key"
NEXTAUTH_SECRET="your-secure-nextauth-secret-key"
NEXTAUTH_URL="http://localhost:3000"
```

Generate secure secrets:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## Route Protection Status

### Protected Routes (Require Authentication + CSRF)
- `POST /api/schemas` - Create schema
- `PUT /api/schemas/[id]` - Update schema
- `DELETE /api/schemas/[id]` - Delete schema
- `POST /api/generate` - Generate data

### Protected Routes (Require Authentication Only)
- `GET /api/schemas` - List schemas
- `GET /api/schemas/[id]` - Get schema
- `GET /api/csrf` - Get CSRF token

### Unprotected Routes (Handled by the NextAuth library)
- `GET|POST /api/auth/[...nextauth]` - NextAuth endpoints

## Best Practices

1. **Always Use protectedFetch**: Use the utility function for all API calls
2. **Handle Token Refresh**: The utility automatically fetches tokens when needed
3. **Error Handling**: Implement proper error handling for authentication failures
4. **Secure Environment**: Use HTTPS in production
5. **Regular Token Rotation**: Consider implementing token expiration

## Testing

To test the security implementation:

1. **Authentication Test**: Try accessing protected routes without authentication
2. **CSRF Test**: Try making state-changing requests without CSRF tokens
3. **Cross-origin Test**: Verify CSRF protection works against cross-origin attacks
4. **Session Test**: Verify session validation works correctly

## Troubleshooting

### Common Issues

1. **CSRF Token Missing**: Ensure `protectedFetch` is used for state-changing operations
2. **Session Validation Failed**: Check that NextAuth is properly configured
3. **Middleware Conflicts**: Verify middleware matcher patterns are correct
4. **Cookie Issues**: Ensure cookies are properly set and transmitted

### Debug Steps

1. Check browser network tab for CSRF token requests
2. Verify session tokens in browser cookies
3. Check server logs for validation errors
4. Ensure environment variables are set correctly

## Migration Guide

If updating existing code:

1. Replace direct `fetch` calls with `protectedFetch`
2. Update route handlers to use protection utilities
3. Add CSRF_SECRET to environment variables
4. Test all protected routes

This implementation provides comprehensive security while maintaining ease of use and development efficiency.
