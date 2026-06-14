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
          class="rounded-xl px-6 py-3 font-weight-bold shadow-md shadow-primary/10 hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-0.5 active:scale-95 transition-all text-white"
          elevation="0"
        >
          Tạo đơn bán hàng
        </v-btn>
      </v-col>
    </v-row>

    <!-- Error Alert -->
    <v-alert
      v-if="orderStore.error"
      type="error"
      variant="tonal"
      class="mb-6 rounded-xl"
      closable
    >
      {{ orderStore.error }}
    </v-alert>

    <!-- Content Card -->
    <v-card class="glass-card mb-6" rounded="xl" elevation="0">
      <div class="pa-6 border-b border-slate-200 d-flex align-center justify-space-between flex-wrap gap-4">
        <div class="w-full sm:max-w-md">
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
          ></v-text-field>
        </div>
        <div class="d-flex gap-2">
          <v-btn variant="outlined" color="slate-650" size="small" class="rounded-lg text-slate-700 border-slate-200 hover:bg-slate-50">
            <v-icon start>mdi-filter-variant</v-icon> Bộ lọc
          </v-btn>
          <v-btn variant="outlined" color="slate-650" size="small" class="rounded-lg text-slate-700 border-slate-200 hover:bg-slate-50" @click="orderStore.fetchOrders(1)">
            <v-icon start>mdi-refresh</v-icon> Làm mới
          </v-btn>
        </div>
      </div>

      <!-- Loading State -->
      <v-progress-linear
        v-if="orderStore.loading"
        indeterminate
        color="success"
      ></v-progress-linear>

      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse text-slate-700">
          <thead>
            <tr class="bg-slate-50 border-b border-slate-200">
              <th class="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Mã đơn</th>
              <th class="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Khách hàng</th>
              <th class="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Tổng thanh toán</th>
              <th class="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Chiết khấu</th>
              <th class="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Trạng thái</th>
              <th class="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Ngày tạo</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr
              v-for="order in filteredOrders"
              :key="order.id"
              class="hover:bg-slate-50/50 transition-colors duration-150 group"
            >
              <td class="px-6 py-4">
                <span class="font-mono font-bold text-success group-hover:underline cursor-pointer">
                  {{ order.code }}
                </span>
              </td>
              <td class="px-6 py-4 font-semibold text-slate-900">{{ order.customer }}</td>
              <td class="px-6 py-4 font-semibold text-slate-900">{{ formatPrice(order.total) }}</td>
              <td class="px-6 py-4 text-slate-600">{{ formatPrice(order.discount) }}</td>
              <td class="px-6 py-4">
                <span :class="getStatusBadgeClass(order.status)">
                  {{ order.status }}
                </span>
              </td>
              <td class="px-6 py-4 text-sm text-slate-550">{{ order.createdAt }}</td>
            </tr>
            <tr v-if="filteredOrders.length === 0 && !orderStore.loading">
              <td colspan="6" class="text-center py-8 text-slate-500">
                Không tìm thấy đơn hàng nào khớp với tìm kiếm hoặc danh sách trống
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </v-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useOrderStore } from '../../stores/order';

const orderStore = useOrderStore();
const search = ref('');

const formatPrice = (price) => {
  if (!price) return '0 ₫';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
};

// Map các trạng thái từ API (Pending, Confirmed, Shipping, Completed, Cancelled)
const getStatusLabel = (status) => {
  switch (status) {
    case 'Pending':
      return 'Chờ xử lý';
    case 'Confirmed':
      return 'Đã xác nhận';
    case 'Shipping':
      return 'Đang giao hàng';
    case 'Completed':
      return 'Đã thanh toán';
    case 'Cancelled':
      return 'Đã hủy';
    default:
      return status || 'Chờ xử lý';
  }
};

const getStatusBadgeClass = (status) => {
  const base = 'inline-flex items-center text-xs font-bold px-2.5 py-1 rounded-full border ';
  switch (status) {
    case 'Đã thanh toán':
    case 'Completed':
      return base + 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'Chờ xử lý':
    case 'Pending':
    case 'Confirmed':
    case 'Shipping':
      return base + 'bg-amber-50 text-amber-700 border-amber-200';
    case 'Đã hủy':
    case 'Cancelled':
      return base + 'bg-rose-50 text-rose-700 border-rose-200';
    default:
      return base + 'bg-slate-50 text-slate-700 border-slate-200';
  }
};

// Chuyển đổi dữ liệu từ API DTO sang các trường giao diện hiển thị
const mappedOrders = computed(() => {
  return orderStore.orders.map(o => ({
    id: o.id,
    code: o.orderCode || `DH-${o.id}`,
    customer: o.customerName || 'Khách vãng lai',
    total: o.finalAmount || o.totalAmount || 0,
    discount: o.discount || 0,
    status: getStatusLabel(o.status),
    createdAt: o.createdAt ? new Date(o.createdAt).toLocaleString('vi-VN') : '-'
  }));
});

const filteredOrders = computed(() => {
  if (!search.value) return mappedOrders.value;
  const q = search.value.toLowerCase();
  return mappedOrders.value.filter(o => 
    o.code.toLowerCase().includes(q) || 
    o.customer.toLowerCase().includes(q)
  );
});

onMounted(async () => {
  await orderStore.fetchOrders(1);
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
.gap-4 {
  gap: 16px;
}
</style>
