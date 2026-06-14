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
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-md">
      <!-- Card 1 -->
      <div class="bg-surface-container-lowest p-md rounded-xl border border-outline-variant flex flex-col justify-between">
        <div class="flex justify-between items-start">
          <span class="p-2 bg-blue-50 text-blue-600 rounded-lg material-symbols-outlined" data-icon="payments">payments</span>
          <span class="text-label-sm font-label-sm text-green-600 bg-green-50 px-2 py-0.5 rounded-full">+12.5%</span>
        </div>
        <div class="mt-md">
          <p class="text-label-md font-label-md text-on-surface-variant">Doanh thu hôm nay</p>
          <h3 class="text-headline-md font-headline-md font-bold mt-1">42.5M <span class="text-body-sm font-normal text-on-surface-variant">VND</span></h3>
        </div>
      </div>
      <!-- Card 2 -->
      <div class="bg-surface-container-lowest p-md rounded-xl border border-outline-variant flex flex-col justify-between">
        <div class="flex justify-between items-start">
          <span class="p-2 bg-indigo-50 text-indigo-600 rounded-lg material-symbols-outlined" data-icon="trending_up">trending_up</span>
          <span class="text-label-sm font-label-sm text-green-600 bg-green-50 px-2 py-0.5 rounded-full">+8.2%</span>
        </div>
        <div class="mt-md">
          <p class="text-label-md font-label-md text-on-surface-variant">Doanh thu tháng</p>
          <h3 class="text-headline-md font-headline-md font-bold mt-1">1.28B <span class="text-body-sm font-normal text-on-surface-variant">VND</span></h3>
        </div>
      </div>
      <!-- Card 3 -->
      <div class="bg-surface-container-lowest p-md rounded-xl border border-outline-variant flex flex-col justify-between">
        <div class="flex justify-between items-start">
          <span class="p-2 bg-emerald-50 text-emerald-600 rounded-lg material-symbols-outlined" data-icon="shopping_cart">shopping_cart</span>
          <span class="text-label-sm font-label-sm text-red-600 bg-red-50 px-2 py-0.5 rounded-full">-2.4%</span>
        </div>
        <div class="mt-md">
          <p class="text-label-md font-label-md text-on-surface-variant">Tổng đơn hàng</p>
          <h3 class="text-headline-md font-headline-md font-bold mt-1">856 <span class="text-body-sm font-normal text-on-surface-variant">Đơn</span></h3>
        </div>
      </div>
      <!-- Card 4 -->
      <div class="bg-surface-container-lowest p-md rounded-xl border border-outline-variant flex flex-col justify-between">
        <div class="flex justify-between items-start">
          <span class="p-2 bg-amber-50 text-amber-600 rounded-lg material-symbols-outlined" data-icon="person">person</span>
          <span class="text-label-sm font-label-sm text-green-600 bg-green-50 px-2 py-0.5 rounded-full">+18%</span>
        </div>
        <div class="mt-md">
          <p class="text-label-md font-label-md text-on-surface-variant">Người dùng hoạt động</p>
          <h3 class="text-headline-md font-headline-md font-bold mt-1">124 <span class="text-body-sm font-normal text-on-surface-variant">User</span></h3>
        </div>
      </div>
    </div>

    <!-- Main Chart & Category Distribution -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-md">
      <!-- Revenue Trend -->
      <div class="lg:col-span-2 bg-surface-container-lowest p-md rounded-xl border border-outline-variant">
        <div class="flex items-center justify-between mb-md">
          <h4 class="font-title-lg text-title-lg">Xu hướng doanh thu</h4>
          <div class="flex gap-2">
            <span class="flex items-center gap-1 text-label-sm font-label-sm text-on-surface-variant">
              <span class="w-3 h-3 rounded-full bg-primary"></span> Tháng này
            </span>
            <span class="flex items-center gap-1 text-label-sm font-label-sm text-on-surface-variant">
              <span class="w-3 h-3 rounded-full bg-tertiary-fixed-dim"></span> Tháng trước
            </span>
          </div>
        </div>
        <div class="h-[300px] w-full">
          <canvas id="revenueChart"></canvas>
        </div>
      </div>
      <!-- Category Distribution -->
      <div class="bg-surface-container-lowest p-md rounded-xl border border-outline-variant">
        <h4 class="font-title-lg text-title-lg mb-md">Cơ cấu ngành hàng</h4>
        <div class="h-[240px] relative flex items-center justify-center">
          <canvas id="categoryChart"></canvas>
        </div>
        <div class="mt-md space-y-2">
          <div class="flex justify-between items-center text-body-sm">
            <span class="flex items-center gap-2"><span class="w-2 h-2 rounded-full bg-primary"></span> Điện tử</span>
            <span class="font-bold">45%</span>
          </div>
          <div class="flex justify-between items-center text-body-sm">
            <span class="flex items-center gap-2"><span class="w-2 h-2 rounded-full bg-secondary"></span> Gia dụng</span>
            <span class="font-bold">25%</span>
          </div>
          <div class="flex justify-between items-center text-body-sm">
            <span class="flex items-center gap-2"><span class="w-2 h-2 rounded-full bg-tertiary-fixed-dim"></span> Thời trang</span>
            <span class="font-bold">20%</span>
          </div>
          <div class="flex justify-between items-center text-body-sm">
            <span class="flex items-center gap-2"><span class="w-2 h-2 rounded-full bg-outline-variant"></span> Khác</span>
            <span class="font-bold">10%</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Best Sellers & Top Customers -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-md">
      <!-- Top 10 Best Selling -->
      <div class="bg-surface-container-lowest rounded-xl border border-outline-variant overflow-hidden">
        <div class="p-md border-b border-outline-variant flex justify-between items-center bg-surface-container-low/50">
          <h4 class="font-title-lg text-title-lg">Sản phẩm bán chạy nhất</h4>
          <button class="text-primary text-label-md font-label-md hover:underline">Xem tất cả</button>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left">
            <thead class="bg-surface-container-low">
              <tr>
                <th class="px-md py-sm text-label-sm font-label-sm text-on-surface-variant">SẢN PHẨM</th>
                <th class="px-md py-sm text-label-sm font-label-sm text-on-surface-variant text-right">SỐ LƯỢNG</th>
                <th class="px-md py-sm text-label-sm font-label-sm text-on-surface-variant text-right">DOANH THU</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-outline-variant/30">
              <tr class="hover:bg-surface-container-low/50 transition-colors group">
                <td class="px-md py-3 flex items-center gap-3">
                  <div class="w-10 h-10 bg-surface-variant rounded-lg overflow-hidden flex-shrink-0">
                    <img class="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDHqCmVflBCXtCMKf7gyV8YQ1t90I4UvIncfgPWeK0REu9v9mBRi97qYo-DVMT2yNkOZMEpdOjbFaemGl8lmQjGCtPGKeRHi2scZbUvB9zJS6X0POj3bqKBYvP7Rx_EaI0lXvjWAlMzjrVLR-UeL9WW_Fb93PTJoVgpJ5Cii3dYZD8h1OUOncmWQAhzKg8q0GT9rOSC8LjWV-z4FaMTBmJH3DIg1i9ASt0XVnz17Iic6q3CgE1eyCPOhbBxfLs_AKw-O0J1yWVO3Rg"/>
                  </div>
                  <div>
                    <p class="font-label-md text-label-md text-on-surface group-hover:text-primary transition-colors">Laptop MacBook Pro M2</p>
                    <p class="text-xs text-on-surface-variant">Electronics</p>
                  </div>
                </td>
                <td class="px-md py-3 text-right font-data-mono text-data-mono">142</td>
                <td class="px-md py-3 text-right font-data-mono text-data-mono text-primary font-bold">580.4M</td>
              </tr>
              <tr class="hover:bg-surface-container-low/50 transition-colors group">
                <td class="px-md py-3 flex items-center gap-3">
                  <div class="w-10 h-10 bg-surface-variant rounded-lg overflow-hidden flex-shrink-0">
                    <img class="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAnR5v2yWzzZBBxjpql7CLngS3h1-HHViIHqm4fYRPHveyQRmbvWanGwukG1Ge3rGhFK3g22RcY1PONOik2qocqRP3YECeGWIiG4sBM2FoJ3XfSd5Ib25UP7y4_F8wHHb60CcJwRhysKB9cNldPllTirhIt3zRILVk_1v9A0SGCclxgJFsf3mdoRhBHnC2y64pNa4Toq035r0q_J0R-XTzJt2j7vmTl4mgM9g-z4r1wARe6uZ8vIl4N9rZ5hcl9WXDjPLO7E81vR7g"/>
                  </div>
                  <div>
                    <p class="font-label-md text-label-md text-on-surface group-hover:text-primary transition-colors">iPhone 14 Pro Max</p>
                    <p class="text-xs text-on-surface-variant">Electronics</p>
                  </div>
                </td>
                <td class="px-md py-3 text-right font-data-mono text-data-mono">98</td>
                <td class="px-md py-3 text-right font-data-mono text-data-mono text-primary font-bold">342.1M</td>
              </tr>
              <tr class="hover:bg-surface-container-low/50 transition-colors group">
                <td class="px-md py-3 flex items-center gap-3">
                  <div class="w-10 h-10 bg-surface-variant rounded-lg overflow-hidden flex-shrink-0">
                    <img class="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDwhrmpnpR7nfufftmuhz9yliqWwSsWGyw_hY3JObxJQkOwzBkuj4hrekYHgsn9gYwUlW5HC6eP1T28hhSy6mNKhgfrzTq1FawgYbGkGhJHCpE8d4eEYOEWiGfj79dACuZEgGEhLBgyXU788STee11AstM0Kbh78dcTea0ekYZFB7iZz8NqsYkKCNkx0V38cY2FSHWcef40G9hbPLFW756ijImdo_-s-E4rZkqx0cb4vLLkc1y9aJthCQpZ1uu8Q_YKSSFFbnElr0w"/>
                  </div>
                  <div>
                    <p class="font-label-md text-label-md text-on-surface group-hover:text-primary transition-colors">Monitor LG UltraWide</p>
                    <p class="text-xs text-on-surface-variant">Electronics</p>
                  </div>
                </td>
                <td class="px-md py-3 text-right font-data-mono text-data-mono">75</td>
                <td class="px-md py-3 text-right font-data-mono text-data-mono text-primary font-bold">112.8M</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <!-- Top Customers -->
      <div class="bg-surface-container-lowest rounded-xl border border-outline-variant overflow-hidden">
        <div class="p-md border-b border-outline-variant flex justify-between items-center bg-surface-container-low/50">
          <h4 class="font-title-lg text-title-lg">Khách hàng tiêu biểu</h4>
          <button class="text-primary text-label-md font-label-md hover:underline">Chi tiết</button>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left">
            <thead class="bg-surface-container-low">
              <tr>
                <th class="px-md py-sm text-label-sm font-label-sm text-on-surface-variant">KHÁCH HÀNG</th>
                <th class="px-md py-sm text-label-sm font-label-sm text-on-surface-variant text-right">ĐƠN HÀNG</th>
                <th class="px-md py-sm text-label-sm font-label-sm text-on-surface-variant text-right">TỔNG CHI</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-outline-variant/30">
              <tr class="hover:bg-surface-container-low/50 transition-colors">
                <td class="px-md py-3 flex items-center gap-3">
                  <div class="w-8 h-8 rounded-full bg-primary-fixed-dim text-primary flex items-center justify-center font-bold text-xs">
                    TA
                  </div>
                  <div>
                    <p class="font-label-md text-label-md text-on-surface">Nguyễn Tuấn Anh</p>
                    <p class="text-xs text-on-surface-variant">Hà Nội, VN</p>
                  </div>
                </td>
                <td class="px-md py-3 text-right font-data-mono text-data-mono">24</td>
                <td class="px-md py-3 text-right font-data-mono text-data-mono font-bold">125.6M</td>
              </tr>
              <tr class="hover:bg-surface-container-low/50 transition-colors">
                <td class="px-md py-3 flex items-center gap-3">
                  <div class="w-8 h-8 rounded-full bg-secondary-fixed-dim text-secondary flex items-center justify-center font-bold text-xs">
                    LH
                  </div>
                  <div>
                    <p class="font-label-md text-label-md text-on-surface">Trần Thị Lan Hương</p>
                    <p class="text-xs text-on-surface-variant">TP. Hồ Chí Minh, VN</p>
                  </div>
                </td>
                <td class="px-md py-3 text-right font-data-mono text-data-mono">18</td>
                <td class="px-md py-3 text-right font-data-mono text-data-mono font-bold">98.2M</td>
              </tr>
              <tr class="hover:bg-surface-container-low/50 transition-colors">
                <td class="px-md py-3 flex items-center gap-3">
                  <div class="w-8 h-8 rounded-full bg-tertiary-fixed-dim text-tertiary flex items-center justify-center font-bold text-xs">
                    MD
                  </div>
                  <div>
                    <p class="font-label-md text-label-md text-on-surface">Phạm Minh Đức</p>
                    <p class="text-xs text-on-surface-variant">Đà Nẵng, VN</p>
                  </div>
                </td>
                <td class="px-md py-3 text-right font-data-mono text-data-mono">15</td>
                <td class="px-md py-3 text-right font-data-mono text-data-mono font-bold">76.4M</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';

onMounted(() => {
  if (window.Chart) {
    // Revenue Chart Configuration
    const ctxRevenue = document.getElementById('revenueChart').getContext('2d');
    new window.Chart(ctxRevenue, {
      type: 'line',
      data: {
        labels: ['01/10', '05/10', '10/10', '15/10', '20/10', '25/10', '30/10'],
        datasets: [{
          label: 'Tháng này',
          data: [400, 520, 480, 650, 590, 800, 856],
          borderColor: '#2563eb',
          backgroundColor: 'rgba(37, 99, 235, 0.05)',
          tension: 0.4,
          fill: true,
          borderWidth: 3,
          pointRadius: 4,
          pointBackgroundColor: '#2563eb'
        }, {
          label: 'Tháng trước',
          data: [350, 410, 430, 400, 490, 520, 580],
          borderColor: '#6366f1',
          borderDash: [5, 5],
          tension: 0.4,
          fill: false,
          borderWidth: 2,
          pointRadius: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: { borderDash: [2, 2], color: '#eceef3' }
          },
          x: {
            grid: { display: false }
          }
        }
      }
    });

    // Category Chart Configuration
    const ctxCategory = document.getElementById('categoryChart').getContext('2d');
    new window.Chart(ctxCategory, {
      type: 'doughnut',
      data: {
        labels: ['Điện tử', 'Gia dụng', 'Thời trang', 'Khác'],
        datasets: [{
          data: [45, 25, 20, 10],
          backgroundColor: ['#2563eb', '#6366f1', '#38bdf8', '#cbd5e1'],
          borderWidth: 0,
          cutout: '75%'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        }
      }
    });
  }
});
</script>

<style scoped>
</style>
