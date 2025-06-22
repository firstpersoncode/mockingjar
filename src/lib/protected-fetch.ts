interface CSRFResponse {
  csrfToken: string;
}

/**
 * Utility function to make protected API requests with CSRF token
 */
export async function protectedFetch(
  url: string,
  options: RequestInit = {},
  csrfToken?: string
): Promise<Response> {
  // Get CSRF token from parameter or fetch it
  let token = csrfToken;

  if (
    !token &&
    ['POST', 'PUT', 'DELETE', 'PATCH'].includes(
      options.method?.toUpperCase() || 'GET'
    )
  ) {
    const csrfResponse = await fetch('/api/csrf', {
      method: 'GET',
      credentials: 'include',
    });

    if (csrfResponse.ok) {
      const csrfData: CSRFResponse = await csrfResponse.json();
      token = csrfData.csrfToken;
    }
  }

  // Prepare headers
  const headers = new Headers(options.headers);

  if (
    token &&
    ['POST', 'PUT', 'DELETE', 'PATCH'].includes(
      options.method?.toUpperCase() || 'GET'
    )
  ) {
    headers.set('X-CSRF-TOKEN', token);
  }

  // Make the request
  return fetch(url, {
    ...options,
    headers,
    credentials: 'include', // Always include cookies
  });
}
