<template>
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-md">
    <!-- Card 1 -->
    <div class="bg-surface-container-lowest p-md rounded-xl border border-outline-variant flex flex-col justify-between">
      <div class="flex justify-between items-start">
        <span class="p-2 bg-blue-50 text-blue-600 rounded-lg material-symbols-outlined" data-icon="payments">payments</span>
      </div>
      <div class="mt-md">
        <p class="text-label-md font-label-md text-on-surface-variant">Doanh thu hôm nay</p>
        <h3 class="text-headline-md font-headline-md font-bold mt-1">{{ formatCurrency(todayRevenue) }} <span class="text-body-sm font-normal text-on-surface-variant">VND</span></h3>
      </div>
    </div>
    <!-- Card 2 -->
    <div class="bg-surface-container-lowest p-md rounded-xl border border-outline-variant flex flex-col justify-between">
      <div class="flex justify-between items-start">
        <span class="p-2 bg-indigo-50 text-indigo-600 rounded-lg material-symbols-outlined" data-icon="trending_up">trending_up</span>
      </div>
      <div class="mt-md">
        <p class="text-label-md font-label-md text-on-surface-variant">Doanh thu kỳ này</p>
        <h3 class="text-headline-md font-headline-md font-bold mt-1">{{ formatCurrency(monthRevenue) }} <span class="text-body-sm font-normal text-on-surface-variant">VND</span></h3>
      </div>
    </div>
    <!-- Card 3 -->
    <div class="bg-surface-container-lowest p-md rounded-xl border border-outline-variant flex flex-col justify-between">
      <div class="flex justify-between items-start">
        <span class="p-2 bg-emerald-50 text-emerald-600 rounded-lg material-symbols-outlined" data-icon="shopping_cart">shopping_cart</span>
      </div>
      <div class="mt-md">
        <p class="text-label-md font-label-md text-on-surface-variant">Tổng đơn hàng</p>
        <h3 class="text-headline-md font-headline-md font-bold mt-1">{{ totalOrders }} <span class="text-body-sm font-normal text-on-surface-variant">Đơn</span></h3>
      </div>
    </div>
    <!-- Card 4 -->
    <div class="bg-surface-container-lowest p-md rounded-xl border border-outline-variant flex flex-col justify-between">
      <div class="flex justify-between items-start">
        <span class="p-2 bg-amber-50 text-amber-600 rounded-lg material-symbols-outlined" data-icon="person">person</span>
      </div>
      <div class="mt-md">
        <p class="text-label-md font-label-md text-on-surface-variant">Khách hàng hoạt động</p>
        <h3 class="text-headline-md font-headline-md font-bold mt-1">{{ activeUsers }} <span class="text-body-sm font-normal text-on-surface-variant">Khách</span></h3>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useReportStore } from '@/stores/report';

const reportStore = useReportStore();

const formatCurrency = (val) => {
  if (!val) return '0';
  if (val >= 1000000000) return (val / 1000000000).toFixed(1) + 'B';
  if (val >= 1000000) return (val / 1000000).toFixed(1) + 'M';
  if (val >= 1000) return (val / 1000).toFixed(1) + 'K';
  return val.toLocaleString('vi-VN');
};

const todayRevenue = computed(() => {
  if (!reportStore.dailyRevenues || reportStore.dailyRevenues.length === 0) return 0;
  return reportStore.dailyRevenues[reportStore.dailyRevenues.length - 1].totalRevenue;
});

const monthRevenue = computed(() => {
  if (!reportStore.dailyRevenues) return 0;
  return reportStore.dailyRevenues.reduce((sum, item) => sum + item.totalRevenue, 0);
});

const totalOrders = computed(() => {
  if (!reportStore.dailyRevenues) return 0;
  return reportStore.dailyRevenues.reduce((sum, item) => sum + item.totalOrders, 0);
});

const activeUsers = computed(() => {
  return reportStore.topCustomers ? reportStore.topCustomers.length : 0;
});
</script>
