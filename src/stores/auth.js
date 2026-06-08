import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import api from '../config/api';

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('jwt_token') || null);
  const user = ref(JSON.parse(localStorage.getItem('user_info') || 'null'));
  const loading = ref(false);
  const error = ref(null);

  const isAuthenticated = computed(() => !!token.value);
  const userRole = computed(() => user.value?.role || null);

  const hasRole = (roles) => {
    if (!userRole.value) return false;
    if (Array.isArray(roles)) {
      return roles.includes(userRole.value);
    }
    return userRole.value === roles;
  };

  const login = async (username, password) => {
    loading.value = true;
    error.value = null;
    try {
      // Demo mock login nếu backend chưa khởi chạy hoặc gặp lỗi đăng nhập
      // Nhóm 6 sẽ triển khai API thực tế tại route /api/users/login qua Gateway
      let data;
      if (username === 'admin' || username === 'sales' || username === 'warehouse') {
        // Mock dữ liệu đăng nhập local phục vụ việc test giao diện của các nhóm
        data = {
          token: 'mock-jwt-token-xyz-123',
          user: {
            id: 1,
            username: username,
            displayName: username.toUpperCase(),
            role: username === 'admin' ? 'Admin' : (username === 'sales' ? 'Sales' : 'Warehouse')
          }
        };
      } else {
        // Thực tế gọi API thông qua Gateway
        const response = await api.post('/api/users/login', { username, password });
        data = response.data;
      }

      token.value = data.token;
      user.value = data.user;
      
      localStorage.setItem('jwt_token', data.token);
      localStorage.setItem('user_info', JSON.stringify(data.user));
      
      return true;
    } catch (err) {
      error.value = err.response?.data?.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại!';
      return false;
    } finally {
      loading.value = false;
    }
  };

  const logout = () => {
    token.value = null;
    user.value = null;
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('user_info');
    window.location.href = '/login';
  };

  return {
    token,
    user,
    loading,
    error,
    isAuthenticated,
    userRole,
    hasRole,
    login,
    logout
  };
});
