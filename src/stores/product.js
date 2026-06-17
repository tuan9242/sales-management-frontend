import { defineStore } from 'pinia';
import { ref } from 'vue';
import api from '../config/api';

/**
 * Pinia store for Product, Category & StockReceipt management (Nhóm 5).
 * Gọi API qua Gateway: /api/products, /api/categories, /api/stock-receipts
 */
export const useProductStore = defineStore('product', () => {
  // ── Products State ──
  const products = ref([]);
  const totalProducts = ref(0);
  const currentPage = ref(1);
  const pageSize = ref(20);
  const totalPages = ref(0);
  const loading = ref(false);
  const error = ref(null);

  // ── Categories State ──
  const categories = ref([]);
  const categoriesTotal = ref(0);
  const categoriesCurrentPage = ref(1);
  const categoriesTotalPages = ref(0);
  const categoriesLoading = ref(false);

  // ── Stock Receipts State ──
  const receipts = ref([]);
  const receiptsTotal = ref(0);
  const receiptsCurrentPage = ref(1);
  const receiptsTotalPages = ref(0);
  const receiptsLoading = ref(false);

  // ── Low Stock Alerts ──
  const lowStockProducts = ref([]);

  // ═══════════════════════════════════════════════
  //  PRODUCTS CRUD
  // ═══════════════════════════════════════════════

  /**
   * Fetches paginated list of products with optional filters.
   * Backend returns: { data: ProductDto[], page, pageSize, totalCount, totalPages }
   */
  const fetchProducts = async (page = 1, search = null, categoryId = null) => {
    loading.value = true;
    error.value = null;
    try {
      const params = { page, pageSize: pageSize.value };
      if (search) params.search = search;
      if (categoryId) params.categoryId = categoryId;
      const response = await api.get('/api/products', { params });
      // Backend trả về PaginatedResult<ProductDto>
      const result = response.data;
      products.value = result.data || [];
      totalProducts.value = result.totalCount || 0;
      totalPages.value = result.totalPages || 0;
      currentPage.value = result.page || 1;
    } catch (err) {
      error.value = err.response?.data?.message || 'Không thể tải danh sách sản phẩm';
      products.value = [];
    } finally {
      loading.value = false;
    }
  };

  /**
   * Creates a new product.
   * Request body: { code, name, description, importPrice, salePrice, imageUrl, categoryId, minStockThreshold, initialStock }
   */
  const createProduct = async (productData) => {
    try {
      const response = await api.post('/api/products', productData);
      await fetchProducts(currentPage.value);
      return { success: true, data: response.data };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Tạo sản phẩm thất bại' };
    }
  };

  /**
   * Updates an existing product.
   * Request body: { name?, description?, importPrice?, salePrice?, imageUrl?, categoryId?, minStockThreshold?, isActive? }
   */
  const updateProduct = async (id, productData) => {
    try {
      const response = await api.put(`/api/products/${id}`, productData);
      await fetchProducts(currentPage.value);
      return { success: true, data: response.data };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Cập nhật sản phẩm thất bại' };
    }
  };

  /**
   * Deletes a product by ID.
   */
  const deleteProduct = async (id) => {
    try {
      await api.delete(`/api/products/${id}`);
      await fetchProducts(currentPage.value);
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Xóa sản phẩm thất bại' };
    }
  };

  /**
   * Fetches products below minimum stock threshold.
   */
  const fetchLowStock = async () => {
    try {
      const response = await api.get('/api/products/low-stock');
      lowStockProducts.value = Array.isArray(response.data) ? response.data : [];
    } catch {
      lowStockProducts.value = [];
    }
  };

  // ═══════════════════════════════════════════════
  //  CATEGORIES CRUD
  // ═══════════════════════════════════════════════

  /**
   * Fetches category tree from Backend.
   */
  const fetchCategories = async (page = 1) => {
    categoriesLoading.value = true;
    try {
      const params = { page, pageSize: pageSize.value };
      const response = await api.get('/api/categories', { params });
      if (response.data && response.data.data) {
        categories.value = response.data.data;
        categoriesTotal.value = response.data.totalCount || 0;
        categoriesTotalPages.value = response.data.totalPages || 0;
        categoriesCurrentPage.value = response.data.page || 1;
      } else {
        categories.value = Array.isArray(response.data) ? response.data : [];
      }
    } catch {
      categories.value = [];
    } finally {
      categoriesLoading.value = false;
    }
  };

  /**
   * Creates a new category.
   * Request body: { name, description?, parentCategoryId?, sortOrder }
   */
  const createCategory = async (categoryData) => {
    try {
      const response = await api.post('/api/categories', categoryData);
      await fetchCategories();
      return { success: true, data: response.data };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Tạo danh mục thất bại' };
    }
  };

  /**
   * Updates an existing category.
   */
  const updateCategory = async (id, categoryData) => {
    try {
      const response = await api.put(`/api/categories/${id}`, categoryData);
      await fetchCategories();
      return { success: true, data: response.data };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Cập nhật danh mục thất bại' };
    }
  };

  /**
   * Deletes a category by ID.
   */
  const deleteCategory = async (id) => {
    try {
      await api.delete(`/api/categories/${id}`);
      await fetchCategories();
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Xóa danh mục thất bại' };
    }
  };


  /**
   * Fetches paginated list of stock receipts.
   */
  const fetchReceipts = async (page = 1, status = null) => {
    receiptsLoading.value = true;
    try {
      const params = { page, pageSize: pageSize.value };
      if (status) params.status = status;
      const response = await api.get('/api/stock-receipts', { params });
      const result = response.data;
      receipts.value = result.data || [];
      receiptsTotal.value = result.totalCount || 0;
      receiptsTotalPages.value = result.totalPages || 0;
      receiptsCurrentPage.value = result.page || 1;
    } catch {
      receipts.value = [];
    } finally {
      receiptsLoading.value = false;
    }
  };

  /**
   * Creates a new stock receipt.
   * Request body: { supplierName?, note?, items: [{ productId, quantity, importPrice }] }
   */
  const createReceipt = async (receiptData) => {
    try {
      const response = await api.post('/api/stock-receipts', receiptData);
      await fetchReceipts();
      return { success: true, data: response.data };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Tạo phiếu nhập thất bại' };
    }
  };

  /**
   * Confirms a pending stock receipt (updates inventory).
   */
  const confirmReceipt = async (id) => {
    try {
      await api.put(`/api/stock-receipts/${id}/confirm`);
      await fetchReceipts();
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Xác nhận phiếu nhập thất bại' };
    }
  };
  /**
   * Fetches detail of a single stock receipt by ID.
   */
  const fetchReceiptDetail = async (id) => {
    try {
      const response = await api.get(`/api/stock-receipts/${id}`);
      return { success: true, data: response.data };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Lỗi tải chi tiết phiếu nhập' };
    }
  };

  /**
   * Updates an existing stock receipt (only drafts).
   */
  const updateReceipt = async (id, receiptData) => {
    try {
      const response = await api.put(`/api/stock-receipts/${id}`, receiptData);
      await fetchReceipts(receiptsCurrentPage.value);
      return { success: true, data: response.data };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Cập nhật phiếu nhập thất bại' };
    }
  };

  /**
   * Deletes a draft stock receipt.
   */
  const deleteReceipt = async (id) => {
    try {
      await api.delete(`/api/stock-receipts/${id}`);
      await fetchReceipts(receiptsCurrentPage.value);
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Xóa phiếu nhập thất bại' };
    }
  };

  return {
    // Products
    products,
    totalProducts,
    currentPage,
    pageSize,
    totalPages,
    loading,
    error,
    fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    lowStockProducts,
    fetchLowStock,
    // Categories
    categories,
    categoriesTotal,
    categoriesCurrentPage,
    categoriesTotalPages,
    categoriesLoading,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    // Stock Receipts
    receipts,
    receiptsTotal,
    receiptsCurrentPage,
    receiptsTotalPages,
    receiptsLoading,
    fetchReceipts,
    createReceipt,
    confirmReceipt,
    fetchReceiptDetail,
    updateReceipt,
    deleteReceipt,
  };
});
