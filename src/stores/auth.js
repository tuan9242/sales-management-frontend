import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import api from '../config/api';

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('jwt_token') || null);
  const user = ref(JSON.parse(localStorage.getItem('user_info') || 'null'));
  const loading = ref(false);
  const error = ref(null);

  const isAuthenticated = computed(() => !!token.value);
  const userRole = computed(() => {
    if (!user.value) return null;
    // Ánh xạ enum Role dạng số từ Backend sang dạng Chuỗi cho Vue Router
    const roleMap = {
      0: 'Admin',
      1: 'Sales',
      2: 'Warehouse',
      3: 'Customer',
      'Admin': 'Admin',
      'Sales': 'Sales',
      'Warehouse': 'Warehouse',
      'Customer': 'Customer'
    };
    return roleMap[user.value.role] ?? user.value.role;
  });

  const hasRole = (roles) => {
    const currentRole = userRole.value;
    if (!currentRole) return false;
    if (Array.isArray(roles)) {
      return roles.includes(currentRole);
    }
    return currentRole === roles;
  };

  const login = async (email, password) => {
    loading.value = true;
    error.value = null;
    try {
      let data;
      // Mock login nếu nhập 'admin', 'sales', 'warehouse' để các nhóm khác test không cần chạy backend
      if (email === 'admin' || email === 'sales' || email === 'warehouse') {
        data = {
          accessToken: 'mock-jwt-token-xyz-123',
          user: {
            id: 'mock-id-1',
            email: `${email}@shop.com`,
            fullName: email.toUpperCase(),
            role: email === 'admin' ? 'Admin' : (email === 'sales' ? 'Sales' : 'Warehouse')
          }
        };
      } else {
        // Thực tế gọi API thông qua Gateway dẫn tới AuthService.cs
        const response = await api.post('/api/auth/login', { email, password });
        data = response.data;
      }

      if (data.user.role === 3 || data.user.role === 'Customer') {
        error.value = 'Tài khoản khách hàng không có quyền truy cập trang quản trị!';
        return false;
      }

      token.value = data.accessToken;
      user.value = data.user;
      
      localStorage.setItem('jwt_token', data.accessToken);
      localStorage.setItem('user_info', JSON.stringify(data.user));
      
      return true;
    } catch (err) {
      error.value = err.response?.data?.message || err.response?.data?.errors?.[0] || 'Đăng nhập thất bại. Vui lòng kiểm tra lại!';
      return false;
    } finally {
      loading.value = false;
    }
  };

  const register = async (email, password, fullName, phone) => {
    loading.value = true;
    error.value = null;
    try {
      await api.post('/api/auth/register', { email, password, fullName, phone });
      return true;
    } catch (err) {
      error.value = err.response?.data?.message || err.response?.data?.errors?.[0] || 'Đăng ký thất bại. Vui lòng kiểm tra lại!';
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
    register,
    logout
  };
});
