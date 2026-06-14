<template>
  <div>
    <v-row class="mb-6">
      <v-col cols="12" class="d-flex justify-space-between align-center flex-wrap gap-4">
        <div>
          <h1 class="text-h4 font-weight-black text-slate-900 tracking-tight flex items-center gap-2">
            <v-icon color="success" size="large">mdi-cart-outline</v-icon>
            Quản lý Đơn hàng & Bán lẻ
          </h1>
          <p class="text-subtitle-1 text-slate-600 mt-1">Lập hóa đơn bán lẻ, quản lý trạng thái giao dịch và công nợ khách hàng (Phân hệ Nhóm 4)</p>
        </div>
        <v-btn
          color="success"
          prepend-icon="mdi-cart-plus"
          class="rounded-xl px-6 py-3 font-weight-bold shadow-md shadow-success/10 hover:shadow-lg hover:shadow-success/20 hover:-translate-y-0.5 active:scale-95 transition-all text-white"
          elevation="0"
        >
          Tạo đơn bán hàng
        </v-btn>
      </v-col>
    </v-row>

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
            color="success"
            rounded="xl"
            class="search-input"
          ></v-text-field>
        </div>
        <div class="d-flex gap-2">
          <v-btn variant="outlined" color="slate-650" size="small" class="rounded-lg text-slate-700 border-slate-200 hover:bg-slate-50">
            <v-icon start>mdi-filter-variant</v-icon> Bộ lọc
          </v-btn>
          <v-btn variant="outlined" color="slate-650" size="small" class="rounded-lg text-slate-700 border-slate-200 hover:bg-slate-50">
            <v-icon start>mdi-download</v-icon> Xuất Excel
          </v-btn>
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse text-slate-700">
          <thead>
            <tr class="bg-slate-50 border-b border-slate-200">
              <th class="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Mã đơn</th>
              <th class="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Khách hàng</th>
              <th class="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Số lượng SP</th>
              <th class="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Tổng thanh toán</th>
              <th class="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Phương thức</th>
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
              <td class="px-6 py-4">
                <span class="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs font-semibold">
                  {{ order.itemsCount }} sản phẩm
                </span>
              </td>
              <td class="px-6 py-4 font-semibold text-slate-900">{{ formatPrice(order.total) }}</td>
              <td class="px-6 py-4">
                <span class="text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100 px-2.5 py-0.5 rounded-full">
                  {{ order.paymentMethod }}
                </span>
              </td>
              <td class="px-6 py-4">
                <span :class="getStatusBadgeClass(order.status)">
                  {{ order.status }}
                </span>
              </td>
              <td class="px-6 py-4 text-sm text-slate-550">{{ order.createdAt }}</td>
            </tr>
            <tr v-if="filteredOrders.length === 0">
              <td colspan="7" class="text-center py-8 text-slate-500">
                Không tìm thấy đơn hàng nào khớp với tìm kiếm
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </v-card>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const search = ref('');

const formatPrice = (price) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
};

const getStatusBadgeClass = (status) => {
  const base = 'inline-flex items-center text-xs font-bold px-2.5 py-1 rounded-full border ';
  switch (status) {
    case 'Đã thanh toán':
      return base + 'bg-emerald-50 text-emerald-700 border-emerald-250';
    case 'Chờ xử lý':
      return base + 'bg-amber-50 text-amber-700 border-amber-250';
    case 'Đã hủy':
      return base + 'bg-rose-50 text-rose-700 border-rose-250';
    default:
      return base + 'bg-slate-50 text-slate-750 border-slate-250';
  }
};

const orders = ref([
  { id: 1, code: 'HD-1002', customer: 'Vũ Minh H', itemsCount: 3, total: 320000, paymentMethod: 'Chuyển khoản', status: 'Đã thanh toán', createdAt: '2026-06-06 14:23' },
  { id: 2, code: 'HD-1003', customer: 'Lê Kim L', itemsCount: 1, total: 75000, paymentMethod: 'Tiền mặt', status: 'Đã thanh toán', createdAt: '2026-06-06 16:05' },
  { id: 3, code: 'HD-1004', customer: 'Phan Anh T', itemsCount: 5, total: 1450000, paymentMethod: 'Chuyển khoản', status: 'Chờ xử lý', createdAt: '2026-06-07 09:12' },
  { id: 4, code: 'HD-1005', customer: 'Nguyễn Bích N', itemsCount: 2, total: 210000, paymentMethod: 'Tiền mặt', status: 'Đã hủy', createdAt: '2026-06-07 11:30' },
]);

const filteredOrders = computed(() => {
  if (!search.value) return orders.value;
  const q = search.value.toLowerCase();
  return orders.value.filter(o => 
    o.code.toLowerCase().includes(q) || 
    o.customer.toLowerCase().includes(q)
  );
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
