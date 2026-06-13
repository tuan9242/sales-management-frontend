import { defineStore } from 'pinia';
import { ref } from 'vue';
import api from '../config/api';

export const useReportStore = defineStore('report', () => {
  const dailyRevenues = ref([]);
  const loading = ref(false);
  const error = ref(null);

  const fetchDailyRevenue = async (startDate, endDate) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await api.get('/api/reports/daily-revenue', {
        params: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString()
        }
      });
      // Sort by date ascending
      dailyRevenues.value = response.data.sort((a, b) => new Date(a.date) - new Date(b.date));
      return true;
    } catch (err) {
      error.value = err.response?.data?.message || 'Không thể lấy dữ liệu báo cáo.';
      console.error('Lỗi khi fetch daily revenue:', err);
      return false;
    } finally {
      loading.value = false;
    }
  };

  return {
    dailyRevenues,
    loading,
    error,
    fetchDailyRevenue
  };
});
