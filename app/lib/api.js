const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5050';

function getToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('accessToken');
}

function setToken(token) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('accessToken', token);
}

function clearToken() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('accessToken');
  localStorage.removeItem('user');
}

// Pages that are part of the auth/signup flow — never auto-redirect away from these
const AUTH_FLOW_PAGES = ['/', '/signup', '/verify-otp', '/setup-2fa', '/verify-2fa'];

async function refreshAccessToken() {
  const res = await fetch(`${BASE_URL}/api/auth/refresh`, {
    method: 'GET', // GET so SameSite:Lax cookie is sent reliably cross-origin
    credentials: 'include',
  });
  if (!res.ok) {
    clearToken();
    const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
    const isAuthPage = AUTH_FLOW_PAGES.includes(pathname) || pathname.startsWith('/auth/');
    if (!isAuthPage) {
      // window.location.href = '/';
    }
    return null;
  }
  const data = await res.json();
  setToken(data.accessToken);
  return data.accessToken;
}

async function request(path, options = {}) {
  const token = getToken();

  const headers = {
    ...options.headers,
  };

  // Only set Content-Type for non-FormData bodies
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
    credentials: 'include',
  });

  // Token expired — try refresh once (only if we had a token; skip for unauthenticated requests like login)
  if (res.status === 401 && token) {
    const newToken = await refreshAccessToken();
    if (!newToken) return null;

    const retry = await fetch(`${BASE_URL}${path}`, {
      ...options,
      headers: {
        ...headers,
        'Authorization': `Bearer ${newToken}`,
      },
      credentials: 'include',
    });

    if (!retry.ok) {
      const err = await retry.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(err.message || 'Request failed');
    }

    return retry.status === 204 ? null : retry.json();
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(err.message || 'Request failed');
  }

  return res.status === 204 ? null : res.json();
}

export const api = {
  get: (path, options) => request(path, { method: 'GET', ...options }),
  post: (path, body, options) =>
    request(path, {
      method: 'POST',
      body: body instanceof FormData ? body : JSON.stringify(body),
      ...options,
    }),
  patch: (path, body, options) =>
    request(path, {
      method: 'PATCH',
      body: body instanceof FormData ? body : JSON.stringify(body),
      ...options,
    }),
  delete: (path, options) => request(path, { method: 'DELETE', ...options }),
  setToken,
  getToken,
  clearToken,
};

export default api;
