const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const request = async (endpoint, options = {}) => {
  const res = await fetch(`${API_URL}${endpoint}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
};

// Products
export const getProducts = (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return request(`/products${query ? `?${query}` : ''}`);
};
export const getProductById = (id)      => request(`/products/${id}`);
export const createProduct  = (body)    => request('/products', { method: 'POST', body: JSON.stringify(body) });
export const updateProduct  = (id, body)=> request(`/products/${id}`, { method: 'PUT', body: JSON.stringify(body) });
export const deleteProduct  = (id)      => request(`/products/${id}`, { method: 'DELETE' });

// Cart
export const getCart       = (user_id)   => request(`/cart?user_id=${user_id}`);
export const addToCart     = (body)      => request('/cart', { method: 'POST', body: JSON.stringify(body) });
export const removeFromCart= (id)        => request(`/cart/${id}`, { method: 'DELETE' });

// Orders
export const createOrder = (body)       => request('/orders', { method: 'POST', body: JSON.stringify(body) });
export const getOrders   = (user_id)    => request(`/orders?user_id=${user_id}`);
export const updateOrder = (id, body)   => request(`/orders/${id}`, { method: 'PUT', body: JSON.stringify(body) });

// Auth
export const registerUser = (body)      => request('/auth/register', { method: 'POST', body: JSON.stringify(body) });
export const loginUser    = (body)      => request('/auth/login',    { method: 'POST', body: JSON.stringify(body) });
