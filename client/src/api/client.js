const API_BASE = '/api';

export async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem('medicore_token');
  const headers = {
    ...options.headers
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (!(options.body instanceof FormData) && options.body && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const url = `${API_BASE}${endpoint}`;
  let response;
  try {
    response = await fetch(url, {
      ...options,
      headers
    });
  } catch (netErr) {
    const error = new Error('Network connection unavailable. Operating in local offline mode.');
    error.isNetworkError = true;
    throw error;
  }

  const contentType = response.headers.get('content-type') || '';
  let data;
  if (contentType.includes('application/json')) {
    try {
      data = await response.json();
    } catch (e) {
      data = {};
    }
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    const msg = (typeof data === 'object' && (data.message || data.error)) ||
                (typeof data === 'string' && data.length < 150 && !data.includes('<html') ? data : null) ||
                `Service temporarily unavailable (${response.status})`;
    const error = new Error(msg);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const api = {
  get: (url) => apiRequest(url, { method: 'GET' }),
  post: (url, body) => apiRequest(url, { method: 'POST', body: body instanceof FormData ? body : JSON.stringify(body) }),
  put: (url, body) => apiRequest(url, { method: 'PUT', body: body instanceof FormData ? body : JSON.stringify(body) }),
  patch: (url, body) => apiRequest(url, { method: 'PATCH', body: body instanceof FormData ? body : JSON.stringify(body) }),
  delete: (url) => apiRequest(url, { method: 'DELETE' })
};
