import axios from 'axios';

// URL của Ocelot API Gateway (đọc từ biến môi trường hoặc fallback về localhost:5000)
const GATEWAY_URL = import.meta.env.VITE_API_GATEWAY_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: GATEWAY_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/env.json',
    'Accept': 'application/json',
  }
});

// Interceptor đính kèm Token JWT tự động cho mọi request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('jwt_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor xử lý lỗi chung (ví dụ: 401 Unauthorized)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token hết hạn hoặc không hợp lệ -> đăng xuất người dùng
      localStorage.removeItem('jwt_token');
      localStorage.removeItem('user_info');
      // Tùy chọn: Chuyển hướng người dùng về trang login
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
