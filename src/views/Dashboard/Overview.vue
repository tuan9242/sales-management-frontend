<template>
  <div class="max-w-[1600px] mx-auto space-y-md">
    <!-- Page Header -->
    <div class="flex items-end justify-between py-sm">
      <div>
        <h2 class="font-headline-md text-headline-md text-on-surface">Tổng quan hệ thống</h2>
        <p class="font-body-sm text-body-sm text-on-surface-variant">Dữ liệu cập nhật mới nhất: 14:30 Hôm nay</p>
      </div>
      <div class="flex gap-sm">
        <button class="flex items-center gap-2 bg-surface-container-lowest border border-outline-variant px-4 py-2 rounded-lg text-label-md font-label-md hover:bg-surface-container-low transition-colors">
          <span class="material-symbols-outlined" data-icon="calendar_today">calendar_today</span>
          30 ngày qua
        </button>
        <button class="flex items-center gap-2 bg-primary text-on-primary px-4 py-2 rounded-lg text-label-md font-label-md hover:bg-primary/90 transition-colors">
          <span class="material-symbols-outlined" data-icon="download">download</span>
          Xuất báo cáo
        </button>
      </div>
    </div>

    <!-- Key Metrics Bento Grid -->
    <StatCards />

    <!-- Main Chart & Category Distribution -->
    <RevenueChart />

    <!-- Best Sellers & Top Customers -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-md">
      <!-- Top 10 Best Selling -->
      <TopProducts />
      
      <!-- Top Customers -->
      <TopCustomers />
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useReportStore } from '@/stores/report';

import StatCards from '@/components/Dashboard/StatCards.vue';
import RevenueChart from '@/components/Dashboard/RevenueChart.vue';
import TopProducts from '@/components/Dashboard/TopProducts.vue';
import TopCustomers from '@/components/Dashboard/TopCustomers.vue';

const reportStore = useReportStore();

const endDate = new Date();
const startDate = new Date();
startDate.setDate(endDate.getDate() - 30); // Lấy 30 ngày gần nhất

onMounted(async () => {
  // Fetch real data from Backend once for all child components
  await Promise.all([
    reportStore.fetchDailyRevenue(startDate, endDate),
    reportStore.fetchTopProducts(10),
    reportStore.fetchTopCustomers(10)
  ]);
});
</script>

<style scoped>
</style>
