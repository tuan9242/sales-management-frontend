<template>
  <div>
    <v-row class="mb-6">
      <v-col cols="12" class="d-flex justify-space-between align-center flex-wrap gap-4">
        <div>
          <h1 class="text-h4 font-weight-black text-white">Quản lý Đơn hàng & Bán lẻ</h1>
          <p class="text-subtitle-1 text-medium-emphasis">Lập hóa đơn bán lẻ, quản lý trạng thái giao dịch và công nợ khách hàng (Phân hệ Nhóm 4)</p>
        </div>
        <v-btn color="success" prepend-icon="mdi-cart-plus" rounded="lg">Tạo đơn bán hàng</v-btn>
      </v-col>
    </v-row>

    <!-- Content Card -->
    <v-card class="glass-card pa-6" rounded="xl">
      <v-row class="mb-4">
        <v-col cols="12" sm="6" md="4">
          <v-text-field
            v-model="search"
            prepend-inner-icon="mdi-magnify"
            label="Tìm kiếm theo mã đơn hoặc khách hàng..."
            variant="outlined"
            density="compact"
            hide-details
            color="success"
            rounded="lg"
          ></v-text-field>
        </v-col>
      </v-row>

      <v-table theme="dark" class="bg-transparent text-white">
        <thead>
          <tr>
            <th class="text-left font-weight-bold">Mã đơn</th>
            <th class="text-left font-weight-bold">Khách hàng</th>
            <th class="text-left font-weight-bold">Số lượng SP</th>
            <th class="text-left font-weight-bold">Tổng thanh toán</th>
            <th class="text-left font-weight-bold">Phương thức</th>
            <th class="text-left font-weight-bold">Trạng thái</th>
            <th class="text-left font-weight-bold">Ngày tạo</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="order in orders" :key="order.id">
            <td><span class="font-weight-bold text-success">{{ order.code }}</span></td>
            <td>{{ order.customer }}</td>
            <td>{{ order.itemsCount }}</td>
            <td class="font-weight-bold">{{ formatPrice(order.total) }}</td>
            <td>
              <v-chip size="x-small" color="info" variant="outlined">{{ order.paymentMethod }}</v-chip>
            </td>
            <td>
              <v-chip :color="getStatusColor(order.status)" size="small" class="text-white font-weight-bold">
                {{ order.status }}
              </v-chip>
            </td>
            <td>{{ order.createdAt }}</td>
          </tr>
        </tbody>
      </v-table>
    </v-card>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const search = ref('');

const formatPrice = (price) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
};

const getStatusColor = (status) => {
  switch (status) {
    case 'Đã thanh toán': return 'success';
    case 'Chờ xử lý': return 'warning';
    case 'Đã hủy': return 'error';
    default: return 'medium-emphasis';
  }
};

const orders = ref([
  { id: 1, code: 'HD-1002', customer: 'Vũ Minh H', itemsCount: 3, total: 320000, paymentMethod: 'Chuyển khoản', status: 'Đã thanh toán', createdAt: '2026-06-06 14:23' },
  { id: 2, code: 'HD-1003', customer: 'Lê Kim L', itemsCount: 1, total: 75000, paymentMethod: 'Tiền mặt', status: 'Đã thanh toán', createdAt: '2026-06-06 16:05' },
  { id: 3, code: 'HD-1004', customer: 'Phan Anh T', itemsCount: 5, total: 1450000, paymentMethod: 'Chuyển khoản', status: 'Chờ xử lý', createdAt: '2026-06-07 09:12' },
  { id: 4, code: 'HD-1005', customer: 'Nguyễn Bích N', itemsCount: 2, total: 210000, paymentMethod: 'Tiền mặt', status: 'Đã hủy', createdAt: '2026-06-07 11:30' },
]);
</script>

<style scoped>
.glass-card {
  background: rgba(30, 41, 59, 0.6) !important;
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.08);
}
.gap-4 {
  gap: 16px;
}
</style>
