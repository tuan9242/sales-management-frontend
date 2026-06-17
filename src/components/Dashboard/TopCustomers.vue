<template>
  <div class="bg-surface-container-lowest rounded-xl border border-outline-variant overflow-hidden flex flex-col">
    <div class="p-md border-b border-outline-variant flex justify-between items-center bg-surface-container-low/50">
      <h4 class="font-title-lg text-title-lg">Khách hàng tiêu biểu</h4>
      <button class="text-primary text-label-md font-label-md hover:underline">Chi tiết</button>
    </div>
    <div class="overflow-x-auto flex-1">
      <table class="w-full text-left">
        <thead class="bg-surface-container-low">
          <tr>
            <th class="px-md py-sm text-label-sm font-label-sm text-on-surface-variant">KHÁCH HÀNG</th>
            <th class="px-md py-sm text-label-sm font-label-sm text-on-surface-variant text-right">ĐƠN HÀNG</th>
            <th class="px-md py-sm text-label-sm font-label-sm text-on-surface-variant text-right">TỔNG CHI</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-outline-variant/30">
          <tr v-for="customer in reportStore.topCustomers" :key="customer.customerId" class="hover:bg-surface-container-low/50 transition-colors">
            <td class="px-md py-3 flex items-center gap-3">
              <div class="w-8 h-8 rounded-full bg-primary-fixed-dim text-primary flex items-center justify-center font-bold text-xs uppercase">
                {{ customer.customerName ? customer.customerName.substring(0, 2) : 'C' }}
              </div>
              <div>
                <p class="font-label-md text-label-md text-on-surface">{{ customer.customerName }}</p>
              </div>
            </td>
            <td class="px-md py-3 text-right font-data-mono text-data-mono">{{ customer.totalOrders }}</td>
            <td class="px-md py-3 text-right font-data-mono text-data-mono font-bold">{{ formatCurrency(customer.totalSpent) }}</td>
          </tr>
          <tr v-if="!reportStore.topCustomers?.length">
            <td colspan="3" class="px-md py-8 text-center text-on-surface-variant text-body-md">Chưa có dữ liệu khách hàng</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { useReportStore } from '@/stores/report';

const reportStore = useReportStore();

const formatCurrency = (val) => {
  if (!val) return '0';
  if (val >= 1000000000) return (val / 1000000000).toFixed(1) + 'B';
  if (val >= 1000000) return (val / 1000000).toFixed(1) + 'M';
  if (val >= 1000) return (val / 1000).toFixed(1) + 'K';
  return val.toLocaleString('vi-VN');
};
</script>
