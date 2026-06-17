import { defineStore } from 'pinia';
import { ref } from 'vue';
import api from '../config/api';

export const useReportStore = defineStore('report', () => {
  const dailyRevenues = ref([]);
  const topProducts = ref([]);
  const topCustomers = ref([]);
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

  const fetchTopProducts = async (topN = 10, startDate = null, endDate = null) => {
    try {
      const params = { topN };
      if (startDate) params.startDate = startDate.toISOString();
      if (endDate) params.endDate = endDate.toISOString();

      const response = await api.get('/api/reports/top-selling-products', { params });
      topProducts.value = response.data || [];
      return true;
    } catch (err) {
      console.error('Lỗi khi fetch top products:', err);
      topProducts.value = [];
      return false;
    }
  };

  const fetchTopCustomers = async (topN = 10) => {
    try {
      const response = await api.get('/api/reports/top-customers', { params: { topN } });
      topCustomers.value = response.data || [];
      return true;
    } catch (err) {
      console.error('Lỗi khi fetch top customers:', err);
      topCustomers.value = [];
      return false;
    }
  };

  return {
    dailyRevenues,
    topProducts,
    topCustomers,
    loading,
    error,
    fetchDailyRevenue,
    fetchTopProducts,
    fetchTopCustomers
  };
});
