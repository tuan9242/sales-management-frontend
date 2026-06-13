import axios from 'axios';

// URL của Ocelot API Gateway (đọc từ biến môi trường hoặc fallback về localhost:5000)
const GATEWAY_URL = import.meta.env.VITE_API_GATEWAY_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: GATEWAY_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
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
      // Nếu là request gọi API Login bị sai mật khẩu thì chỉ trả về lỗi, KHÔNG redirect
      if (error.config && error.config.url && error.config.url.includes('/api/auth/login')) {
        return Promise.reject(error);
      }

      // Token hết hạn hoặc gọi API khác không có quyền -> đăng xuất và đá về trang login
      localStorage.removeItem('jwt_token');
      localStorage.removeItem('user_info');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
