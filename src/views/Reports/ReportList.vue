<template>
  <div class="h-full flex flex-col gap-lg print:p-0">
    <!-- Header: Không in ra khi xuất PDF -->
    <section class="flex flex-col md:flex-row md:items-center justify-between gap-md print:hidden">
      <div>
        <h2 class="font-headline-md text-headline-md text-on-surface">Báo cáo Doanh thu &amp; Thống kê</h2>
        <p class="font-body-sm text-body-sm text-on-surface-variant mt-1">Phân tích chi tiết hiệu suất kinh doanh trong khoảng thời gian xác định.</p>
      </div>
      <div class="flex items-center gap-sm">
        <button @click="exportToPDF" class="flex items-center gap-2 px-4 py-2 border border-primary text-primary font-label-md text-label-md rounded-lg hover:bg-primary/5 transition-all">
          <span class="material-symbols-outlined text-[20px]">picture_as_pdf</span>
          Xuất PDF
        </button>
        <button @click="exportToExcel" class="flex items-center gap-2 px-4 py-2 bg-primary text-on-primary font-label-md text-label-md rounded-lg hover:bg-primary-container transition-all">
          <span class="material-symbols-outlined text-[20px]">table_view</span>
          Xuất Excel
        </button>
      </div>
    </section>

    <!-- Header riêng cho bản in PDF -->
    <div class="hidden print:block mb-6 text-center">
      <h1 class="text-2xl font-bold">BÁO CÁO DOANH THU INVENTORYPRO</h1>
      <p class="text-gray-600">Từ ngày {{ formatDate(startDate) }} đến ngày {{ formatDate(endDate) }}</p>
    </div>

    <!-- Filters Bento Grid -->
    <section class="grid grid-cols-1 md:grid-cols-12 gap-md bg-surface-container-lowest p-md rounded-xl border border-outline-variant print:hidden">
      <div class="md:col-span-5 flex flex-col gap-1">
        <label class="text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider">Khoảng thời gian</label>
        <div class="flex items-center gap-2">
          <input v-model="startDate" type="date" class="flex-1 p-2 bg-surface-container-low border border-outline-variant rounded-lg text-body-sm focus:ring-primary focus:border-primary"/>
          <span class="text-outline">→</span>
          <input v-model="endDate" type="date" class="flex-1 p-2 bg-surface-container-low border border-outline-variant rounded-lg text-body-sm focus:ring-primary focus:border-primary"/>
        </div>
      </div>
      <div class="md:col-span-5 flex flex-col gap-1">
        <label class="text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider">Chi nhánh/Nhân viên</label>
        <select class="w-full p-2 bg-surface-container-low border border-outline-variant rounded-lg text-body-sm focus:ring-primary focus:border-primary appearance-none">
          <option>Tất cả</option>
        </select>
      </div>
      <div class="md:col-span-2 flex items-end">
        <button @click="loadData" class="w-full h-10 flex items-center justify-center bg-primary text-on-primary rounded-lg hover:bg-primary-container transition-all disabled:opacity-50" :disabled="reportStore.loading">
          <span v-if="reportStore.loading" class="material-symbols-outlined animate-spin mr-1">autorenew</span>
          <span v-else class="material-symbols-outlined mr-1">filter_list</span>
          Lọc
        </button>
      </div>
    </section>

    <div v-if="reportStore.error" class="p-4 bg-error-container text-on-error-container rounded-lg">
      {{ reportStore.error }}
    </div>

    <!-- KPI Cards -->
    <section class="grid grid-cols-1 md:grid-cols-4 gap-md print:grid-cols-4">
      <div class="bg-surface-container-lowest p-md rounded-xl border border-outline-variant flex flex-col gap-2 shadow-sm">
        <span class="text-label-sm font-label-sm text-on-surface-variant">Tổng Doanh Thu</span>
        <div class="flex items-end justify-between">
          <span class="text-headline-sm font-headline-sm text-on-surface font-data-mono">{{ formatCurrency(totalRevenue) }}</span>
        </div>
      </div>
      <div class="bg-surface-container-lowest p-md rounded-xl border border-outline-variant flex flex-col gap-2 shadow-sm">
        <span class="text-label-sm font-label-sm text-on-surface-variant">Doanh Thu TB / Ngày</span>
        <div class="flex items-end justify-between">
          <span class="text-headline-sm font-headline-sm text-on-surface font-data-mono">{{ formatCurrency(avgRevenuePerDay) }}</span>
        </div>
      </div>
      <div class="bg-surface-container-lowest p-md rounded-xl border border-outline-variant flex flex-col gap-2 shadow-sm">
        <span class="text-label-sm font-label-sm text-on-surface-variant">Số Đơn Hàng</span>
        <div class="flex items-end justify-between">
          <span class="text-headline-sm font-headline-sm text-on-surface font-data-mono">{{ totalOrders.toLocaleString('vi-VN') }}</span>
        </div>
      </div>
      <div class="bg-surface-container-lowest p-md rounded-xl border border-outline-variant flex flex-col gap-2 shadow-sm">
        <span class="text-label-sm font-label-sm text-on-surface-variant">Giá Trị Đơn Trung Bình</span>
        <div class="flex items-end justify-between">
          <span class="text-headline-sm font-headline-sm text-on-surface font-data-mono">{{ formatCurrency(avgOrderValue) }}</span>
        </div>
      </div>
    </section>

    <!-- Main Visualization: Daily Revenue Chart -->
    <section class="bg-surface-container-lowest p-lg rounded-xl border border-outline-variant shadow-sm overflow-hidden relative print:break-inside-avoid">
      <div class="flex items-center justify-between mb-lg">
        <h3 class="font-title-lg text-title-lg text-on-surface">Biểu đồ Doanh thu Hàng ngày</h3>
      </div>
      <div class="relative h-[300px] w-full">
        <canvas id="revenueChart"></canvas>
      </div>
    </section>

    <!-- Data Table -->
    <section class="bg-surface-container-lowest rounded-xl border border-outline-variant overflow-hidden shadow-sm flex-grow flex flex-col print:shadow-none print:border-none">
      <div class="p-md border-b border-outline-variant flex items-center justify-between">
        <h3 class="font-title-lg text-title-lg text-on-surface">Bảng Dữ liệu Tổng hợp theo Ngày</h3>
      </div>
      <div class="overflow-x-auto flex-grow">
        <table class="w-full text-left border-collapse">
          <thead class="bg-surface-container-low sticky top-0">
            <tr>
              <th class="p-md font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider border-b border-outline-variant">Ngày</th>
              <th class="p-md font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider text-right border-b border-outline-variant">Số đơn hàng</th>
              <th class="p-md font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider text-right border-b border-outline-variant">Doanh thu</th>
              <th class="p-md font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider text-right border-b border-outline-variant">Đơn giá TB</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-outline-variant">
            <tr v-if="reportStore.dailyRevenues.length === 0" class="interactive-row">
              <td colspan="4" class="p-md text-center text-on-surface-variant">Không có dữ liệu trong khoảng thời gian này.</td>
            </tr>
            <tr v-for="item in sortedRevenues" :key="item.date" class="interactive-row transition-colors hover:bg-surface-container-low">
              <td class="p-md font-body-sm text-body-sm text-on-surface">{{ formatDate(item.date) }}</td>
              <td class="p-md font-data-mono text-data-mono text-on-surface text-right">{{ item.totalOrders.toLocaleString('vi-VN') }}</td>
              <td class="p-md font-data-mono text-data-mono text-primary font-bold text-right">{{ formatCurrency(item.totalRevenue) }}</td>
              <td class="p-md font-data-mono text-data-mono text-on-surface-variant text-right">{{ formatCurrency(item.totalOrders > 0 ? item.totalRevenue / item.totalOrders : 0) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useReportStore } from '../../stores/report';

const reportStore = useReportStore();

// Date range logic (Default: Last 7 days)
const getPastDate = (days) => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().split('T')[0];
};

const startDate = ref(getPastDate(6));
const endDate = ref(getPastDate(0));

// KPIs
const totalRevenue = computed(() => {
  return reportStore.dailyRevenues.reduce((sum, item) => sum + item.totalRevenue, 0);
});

const totalOrders = computed(() => {
  return reportStore.dailyRevenues.reduce((sum, item) => sum + item.totalOrders, 0);
});

const avgOrderValue = computed(() => {
  if (totalOrders.value === 0) return 0;
  return totalRevenue.value / totalOrders.value;
});

const avgRevenuePerDay = computed(() => {
  const count = reportStore.dailyRevenues.length;
  if (count === 0) return 0;
  return totalRevenue.value / count;
});

// Sort for table: Descending (newest first)
const sortedRevenues = computed(() => {
  return [...reportStore.dailyRevenues].sort((a, b) => new Date(b.date) - new Date(a.date));
});

// Formatters
const formatCurrency = (value) => {
  if (value === undefined || value === null) return '0 ₫';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
};

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('vi-VN');
};

// Chart.js Integration
let chartInstance = null;

const renderChart = () => {
  const ctx = document.getElementById('revenueChart');
  if (!ctx) return;
  
  if (chartInstance) {
    chartInstance.destroy();
  }

  // Nếu Chart chưa được load từ CDN, đợi một chút
  if (typeof Chart === 'undefined') {
    setTimeout(renderChart, 500);
    return;
  }

  const labels = reportStore.dailyRevenues.map(r => formatDate(r.date));
  const data = reportStore.dailyRevenues.map(r => r.totalRevenue);

  chartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Doanh thu (VNĐ)',
        data: data,
        backgroundColor: '#00236f', // primary color
        borderRadius: 4,
        maxBarThickness: 40
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
              return formatCurrency(context.raw);
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function(value) {
              if (value >= 1000000) return (value / 1000000) + ' Tr';
              if (value >= 1000) return (value / 1000) + ' K';
              return value;
            }
          }
        }
      }
    }
  });
};

const loadData = async () => {
  await reportStore.fetchDailyRevenue(new Date(startDate.value), new Date(endDate.value));
  renderChart();
};

onMounted(() => {
  loadData();
});

// --- Exports ---

const exportToPDF = () => {
  window.print();
};

const exportToExcel = () => {
  if (reportStore.dailyRevenues.length === 0) {
    alert('Không có dữ liệu để xuất!');
    return;
  }

  // Create CSV Content
  let csvContent = '\uFEFF'; // BOM for UTF-8
  csvContent += 'Ngày,Số đơn hàng,Doanh thu,Đơn giá TB\n';

  sortedRevenues.value.forEach(item => {
    const date = formatDate(item.date);
    const orders = item.totalOrders;
    const rev = item.totalRevenue;
    const avg = orders > 0 ? rev / orders : 0;
    
    // Add row (ensure no commas inside the numbers/strings or wrap in quotes)
    csvContent += `"${date}","${orders}","${rev}","${avg}"\n`;
  });

  // Create Download Link
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `Bao_Cao_Doanh_Thu_${startDate.value}_${endDate.value}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
</script>

<style>
/* Print Styles for PDF Export */
@media print {
  body {
    background-color: white !important;
  }
  .print\:hidden {
    display: none !important;
  }
  .print\:block {
    display: block !important;
  }
  .print\:p-0 {
    padding: 0 !important;
  }
  .print\:border-none {
    border: none !important;
  }
  .print\:shadow-none {
    box-shadow: none !important;
  }
  .print\:grid-cols-4 {
    grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
  }
  
  /* Fix Chart size printing */
  canvas {
    min-height: 100%;
    max-width: 100%;
    max-height: 100%;
    height: auto !important;
    width: auto !important;
  }
  
  #revenueChart {
    height: 300px !important; 
    width: 100% !important;
  }
  
  @page {
    size: A4 landscape;
    margin: 1cm;
  }
}
</style>
