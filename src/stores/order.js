import { defineStore } from 'pinia';
import { ref } from 'vue';
import api from '../config/api';

/**
 * Pinia store for Order, Customer & Supplier management (Nhóm 4).
 * Gọi API qua Gateway: /api/orders, /api/customers, /api/suppliers
 */
export const useOrderStore = defineStore('order', () => {
  // ── Orders State ──
  const orders = ref([]);
  const totalOrders = ref(0);
  const currentPage = ref(1);
  const pageSize = ref(20);
  const totalPages = ref(0);
  const loading = ref(false);
  const error = ref(null);

  // ── Customers State ──
  const customers = ref([]);
  const customersLoading = ref(false);

  // ── Suppliers State ──
  const suppliers = ref([]);
  const suppliersLoading = ref(false);

  // ═══════════════════════════════════════════════
  //  ORDERS CRUD
  // ═══════════════════════════════════════════════

  /**
   * Fetches paginated list of orders with optional filters.
   * Backend returns: PaginatedOrderList { data: OrderDto[], page, pageSize, totalCount, totalPages }
   */
  const fetchOrders = async (page = 1, status = null, customerId = null) => {
    loading.value = true;
    error.value = null;
    try {
      const params = { page, pageSize: pageSize.value };
      if (status) params.status = status;
      if (customerId) params.customerId = customerId;
      
      const response = await api.get('/api/orders', { params });
      const result = response.data;
      
      orders.value = result.data || [];
      totalOrders.value = result.totalCount || 0;
      totalPages.value = result.totalPages || 0;
      currentPage.value = result.page || 1;
    } catch (err) {
      error.value = err.response?.data?.message || 'Không thể tải danh sách đơn hàng';
      orders.value = [];
    } finally {
      loading.value = false;
    }
  };

  /**
   * Creates a new order.
   * Request body: CreateOrderRequest { customerId, discount?, note?, items: [{ productId, quantity }] }
   */
  const createOrder = async (orderData) => {
    try {
      const response = await api.post('/api/orders', orderData);
      await fetchOrders(currentPage.value);
      return { success: true, data: response.data };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Tạo đơn hàng thất bại' };
    }
  };

  /**
   * Fetches order details by ID.
   * Returns: OrderDetailDto
   */
  const getOrderDetail = async (id) => {
    try {
      const response = await api.get(`/api/orders/${id}`);
      return response.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Không thể tải chi tiết đơn hàng');
    }
  };

  /**
   * Updates order status.
   * Request body: { status, note? }
   */
  const updateOrderStatus = async (id, statusData) => {
    try {
      await api.put(`/api/orders/${id}/status`, statusData);
      await fetchOrders(currentPage.value);
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Cập nhật trạng thái thất bại' };
    }
  };

  // ═══════════════════════════════════════════════
  //  CUSTOMERS CRUD
  // ═══════════════════════════════════════════════

  /**
   * Fetches list of customers.
   */
  const fetchCustomers = async (page = 1, search = null) => {
    customersLoading.value = true;
    try {
      const params = { page, pageSize: 50 };
      if (search) params.search = search;
      
      const response = await api.get('/api/customers', { params });
      // Trả về PaginatedCustomerList
      customers.value = response.data?.data || [];
    } catch {
      customers.value = [];
    } finally {
      customersLoading.value = false;
    }
  };

  /**
   * Creates a new customer.
   */
  const createCustomer = async (customerData) => {
    try {
      const response = await api.post('/api/customers', customerData);
      await fetchCustomers();
      return { success: true, data: response.data };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Tạo khách hàng thất bại' };
    }
  };

  // ═══════════════════════════════════════════════
  //  SUPPLIERS CRUD
  // ═══════════════════════════════════════════════

  /**
   * Fetches list of suppliers.
   */
  const fetchSuppliers = async () => {
    suppliersLoading.value = true;
    try {
      const response = await api.get('/api/suppliers');
      suppliers.value = Array.isArray(response.data) ? response.data : [];
    } catch {
      suppliers.value = [];
    } finally {
      suppliersLoading.value = false;
    }
  };

  /**
   * Creates a new supplier.
   */
  const createSupplier = async (supplierData) => {
    try {
      const response = await api.post('/api/suppliers', supplierData);
      await fetchSuppliers();
      return { success: true, data: response.data };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Tạo nhà cung cấp thất bại' };
    }
  };

  return {
    // Orders
    orders,
    totalOrders,
    currentPage,
    pageSize,
    totalPages,
    loading,
    error,
    fetchOrders,
    createOrder,
    getOrderDetail,
    updateOrderStatus,
    // Customers
    customers,
    customersLoading,
    fetchCustomers,
    createCustomer,
    // Suppliers
    suppliers,
    suppliersLoading,
    fetchSuppliers,
    createSupplier
  };
});
