<template>
  <div class="bg-surface-container-lowest rounded-xl border border-outline-variant overflow-hidden flex flex-col">
    <div class="p-md border-b border-outline-variant flex justify-between items-center bg-surface-container-low/50">
      <h4 class="font-title-lg text-title-lg">Sản phẩm bán chạy nhất</h4>
      <button class="text-primary text-label-md font-label-md hover:underline">Xem tất cả</button>
    </div>
    <div class="overflow-x-auto flex-1">
      <table class="w-full text-left">
        <thead class="bg-surface-container-low">
          <tr>
            <th class="px-md py-sm text-label-sm font-label-sm text-on-surface-variant">SẢN PHẨM</th>
            <th class="px-md py-sm text-label-sm font-label-sm text-on-surface-variant text-right">SỐ LƯỢNG</th>
            <th class="px-md py-sm text-label-sm font-label-sm text-on-surface-variant text-right">DOANH THU</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-outline-variant/30">
          <tr v-for="product in reportStore.topProducts" :key="product.productId" class="hover:bg-surface-container-low/50 transition-colors group">
            <td class="px-md py-3 flex items-center gap-3">
              <div class="w-10 h-10 bg-surface-variant rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center text-primary font-bold">
                {{ product.productName ? product.productName.charAt(0).toUpperCase() : 'P' }}
              </div>
              <div>
                <p class="font-label-md text-label-md text-on-surface group-hover:text-primary transition-colors">{{ product.productName }}</p>
              </div>
            </td>
            <td class="px-md py-3 text-right font-data-mono text-data-mono">{{ product.totalQuantitySold }}</td>
            <td class="px-md py-3 text-right font-data-mono text-data-mono text-primary font-bold">{{ formatCurrency(product.totalRevenue) }}</td>
          </tr>
          <tr v-if="!reportStore.topProducts?.length">
            <td colspan="3" class="px-md py-8 text-center text-on-surface-variant text-body-md">Chưa có dữ liệu sản phẩm</td>
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
