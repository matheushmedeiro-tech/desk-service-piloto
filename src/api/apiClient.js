// apiClient.js
// Cliente REST genérico para consumir seu backend

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

async function request(endpoint, { method = 'GET', body, headers = {}, params } = {}) {
  let url = `${API_BASE_URL}${endpoint}`;
  if (params) {
    const query = new URLSearchParams(params).toString();
    url += `?${query}`;
  }
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  };
  if (body) {
    options.body = JSON.stringify(body);
  }
  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(await response.text() || 'Erro na requisição');
  }
  return response.json();
}

export const apiClient = {
  get: (endpoint, params, headers) => request(endpoint, { method: 'GET', params, headers }),
  post: (endpoint, body, headers) => request(endpoint, { method: 'POST', body, headers }),
  put: (endpoint, body, headers) => request(endpoint, { method: 'PUT', body, headers }),
  patch: (endpoint, body, headers) => request(endpoint, { method: 'PATCH', body, headers }),
  delete: (endpoint, params, headers) => request(endpoint, { method: 'DELETE', params, headers }),
};
