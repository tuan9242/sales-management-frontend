import { defineStore } from 'pinia';
import { ref } from 'vue';
import api from '../config/api';

export const useUserStore = defineStore('user', () => {
  const users = ref([]);
  const loading = ref(false);
  const error = ref(null);

  const fetchUsers = async () => {
    loading.value = true;
    error.value = null;
    try {
      const response = await api.get('/api/users');
      users.value = response.data;
    } catch (err) {
      error.value = err.response?.data?.message || 'Không thể lấy danh sách người dùng.';
      console.error('Lỗi khi fetch users:', err);
    } finally {
      loading.value = false;
    }
  };

  const updateUserStatus = async (userId, newStatus) => {
    try {
      // Vì API PUT /api/users/{id} yêu cầu FullName, Phone, Status, 
      // ta cần tìm user hiện tại để gửi lại các field kia.
      const user = users.value.find(u => u.id === userId);
      if (!user) return false;

      const response = await api.put(`/api/users/${userId}`, {
        fullName: user.displayName || user.fullName || '',
        phone: user.phone || '',
        status: newStatus // VD: 0 (Active), 1 (Inactive), 2 (Blocked)
      });
      
      // Update local state
      const index = users.value.findIndex(u => u.id === userId);
      if (index !== -1) {
        // Map back status to local object
        users.value[index].status = newStatus;
      }
      return true;
    } catch (err) {
      console.error('Lỗi khi cập nhật trạng thái:', err);
      return false;
    }
  };

  const deleteUser = async (userId) => {
    try {
      await api.delete(`/api/users/${userId}`);
      // Xóa khỏi danh sách local
      users.value = users.value.filter(u => u.id !== userId);
      return true;
    } catch (err) {
      console.error('Lỗi khi xóa người dùng:', err);
      return false;
    }
  };

  const createUser = async (userData) => {
    try {
      const response = await api.post('/api/users', userData);
      users.value.push(response.data);
      return { success: true, data: response.data };
    } catch (err) {
      console.error('Lỗi khi tạo người dùng:', err);
      // Trả về lỗi chi tiết từ backend nếu có (FluentValidation thường trả mảng errors)
      return { 
        success: false, 
        message: err.response?.data?.message || 'Có lỗi xảy ra khi tạo người dùng',
        errors: err.response?.data?.errors
      };
    }
  };

  return {
    users,
    loading,
    error,
    fetchUsers,
    updateUserStatus,
    deleteUser,
    createUser
  };
});
