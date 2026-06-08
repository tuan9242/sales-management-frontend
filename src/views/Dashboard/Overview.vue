<template>
  <div>
    <v-row class="mb-6">
      <v-col cols="12">
        <h1 class="text-h4 font-weight-black text-white">Tổng quan hệ thống</h1>
        <p class="text-subtitle-1 text-medium-emphasis">Dữ liệu phân tích và doanh thu thời gian thực (Tính năng Nhóm 6)</p>
      </v-col>
    </v-row>

    <!-- Stat Cards -->
    <v-row>
      <v-col cols="12" sm="6" lg="3" v-for="stat in stats" :key="stat.title">
        <v-card class="mx-auto pa-4 glass-card overflow-hidden" elevation="4" rounded="xl">
          <div class="d-flex justify-space-between align-center">
            <div>
              <span class="text-subtitle-2 text-medium-emphasis">{{ stat.title }}</span>
              <h3 class="text-h4 font-weight-black text-white mt-2">{{ stat.value }}</h3>
            </div>
            <v-avatar :color="stat.color" variant="tonal" size="56" rounded="lg">
              <v-icon size="28">{{ stat.icon }}</v-icon>
            </v-avatar>
          </div>
          <div class="mt-4 d-flex align-center">
            <v-icon :color="stat.trendColor" size="18" class="me-1">
              {{ stat.trendUp ? 'mdi-trending-up' : 'mdi-trending-down' }}
            </v-icon>
            <span :class="`text-caption font-weight-bold text-${stat.trendColor}`">{{ stat.trendText }}</span>
            <span class="text-caption text-medium-emphasis ms-2">so với tháng trước</span>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Recent Sales & Stock Alerts -->
    <v-row class="mt-6">
      <v-col cols="12" md="8">
        <v-card class="glass-card pa-6" rounded="xl">
          <div class="d-flex justify-space-between align-center mb-6">
            <h3 class="text-h6 font-weight-bold text-white">Đơn hàng mới nhất</h3>
            <v-chip color="success" size="small" variant="outlined">Bán hàng (Nhóm 4)</v-chip>
          </div>
          <v-table theme="dark" class="bg-transparent text-white">
            <thead>
              <tr>
                <th class="text-left font-weight-bold">Mã đơn</th>
                <th class="text-left font-weight-bold">Khách hàng</th>
                <th class="text-left font-weight-bold">Tổng tiền</th>
                <th class="text-left font-weight-bold">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="order in recentOrders" :key="order.id">
                <td>{{ order.code }}</td>
                <td>{{ order.customer }}</td>
                <td>{{ order.total }}</td>
                <td>
                  <v-chip :color="order.color" size="x-small" class="font-weight-bold text-white">{{ order.status }}</v-chip>
                </td>
              </tr>
            </tbody>
          </v-table>
        </v-card>
      </v-col>

      <v-col cols="12" md="4">
        <v-card class="glass-card pa-6" rounded="xl">
          <div class="d-flex justify-space-between align-center mb-6">
            <h3 class="text-h6 font-weight-bold text-white">Cảnh báo tồn kho</h3>
            <v-chip color="primary" size="small" variant="outlined">Kho hàng (Nhóm 5)</v-chip>
          </div>
          <v-list class="bg-transparent" theme="dark">
            <v-list-item v-for="item in stockAlerts" :key="item.id" class="px-0 py-2">
              <template v-slot:prepend>
                <v-icon color="warning" size="24" class="me-3">mdi-alert-circle-outline</v-icon>
              </template>
              <v-list-item-title class="font-weight-bold text-white">{{ item.name }}</v-list-item-title>
              <v-list-item-subtitle class="text-caption text-medium-emphasis">Còn lại: {{ item.stock }} | Ngưỡng tối thiểu: {{ item.min }}</v-list-item-subtitle>
              <template v-slot:append>
                <v-btn size="x-small" color="primary" variant="outlined" rounded="lg" to="/products">Nhập hàng</v-btn>
              </template>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const stats = ref([
  { title: 'Doanh thu tháng này', value: '154.200.000đ', icon: 'mdi-currency-usd', color: 'success', trendUp: true, trendColor: 'success', trendText: '+12%' },
  { title: 'Đơn hàng mới', value: '1,248 đơn', icon: 'mdi-cart-outline', color: 'info', trendUp: true, trendColor: 'success', trendText: '+8.5%' },
  { title: 'Số sản phẩm hoạt động', value: '450 SP', icon: 'mdi-package-variant-closed', color: 'primary', trendUp: true, trendColor: 'success', trendText: '+2.4%' },
  { title: 'Tồn kho cảnh báo', value: '12 mặt hàng', icon: 'mdi-alert-circle-outline', color: 'warning', trendUp: false, trendColor: 'error', trendText: '-4%' },
]);

const recentOrders = ref([
  { id: 1, code: 'DH-0098', customer: 'Nguyễn Văn A', total: '1,200,000đ', status: 'Hoàn thành', color: 'success' },
  { id: 2, code: 'DH-0099', customer: 'Trần Thị B', total: '450,000đ', status: 'Đang xử lý', color: 'warning' },
  { id: 3, code: 'DH-0100', customer: 'Lê Văn C', total: '3,500,000đ', status: 'Đã hủy', color: 'error' },
  { id: 4, code: 'DH-0101', customer: 'Phạm Minh D', total: '850,000đ', status: 'Hoàn thành', color: 'success' },
]);

const stockAlerts = ref([
  { id: 1, name: 'Sữa tươi TH True Milk 1L', stock: 5, min: 10 },
  { id: 2, name: 'Bột giặt Omo Matic 3kg', stock: 2, min: 5 },
  { id: 3, name: 'Dầu ăn Simply 2L', stock: 8, min: 15 },
]);
</script>

<style scoped>
.glass-card {
  background: rgba(30, 41, 59, 0.6) !important;
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.08);
}
</style>
