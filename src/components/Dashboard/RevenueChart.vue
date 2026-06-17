<template>
  <div class="grid grid-cols-1 lg:grid-cols-3 gap-md">
    <!-- Revenue Trend -->
    <div class="lg:col-span-2 bg-surface-container-lowest p-md rounded-xl border border-outline-variant">
      <div class="flex items-center justify-between mb-md">
        <h4 class="font-title-lg text-title-lg">Xu hướng doanh thu</h4>
        <div class="flex gap-2">
          <span class="flex items-center gap-1 text-label-sm font-label-sm text-on-surface-variant">
            <span class="w-3 h-3 rounded-full bg-primary"></span> Kỳ này
          </span>
        </div>
      </div>
      <div class="h-[300px] w-full">
        <canvas id="revenueChart"></canvas>
      </div>
    </div>
    
    <!-- Top Products Revenue Distribution -->
    <div class="bg-surface-container-lowest p-md rounded-xl border border-outline-variant">
      <h4 class="font-title-lg text-title-lg mb-md">Cơ cấu doanh thu Top 4</h4>
      <div class="h-[240px] relative flex items-center justify-center">
        <!-- Text ở giữa vòng tròn khi trống -->
        <div v-if="!top4Products.length" class="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span class="text-label-sm text-on-surface-variant">Chưa có<br>dữ liệu</span>
        </div>
        <canvas id="categoryChart"></canvas>
      </div>
      <div class="mt-md space-y-2">
        <div v-for="(product, index) in top4Products" :key="product.productId" class="flex justify-between items-center text-body-sm">
          <span class="flex items-center gap-2 truncate max-w-[180px]" :title="product.productName">
            <span class="w-2 h-2 rounded-full flex-shrink-0" :style="{ backgroundColor: chartColors[index] }"></span>
            <span class="truncate">{{ product.productName }}</span>
          </span>
          <span class="font-bold flex-shrink-0 ml-2">{{ formatCurrency(product.totalRevenue) }}</span>
        </div>
        <div v-if="!top4Products.length" class="text-center text-body-sm text-on-surface-variant mt-4">
          Chưa có dữ liệu sản phẩm
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, watch, onMounted, onUnmounted } from 'vue';
import { useReportStore } from '@/stores/report';

const reportStore = useReportStore();
let revenueChartInstance = null;
let categoryChartInstance = null;

const chartColors = ['#2563eb', '#6366f1', '#38bdf8', '#cbd5e1'];

const top4Products = computed(() => {
  if (!reportStore.topProducts) return [];
  return reportStore.topProducts.slice(0, 4);
});

const formatCurrency = (val) => {
  if (!val) return '0';
  if (val >= 1000000000) return (val / 1000000000).toFixed(1) + 'B';
  if (val >= 1000000) return (val / 1000000).toFixed(1) + 'M';
  if (val >= 1000) return (val / 1000).toFixed(1) + 'K';
  return val.toLocaleString('vi-VN');
};

const renderCharts = () => {
  if (!window.Chart) return;
  
  // Render Revenue Chart
  const ctxRevenue = document.getElementById('revenueChart');
  if (ctxRevenue) {
    if (revenueChartInstance) revenueChartInstance.destroy();
    
    const labels = reportStore.dailyRevenues.map(r => new Date(r.date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }));
    const data = reportStore.dailyRevenues.map(r => r.totalRevenue);

    revenueChartInstance = new window.Chart(ctxRevenue.getContext('2d'), {
      type: 'line',
      data: {
        labels: labels.length ? labels : ['Chưa có dữ liệu'],
        datasets: [{
          label: 'Doanh thu',
          data: data.length ? data : [0],
          borderColor: '#2563eb',
          backgroundColor: 'rgba(37, 99, 235, 0.05)',
          tension: 0.4,
          fill: true,
          borderWidth: 3,
          pointRadius: 4,
          pointBackgroundColor: '#2563eb'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: function(context) {
                let label = context.dataset.label || '';
                if (label) label += ': ';
                if (context.parsed.y !== null) {
                  label += new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(context.parsed.y);
                }
                return label;
              }
            }
          }
        },
        scales: {
          y: { beginAtZero: true, grid: { borderDash: [2, 2], color: '#eceef3' } },
          x: { grid: { display: false } }
        }
      }
    });
  }

  // Render Top 4 Products Chart (Doughnut)
  const ctxCategory = document.getElementById('categoryChart');
  if (ctxCategory) {
    if (categoryChartInstance) categoryChartInstance.destroy();
    
    const labels = top4Products.value.map(p => p.productName);
    const data = top4Products.value.map(p => p.totalRevenue);

    categoryChartInstance = new window.Chart(ctxCategory.getContext('2d'), {
      type: 'doughnut',
      data: {
        labels: labels.length ? labels : ['Chưa có dữ liệu'],
        datasets: [{
          data: data.length ? data : [1],
          backgroundColor: data.length ? chartColors.slice(0, data.length) : ['#e2e8f0'],
          borderWidth: 0,
          cutout: '80%'
        }]
      },
      options: { 
        responsive: true, 
        maintainAspectRatio: false, 
        plugins: { 
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: function(context) {
                let label = context.dataset.label || '';
                if (label) label += ': ';
                if (context.parsed !== null && top4Products.value.length > 0) {
                  label += new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(context.parsed);
                }
                return label;
              }
            }
          }
        } 
      }
    });
  }
};

watch([() => reportStore.dailyRevenues, () => reportStore.topProducts], () => {
  renderCharts();
}, { deep: true });

onMounted(() => {
  renderCharts();
});

onUnmounted(() => {
  if (revenueChartInstance) revenueChartInstance.destroy();
  if (categoryChartInstance) categoryChartInstance.destroy();
});
</script>
