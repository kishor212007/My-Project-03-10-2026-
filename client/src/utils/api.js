const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

function getToken() {
  return localStorage.getItem('palette_token') || null;
}

export function setToken(token) {
  if (token) {
    localStorage.setItem('palette_token', token);
  } else {
    localStorage.removeItem('palette_token');
  }
}

async function request(endpoint, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = `${BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers
  });

  let data = null;
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  } else {
    data = { message: await response.text() };
  }

  if (!response.ok) {
    const errorMsg = data?.error || data?.message || `Request failed with status ${response.status}`;
    const error = new Error(errorMsg);
    error.status = response.status;
    error.details = data?.details;
    throw error;
  }

  return data;
}

export const api = {
  // Authentication
  auth: {
    login: (email, password) =>
      request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      }),

    register: (username, email, password) =>
      request('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ username, email, password })
      }),

    getMe: () => request('/auth/me'),

    updateProfile: data =>
      request('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify(data)
      })
  },

  // Palettes
  palettes: {
    list: (params = {}) => {
      const searchParams = new URLSearchParams();
      if (params.search) searchParams.append('search', params.search);
      if (params.tag) searchParams.append('tag', params.tag);
      if (params.sort) searchParams.append('sort', params.sort);
      if (params.page) searchParams.append('page', params.page);
      if (params.limit) searchParams.append('limit', params.limit);

      const qs = searchParams.toString();
      return request(`/palettes${qs ? `?${qs}` : ''}`);
    },

    get: id => request(`/palettes/${id}`),

    getMine: () => request('/palettes/mine'),

    getSaved: () => request('/palettes/saved'),

    create: ({ title, colors, tags }) =>
      request('/palettes', {
        method: 'POST',
        body: JSON.stringify({ title, colors, tags })
      }),

    delete: id =>
      request(`/palettes/${id}`, {
        method: 'DELETE'
      }),

    toggleLike: id =>
      request(`/palettes/${id}/like`, {
        method: 'POST'
      })
  },

  // Admin
  admin: {
    getStats: () => request('/admin/stats'),

    getUsers: () => request('/admin/users'),

    deleteUser: id =>
      request(`/admin/users/${id}`, {
        method: 'DELETE'
      }),

    getPalettes: () => request('/admin/palettes'),

    deletePalette: id =>
      request(`/admin/palettes/${id}`, {
        method: 'DELETE'
      })
  }
};
