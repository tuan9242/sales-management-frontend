<template>
  <div>
    <v-row class="mb-6">
      <v-col cols="12" class="d-flex justify-space-between align-center flex-wrap gap-4">
        <div>
          <h1 class="text-h4 font-weight-black text-slate-900 tracking-tight flex items-center gap-2">
            <v-icon color="primary" size="large">mdi-cart-outline</v-icon>
            Quản lý Đơn hàng & Bán lẻ
          </h1>
          <p class="text-subtitle-1 text-slate-600 mt-1">Lập hóa đơn bán lẻ, quản lý trạng thái giao dịch và công nợ khách hàng (Phân hệ Nhóm 4)</p>
        </div>
        <v-btn
          color="primary"
          prepend-icon="mdi-cart-plus"
          class="rounded-xl px-6 py-3 font-weight-bold text-white"
          elevation="0"
          @click="openCreateDialog"
        >
          Tạo đơn bán hàng
        </v-btn>
      </v-col>
    </v-row>

    <!-- Alert lỗi -->
    <v-alert v-if="error" type="error" variant="tonal" density="compact" class="mb-4" closable @click:close="error = null">
      {{ error }}
    </v-alert>

    <!-- Content Card -->
    <v-card class="glass-card mb-6" rounded="xl" elevation="0">
      <div class="pa-6 border-b border-slate-200 d-flex align-center justify-space-between flex-wrap gap-4">
        <div class="d-flex align-center gap-3 flex-wrap" style="flex:1">
          <v-text-field
            v-model="search"
            prepend-inner-icon="mdi-magnify"
            label="Tìm kiếm theo mã đơn hoặc khách hàng..."
            variant="outlined"
            density="compact"
            hide-details
            color="primary"
            rounded="xl"
            class="search-input"
            style="min-width:260px;max-width:380px"
            @update:model-value="currentPage = 1"
          ></v-text-field>
          <v-select
            v-model="statusFilter"
            :items="statusFilterOptions"
            item-title="label"
            item-value="value"
            variant="outlined"
            density="compact"
            hide-details
            style="min-width:180px;max-width:220px"
            prepend-inner-icon="mdi-filter-outline"
            @update:model-value="currentPage = 1"
          ></v-select>
        </div>
        <v-btn variant="outlined" color="slate-650" size="small" class="rounded-lg" @click="fetchOrders">
          <v-icon start>mdi-refresh</v-icon> Làm mới
        </v-btn>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="pa-8 text-center">
        <v-progress-circular indeterminate color="success" size="40"></v-progress-circular>
        <p class="mt-3 text-slate-500">Đang tải dữ liệu...</p>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full text-left border-collapse text-slate-700">
          <thead>
            <tr class="bg-slate-50 border-b border-slate-200">
              <th class="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Mã đơn hàng</th>
              <th class="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Khách hàng</th>
              <th class="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-center">Số SP</th>
              <th class="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Tổng thanh toán</th>
              <th class="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Phương thức TT</th>
              <th class="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Trạng thái</th>
              <th class="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Ngày tạo</th>
              <th class="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr
              v-for="order in paginatedOrders"
              :key="order.id"
              class="hover:bg-slate-50/50 transition-colors duration-150 group"
            >
              <td class="px-6 py-4">
                <span class="font-mono font-bold text-success cursor-pointer" @click="viewOrder(order)">
                  {{ order.orderCode }}
                </span>
              </td>
              <td class="px-6 py-4 font-semibold text-slate-900">{{ order.customerName }}</td>
              <td class="px-6 py-4">
                <span class="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs font-semibold">
                  {{ order.items?.length ?? 0 }} sản phẩm
                </span>
              </td>
              <td class="px-6 py-4 font-semibold text-slate-900">{{ formatPrice(order.totalAmount) }}</td>
              <td class="px-6 py-4">
                <span class="text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100 px-2.5 py-0.5 rounded-full">
                  {{ order.payments?.length > 0 ? order.payments[0].method : 'Chưa thanh toán' }}
                </span>
              </td>
              <td class="px-6 py-4">
                <span :class="getStatusBadgeClass(order.status)">{{ translateStatus(order.status) }}</span>
              </td>
              <td class="px-6 py-4 text-sm text-slate-550">{{ formatDate(order.orderDate) }}</td>
              <td class="px-6 py-4">
                <div class="d-flex gap-1">
                  <v-btn icon="mdi-eye-outline" size="x-small" variant="text" color="primary" @click="viewOrder(order)"></v-btn>
                  <v-btn icon="mdi-delete-outline" size="x-small" variant="text" color="error" @click="confirmDelete(order)"></v-btn>
                </div>
              </td>
            </tr>
            <tr v-if="totalOrders === 0 && !loading">
              <td colspan="8" class="text-center py-12 text-slate-500">
                <v-icon size="48" color="slate-300" class="mb-3">mdi-cart-off</v-icon>
                <p>Chưa có đơn hàng nào. Hãy tạo đơn đầu tiên!</p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination footer -->
      <div v-if="totalOrders > 0" class="px-6 py-4 border-t border-slate-200 d-flex align-center justify-space-between flex-wrap gap-3">
        <div class="text-sm text-slate-500">
          Hiển thị <span class="font-semibold text-slate-700">{{ (currentPage - 1) * pageSize + 1 }}–{{ Math.min(currentPage * pageSize, totalOrders) }}</span>
          trong tổng số <span class="font-semibold text-slate-700">{{ totalOrders }}</span> đơn hàng
        </div>
        <div class="d-flex align-center gap-3">
          <v-select
            v-model="pageSize"
            :items="[5, 10, 20, 50]"
            density="compact"
            variant="outlined"
            hide-details
            style="width: 90px"
            @update:model-value="onPageSizeChange"
          ></v-select>
          <v-pagination
            v-model="currentPage"
            :length="totalPages"
            :total-visible="5"
            density="compact"
            color="success"
            rounded="lg"
          ></v-pagination>
        </div>
      </div>
    </v-card>

    <!-- ===== DIALOG TẠO ĐƠN HÀNG ===== -->
    <v-dialog v-model="createDialog" max-width="760" persistent>
      <v-card rounded="xl">
        <v-card-title class="pa-6 pb-4 d-flex align-center justify-space-between border-b">
          <span class="text-h6 font-weight-bold">
            <v-icon color="success" class="mr-2">mdi-cart-plus</v-icon>
            Tạo đơn bán hàng mới
          </span>
          <v-btn icon="mdi-close" variant="text" @click="closeCreateDialog"></v-btn>
        </v-card-title>

        <v-card-text class="pa-6">
          <v-form ref="formRef">
            <!-- Chọn khách hàng -->
            <div class="mb-4">
              <label class="field-label">Khách hàng <span class="text-error">*</span></label>
              <v-select
                v-model="form.customerId"
                :items="customers"
                item-title="fullName"
                item-value="id"
                variant="outlined"
                density="comfortable"
                placeholder="Chọn khách hàng..."
                :rules="[v => !!v || 'Vui lòng chọn khách hàng']"
                :loading="loadingCustomers"
              >
                <template #item="{ props, item }">
                  <v-list-item v-bind="props">
                    <template #subtitle>
                      {{ item.raw.phone || 'Chưa có SĐT' }}
                      <span v-if="item.raw._source === 'user'" class="text-primary ml-1">(Người dùng HT)</span>
                    </template>
                  </v-list-item>
                </template>
              </v-select>
            </div>

            <!-- Danh sách sản phẩm -->
            <div class="mb-2">
              <div class="d-flex align-center justify-space-between mb-3">
                <label class="field-label">Sản phẩm <span class="text-error">*</span></label>
                <v-btn size="small" color="success" variant="tonal" prepend-icon="mdi-plus" @click="addItem">
                  Thêm sản phẩm
                </v-btn>
              </div>

              <div v-for="(item, idx) in form.items" :key="idx" class="item-row mb-3 pa-3 rounded-lg bg-slate-50 border border-slate-200">
                <div class="d-flex align-center gap-2 mb-2">
                  <span class="text-caption font-weight-bold text-slate-500">SP {{ idx + 1 }}</span>
                  <v-spacer></v-spacer>
                  <v-btn icon="mdi-close" size="x-small" variant="text" color="error" @click="removeItem(idx)"></v-btn>
                </div>
                <v-row dense>
                  <v-col cols="12" sm="5">
                    <v-autocomplete
                      v-model="item.productId"
                      :items="productCatalog"
                      item-title="name"
                      item-value="id"
                      label="Chọn sản phẩm"
                      variant="outlined"
                      density="compact"
                      :loading="loadingProducts"
                      :rules="[v => !!v || 'Bắt buộc']"
                      no-data-text="Không có sản phẩm"
                      @update:model-value="(id) => onProductSelect(id, idx)"
                    ></v-autocomplete>
                  </v-col>
                  <v-col cols="6" sm="3">
                    <v-text-field
                      v-model.number="item.unitPrice"
                      label="Đơn giá (VND)"
                      variant="outlined"
                      density="compact"
                      type="number"
                      :rules="[v => v > 0 || 'Phải > 0']"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="6" sm="2">
                    <v-text-field
                      v-model.number="item.quantity"
                      label="Số lượng"
                      variant="outlined"
                      density="compact"
                      type="number"
                      :rules="[v => v > 0 || 'Phải > 0']"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" sm="2" class="d-flex align-center">
                    <span class="text-caption font-weight-bold text-success">
                      = {{ formatPrice(item.unitPrice * item.quantity) }}
                    </span>
                  </v-col>
                </v-row>
              </div>

              <div v-if="form.items.length === 0" class="text-center py-4 text-slate-400 text-caption border border-dashed border-slate-300 rounded-lg">
                Chưa có sản phẩm. Nhấn "Thêm sản phẩm" để bắt đầu.
              </div>
            </div>

            <!-- Tổng tiền preview -->
            <div v-if="form.items.length > 0" class="mb-4 pa-3 bg-success-lighten-5 rounded-lg border border-success-lighten-3">
              <div class="d-flex justify-space-between text-body-2">
                <span class="text-slate-600">Tổng tạm tính:</span>
                <span class="font-weight-bold">{{ formatPrice(subtotal) }}</span>
              </div>
              <div class="d-flex justify-space-between text-body-2 mt-1">
                <span class="text-slate-600">Giảm giá:</span>
                <span class="text-error">- {{ formatPrice(form.discountAmount) }}</span>
              </div>
              <v-divider class="my-2"></v-divider>
              <div class="d-flex justify-space-between text-body-1 font-weight-black">
                <span>Khách phải trả:</span>
                <span class="text-success">{{ formatPrice(subtotal - form.discountAmount) }}</span>
              </div>
            </div>

            <v-row dense>
              <!-- Phương thức thanh toán -->
              <v-col cols="12" sm="6">
                <label class="field-label">Phương thức thanh toán</label>
                <v-select
                  v-model="form.paymentMethod"
                  :items="paymentMethods"
                  variant="outlined"
                  density="comfortable"
                ></v-select>
              </v-col>
              <!-- Giảm giá -->
              <v-col cols="12" sm="6">
                <label class="field-label">Giảm giá (VND)</label>
                <v-text-field
                  v-model.number="form.discountAmount"
                  variant="outlined"
                  density="comfortable"
                  type="number"
                  min="0"
                ></v-text-field>
              </v-col>
            </v-row>

            <!-- Đã thanh toán -->
            <v-checkbox
              v-model="form.isPaid"
              label="Khách đã thanh toán ngay"
              color="success"
              density="compact"
              class="mt-1"
            ></v-checkbox>

            <!-- Ghi chú -->
            <div class="mt-2">
              <label class="field-label">Ghi chú</label>
              <v-textarea
                v-model="form.note"
                variant="outlined"
                density="comfortable"
                rows="2"
                placeholder="Ghi chú thêm về đơn hàng..."
              ></v-textarea>
            </div>
          </v-form>
        </v-card-text>

        <v-card-actions class="pa-6 pt-0 d-flex justify-end gap-3">
          <v-btn variant="outlined" color="slate" @click="closeCreateDialog">Hủy</v-btn>
          <v-btn
            color="success"
            :loading="submitting"
            :disabled="form.items.length === 0"
            @click="submitOrder"
          >
            <v-icon start>mdi-check</v-icon> Xác nhận tạo đơn
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- ===== DIALOG XEM CHI TIẾT ĐƠN HÀNG ===== -->
    <v-dialog v-model="detailDialog" max-width="680">
      <v-card v-if="selectedOrder" rounded="xl">
        <v-card-title class="pa-6 pb-4 border-b d-flex align-center justify-space-between">
          <span class="text-h6 font-weight-bold">Chi tiết đơn hàng — {{ selectedOrder.orderCode }}</span>
          <v-btn icon="mdi-close" variant="text" @click="detailDialog = false"></v-btn>
        </v-card-title>
        <v-card-text class="pa-6">
          <v-row>
            <v-col cols="6">
              <p class="text-caption text-slate-500 mb-1">Khách hàng</p>
              <p class="font-weight-bold">{{ selectedOrder.customerName }}</p>
            </v-col>
            <v-col cols="6">
              <p class="text-caption text-slate-500 mb-2">Trạng thái</p>
              <div class="d-flex align-center gap-2 flex-wrap">
                <v-btn-toggle
                  v-model="editingStatus"
                  mandatory
                  density="compact"
                  color="success"
                  variant="outlined"
                  rounded="lg"
                >
                  <v-btn value="Pending" size="small">Chờ xử lý</v-btn>
                  <v-btn value="Completed" size="small">Đã hoàn thành</v-btn>
                </v-btn-toggle>
                <v-btn
                  v-if="editingStatus !== selectedOrder.status"
                  color="success"
                  size="small"
                  :loading="savingStatus"
                  @click="updateOrderStatus"
                >
                  <v-icon start size="small">mdi-content-save</v-icon> Lưu
                </v-btn>
              </div>
            </v-col>
            <v-col cols="6">
              <p class="text-caption text-slate-500 mb-1">Ngày đặt</p>
              <p>{{ formatDate(selectedOrder.orderDate) }}</p>
            </v-col>
            <v-col cols="6">
              <p class="text-caption text-slate-500 mb-1">Ghi chú</p>
              <p>{{ selectedOrder.note || '—' }}</p>
            </v-col>
          </v-row>

          <v-divider class="my-4"></v-divider>
          <p class="text-subtitle-2 font-weight-bold mb-3">Danh sách sản phẩm</p>
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b">
                <th class="text-left py-2 text-slate-500 font-medium">Sản phẩm</th>
                <th class="text-right py-2 text-slate-500 font-medium">Đơn giá</th>
                <th class="text-right py-2 text-slate-500 font-medium">SL</th>
                <th class="text-right py-2 text-slate-500 font-medium">Thành tiền</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in selectedOrder.items" :key="item.id" class="border-b border-slate-100">
                <td class="py-2">{{ item.productName }}</td>
                <td class="py-2 text-right">{{ formatPrice(item.unitPrice) }}</td>
                <td class="py-2 text-right">{{ item.quantity }}</td>
                <td class="py-2 text-right font-weight-bold">{{ formatPrice(item.lineTotal) }}</td>
              </tr>
            </tbody>
          </table>

          <div class="mt-4 text-right">
            <p class="text-body-2 text-slate-600">Tạm tính: <strong>{{ formatPrice(selectedOrder.subTotal) }}</strong></p>
            <p class="text-body-2 text-slate-600">Giảm giá: <strong class="text-error">- {{ formatPrice(selectedOrder.discountAmount) }}</strong></p>
            <p class="text-h6 font-weight-black text-success mt-1">Tổng: {{ formatPrice(selectedOrder.totalAmount) }}</p>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- ===== DIALOG XÁC NHẬN XÓA ===== -->
    <v-dialog v-model="deleteDialog" max-width="400">
      <v-card rounded="xl" class="pa-2">
        <v-card-title class="pa-4">Xác nhận xóa đơn hàng</v-card-title>
        <v-card-text class="pa-4 pt-0">
          Bạn có chắc muốn xóa đơn <strong>{{ orderToDelete?.orderCode }}</strong> không?
        </v-card-text>
        <v-card-actions class="pa-4 pt-0 justify-end">
          <v-btn variant="text" @click="deleteDialog = false">Hủy</v-btn>
          <v-btn color="error" :loading="deleting" @click="deleteOrder">Xóa</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import api from '@/config/api';

const productCatalog = ref([]);
const loadingProducts = ref(false);

const search = ref('');
const orders = ref([]);
const customers = ref([]);
const loading = ref(false);
const loadingCustomers = ref(false);
const error = ref(null);

const currentPage = ref(1);
const pageSize = ref(10);
const statusFilter = ref('all');
const editingStatus = ref('Pending');
const savingStatus = ref(false);

const statusFilterOptions = [
  { label: 'Tất cả trạng thái', value: 'all' },
  { label: 'Chờ xử lý', value: 'Pending' },
  { label: 'Đang xử lý', value: 'Processing' },
  { label: 'Đã hoàn thành', value: 'Completed' },
  { label: 'Đã thanh toán', value: 'Paid' },
  { label: 'Đã hủy', value: 'Cancelled' },
];

const createDialog = ref(false);
const detailDialog = ref(false);
const deleteDialog = ref(false);
const submitting = ref(false);
const deleting = ref(false);
const selectedOrder = ref(null);
const orderToDelete = ref(null);
const formRef = ref(null);

const paymentMethods = ['Tiền mặt', 'Chuyển khoản', 'Thẻ ngân hàng', 'Ví điện tử'];

const defaultForm = () => ({
  customerId: null,
  discountAmount: 0,
  isPaid: false,
  paymentMethod: 'Tiền mặt',
  note: '',
  items: []
});
const form = ref(defaultForm());

const subtotal = computed(() =>
  form.value.items.reduce((sum, i) => sum + (i.unitPrice || 0) * (i.quantity || 0), 0)
);

const filteredOrders = computed(() => {
  let list = orders.value;
  if (statusFilter.value !== 'all') {
    list = list.filter(o => o.status === statusFilter.value);
  }
  if (search.value) {
    const q = search.value.toLowerCase();
    list = list.filter(o =>
      (o.orderCode || '').toLowerCase().includes(q) ||
      (o.customerName || '').toLowerCase().includes(q)
    );
  }
  return list;
});

const totalOrders = computed(() => filteredOrders.value.length);
const totalPages = computed(() => Math.ceil(totalOrders.value / pageSize.value) || 1);
const paginatedOrders = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  return filteredOrders.value.slice(start, start + pageSize.value);
});

const formatPrice = (price) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price || 0);

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
};

const statusMap = {
  Pending: 'Chờ xử lý',
  Processing: 'Đang xử lý',
  Completed: 'Đã hoàn thành',
  Paid: 'Đã thanh toán',
  Cancelled: 'Đã hủy',
  Canceled: 'Đã hủy',
};

const translateStatus = (status) => statusMap[status] || status || 'Chờ xử lý';

const getStatusBadgeClass = (status) => {
  const base = 'inline-flex items-center text-xs font-bold px-2.5 py-1 rounded-full border ';
  if (status === 'Completed' || status === 'Paid') return base + 'bg-emerald-50 text-emerald-700 border-emerald-200';
  if (status === 'Pending' || status === 'Processing') return base + 'bg-amber-50 text-amber-700 border-amber-200';
  if (status === 'Cancelled' || status === 'Canceled') return base + 'bg-rose-50 text-rose-700 border-rose-200';
  return base + 'bg-slate-50 text-slate-700 border-slate-200';
};

const fetchOrders = async () => {
  loading.value = true;
  error.value = null;
  try {
    const res = await api.get('/api/Orders');
    const data = res.data;
    if (data && typeof data === 'object' && !Array.isArray(data) && data.data) {
      orders.value = data.data;
    } else {
      orders.value = Array.isArray(data) ? data : [];
    }
    currentPage.value = 1;
  } catch (e) {
    error.value = 'Không thể tải danh sách đơn hàng. Vui lòng kiểm tra kết nối backend.';
  } finally {
    loading.value = false;
  }
};

const onPageSizeChange = () => {
  currentPage.value = 1;
};

const fetchCustomers = async () => {
  loadingCustomers.value = true;
  try {
    const [custRes, userRes] = await Promise.allSettled([
      api.get('/api/Customers'),
      api.get('/api/users')
    ]);

    const custList = custRes.status === 'fulfilled'
      ? (Array.isArray(custRes.value.data) ? custRes.value.data : [])
      : [];

    const userList = userRes.status === 'fulfilled'
      ? (Array.isArray(userRes.value.data) ? userRes.value.data : [])
      : [];

    const mappedUsers = userList
      .filter(u => u.role !== 'Admin')
      .map(u => ({
        id: u.id,
        fullName: u.displayName || u.fullName || u.userName || u.email || `User #${u.id}`,
        phone: u.phone || '',
        _source: 'user',
        _userId: u.id
      }));

    const existingIds = new Set(custList.map(c => String(c.id)));
    const extra = mappedUsers.filter(u => !existingIds.has(String(u.id)));
    customers.value = [...custList, ...extra];
  } catch {
    customers.value = [];
  } finally {
    loadingCustomers.value = false;
  }
};

const onProductSelect = (productId, idx) => {
  const product = productCatalog.value.find(p => p.id === productId);
  if (product) {
    form.value.items[idx].productName = product.name;
    form.value.items[idx].unitPrice = product.salePrice || 0;
  }
};

const openCreateDialog = async () => {
  form.value = defaultForm();
  createDialog.value = true;
  if (customers.value.length === 0) fetchCustomers();
  if (productCatalog.value.length === 0) {
    loadingProducts.value = true;
    try {
      const res = await api.get('/api/products', { params: { pageSize: 200 } });
      productCatalog.value = res.data?.data || (Array.isArray(res.data) ? res.data : []);
    } catch {
      productCatalog.value = [];
    } finally {
      loadingProducts.value = false;
    }
  }
};

const closeCreateDialog = () => {
  createDialog.value = false;
  form.value = defaultForm();
};

const addItem = () => {
  form.value.items.push({ productId: 0, productName: '', unitPrice: 0, quantity: 1 });
};

const removeItem = (idx) => {
  form.value.items.splice(idx, 1);
};

const resolveCustomerId = async () => {
  const selected = customers.value.find(c => String(c.id) === String(form.value.customerId));
  if (!selected || selected._source !== 'user') {
    return Number(form.value.customerId);
  }
  try {
    const listRes = await api.get('/api/Customers');
    const existing = (listRes.data || []).find(
      c => c.fullName?.trim().toLowerCase() === selected.fullName?.trim().toLowerCase()
    );
    if (existing) {
      customers.value = customers.value.map(c =>
        String(c.id) === String(form.value.customerId)
          ? { ...c, id: existing.id, _source: undefined }
          : c
      );
      return existing.id;
    }
  } catch { /* tiếp tục tạo mới */ }
  const customerCode = 'KH' + Date.now().toString().slice(-6);
  const createRes = await api.post('/api/Customers', {
    fullName: selected.fullName,
    phone: selected.phone || '0000000000',
    email: selected.email || '',
    customerCode: customerCode
  });
  const newId = createRes.data?.id ?? createRes.data;
  customers.value = customers.value.map(c =>
    String(c.id) === String(form.value.customerId)
      ? { ...c, id: newId, _source: undefined }
      : c
  );
  return newId;
};

const submitOrder = async () => {
  const { valid } = await formRef.value.validate();
  if (!valid || form.value.items.length === 0) return;

  submitting.value = true;
  const orderedItems = [...form.value.items];
  try {
    const resolvedCustomerId = await resolveCustomerId();
    const orderRes = await api.post('/api/Orders', {
      customerId: resolvedCustomerId,
      discountAmount: form.value.discountAmount || 0,
      isPaid: form.value.isPaid,
      paymentMethod: form.value.paymentMethod,
      note: form.value.note,
      items: orderedItems.map(i => ({
        productId: i.productId || 0,
        productName: i.productName,
        unitPrice: i.unitPrice,
        quantity: i.quantity
      }))
    });
    const createdOrder = orderRes.data || {};
    closeCreateDialog();
    await fetchOrders();
    // Bắn sự kiện order-created sang user-report-api qua gateway (fire-and-forget)
    api.post('/api/events/order-created', {
      orderId: createdOrder.id,
      orderCode: createdOrder.orderCode,
      customerId: createdOrder.customerId ?? form.value.customerId,
      customerName: createdOrder.customerName ?? '',
      totalAmount: createdOrder.totalAmount ?? 0,
      discountAmount: createdOrder.discountAmount ?? form.value.discountAmount ?? 0,
      isPaid: createdOrder.isPaid ?? form.value.isPaid,
      paymentMethod: createdOrder.paymentMethod ?? form.value.paymentMethod,
      orderDate: createdOrder.orderDate ?? new Date().toISOString(),
      items: orderedItems.map(i => ({
        productId: i.productId || 0,
        productName: i.productName,
        unitPrice: i.unitPrice,
        quantity: i.quantity,
        lineTotal: (i.unitPrice || 0) * (i.quantity || 0)
      }))
    }).catch(() => {});
    // Cập nhật tồn kho Team 5 (fire-and-forget)
    for (const item of orderedItems) {
      if (item.productId) {
        api.post(`/api/products/${item.productId}/decrease-stock`, { quantity: item.quantity }).catch(() => {});
      }
    }
  } catch (e) {
    error.value = e.response?.data?.message || e.response?.data || 'Tạo đơn hàng thất bại. Vui lòng thử lại.';
  } finally {
    submitting.value = false;
  }
};

const viewOrder = (order) => {
  selectedOrder.value = order;
  editingStatus.value = order.status || 'Pending';
  detailDialog.value = true;
};

const updateOrderStatus = async () => {
  if (!selectedOrder.value) return;
  savingStatus.value = true;
  try {
    await api.put(`/api/Orders/${selectedOrder.value.id}/status`, { status: editingStatus.value });
    const newStatus = editingStatus.value;
    selectedOrder.value = { ...selectedOrder.value, status: newStatus };
    const idx = orders.value.findIndex(o => o.id === selectedOrder.value.id);
    if (idx !== -1) orders.value[idx] = { ...orders.value[idx], status: newStatus };
  } catch (e) {
    error.value = 'Cập nhật trạng thái thất bại. Vui lòng thử lại.';
  } finally {
    savingStatus.value = false;
  }
};

const confirmDelete = (order) => {
  orderToDelete.value = order;
  deleteDialog.value = true;
};

const deleteOrder = async () => {
  deleting.value = true;
  try {
    await api.delete(`/api/Orders/${orderToDelete.value.id}`);
    deleteDialog.value = false;
    await fetchOrders();
  } catch (e) {
    error.value = 'Xóa đơn hàng thất bại.';
    deleteDialog.value = false;
  } finally {
    deleting.value = false;
  }
};

onMounted(() => {
  fetchOrders();
  fetchCustomers();
});
</script>

<style scoped>
.glass-card {
  background: #ffffff !important;
  border: 1px solid #e2e8f0 !important;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.02) !important;
}
.search-input :deep(.v-field) {
  border-radius: 9999px !important;
  background-color: #f8fafc !important;
}
.gap-4 { gap: 16px; }
.gap-3 { gap: 12px; }
.gap-2 { gap: 8px; }
.gap-1 { gap: 4px; }
.field-label {
  display: block;
  font-size: 12px;
  font-weight: 600;
  color: #475569;
  margin-bottom: 6px;
}
.item-row { transition: box-shadow 0.15s; }
.item-row:hover { box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
</style>
