<template>
  <div>
    <v-row class="mb-6">
      <v-col cols="12" class="d-flex justify-space-between align-center flex-wrap gap-4">
        <div>
          <h1 class="text-h4 font-weight-black text-white">Quản lý Sản phẩm & Kho hàng</h1>
          <p class="text-subtitle-1 text-medium-emphasis">CRUD sản phẩm, phân loại danh mục, lập phiếu nhập kho (Phân hệ Nhóm 5)</p>
        </div>
        <v-btn color="primary" prepend-icon="mdi-plus" rounded="lg" elevation="3">Thêm sản phẩm mới</v-btn>
      </v-col>
    </v-row>

    <!-- Tab Section -->
    <v-card class="glass-card mb-6" rounded="xl">
      <v-tabs v-model="tab" color="primary" bg-color="transparent" class="px-4 border-bottom border-opacity-10">
        <v-tab value="products" class="font-weight-bold">
          <v-icon start>mdi-package-variant-closed</v-icon>
          Sản phẩm
        </v-tab>
        <v-tab value="categories" class="font-weight-bold">
          <v-icon start>mdi-file-tree-outline</v-icon>
          Danh mục
        </v-tab>
        <v-tab value="stock" class="font-weight-bold">
          <v-icon start>mdi-warehouse</v-icon>
          Nhập kho & Tồn kho
        </v-tab>
      </v-tabs>

      <v-window v-model="tab" class="pa-6">
        <!-- Products Tab -->
        <v-window-item value="products">
          <v-row class="mb-4">
            <v-col cols="12" sm="6" md="4">
              <v-text-field
                v-model="searchProduct"
                prepend-inner-icon="mdi-magnify"
                label="Tìm kiếm sản phẩm..."
                variant="outlined"
                density="compact"
                hide-details
                color="primary"
                rounded="lg"
              ></v-text-field>
            </v-col>
          </v-row>

          <v-table theme="dark" class="bg-transparent text-white">
            <thead>
              <tr>
                <th class="text-left font-weight-bold">Mã sản phẩm</th>
                <th class="text-left font-weight-bold">Tên sản phẩm</th>
                <th class="text-left font-weight-bold">Danh mục</th>
                <th class="text-left font-weight-bold">Giá nhập</th>
                <th class="text-left font-weight-bold">Giá bán</th>
                <th class="text-left font-weight-bold">Tồn kho</th>
                <th class="text-left font-weight-bold">Hành động</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="product in products" :key="product.id">
                <td><v-chip color="secondary" size="small" variant="tonal" class="font-weight-bold">{{ product.code }}</v-chip></td>
                <td>{{ product.name }}</td>
                <td>{{ product.category }}</td>
                <td>{{ formatPrice(product.importPrice) }}</td>
                <td class="text-success font-weight-bold">{{ formatPrice(product.salePrice) }}</td>
                <td>
                  <v-chip :color="product.stock > product.minStock ? 'success' : 'warning'" size="small">
                    {{ product.stock }} / {{ product.minStock }}
                  </v-chip>
                </td>
                <td>
                  <v-btn icon size="x-small" color="info" variant="text" class="me-2"><v-icon>mdi-pencil-outline</v-icon></v-btn>
                  <v-btn icon size="x-small" color="error" variant="text"><v-icon>mdi-trash-can-outline</v-icon></v-btn>
                </td>
              </tr>
            </tbody>
          </v-table>
        </v-window-item>

        <!-- Categories Tab -->
        <v-window-item value="categories">
          <v-table theme="dark" class="bg-transparent text-white">
            <thead>
              <tr>
                <th class="text-left font-weight-bold">ID</th>
                <th class="text-left font-weight-bold">Tên danh mục</th>
                <th class="text-left font-weight-bold">Mô tả</th>
                <th class="text-left font-weight-bold">Danh mục cha</th>
                <th class="text-left font-weight-bold">Hành động</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="cat in categories" :key="cat.id">
                <td>{{ cat.id }}</td>
                <td class="font-weight-bold">{{ cat.name }}</td>
                <td>{{ cat.description }}</td>
                <td>
                  <v-chip v-if="cat.parent" size="small" variant="outlined">{{ cat.parent }}</v-chip>
                  <span v-else class="text-medium-emphasis text-caption">Không có</span>
                </td>
                <td>
                  <v-btn icon size="x-small" color="info" variant="text" class="me-2"><v-icon>mdi-pencil-outline</v-icon></v-btn>
                  <v-btn icon size="x-small" color="error" variant="text"><v-icon>mdi-trash-can-outline</v-icon></v-btn>
                </td>
              </tr>
            </tbody>
          </v-table>
        </v-window-item>

        <!-- Stock Tab -->
        <v-window-item value="stock">
          <div class="d-flex justify-space-between align-center mb-6">
            <h3 class="text-h6 font-weight-bold text-white">Danh sách Phiếu nhập kho (Stock Receipts)</h3>
            <v-btn color="success" prepend-icon="mdi-playlist-plus" rounded="lg">Tạo phiếu nhập mới</v-btn>
          </div>
          <v-table theme="dark" class="bg-transparent text-white">
            <thead>
              <tr>
                <th class="text-left font-weight-bold">Mã phiếu</th>
                <th class="text-left font-weight-bold">Nhà cung cấp</th>
                <th class="text-left font-weight-bold">Tổng tiền</th>
                <th class="text-left font-weight-bold">Người tạo</th>
                <th class="text-left font-weight-bold">Trạng thái</th>
                <th class="text-left font-weight-bold">Ngày lập</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="receipt in receipts" :key="receipt.id">
                <td><span class="font-weight-bold text-gradient">{{ receipt.code }}</span></td>
                <td>{{ receipt.supplier }}</td>
                <td>{{ formatPrice(receipt.total) }}</td>
                <td>{{ receipt.createdBy }}</td>
                <td>
                  <v-chip :color="receipt.status === 'Confirmed' ? 'success' : 'warning'" size="small">
                    {{ receipt.status === 'Confirmed' ? 'Đã duyệt' : 'Bản nháp' }}
                  </v-chip>
                </td>
                <td>{{ receipt.date }}</td>
              </tr>
            </tbody>
          </v-table>
        </v-window-item>
      </v-window>
    </v-card>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const tab = ref('products');
const searchProduct = ref('');

const formatPrice = (price) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
};

const products = ref([
  { id: 1, code: 'SP-001', name: 'Nước xả vải Comfort 1.8L', category: 'Hóa mỹ phẩm', importPrice: 85000, salePrice: 110000, stock: 45, minStock: 10 },
  { id: 2, code: 'SP-002', name: 'Gạo tẻ ST25 5kg', category: 'Lương thực', importPrice: 120000, salePrice: 160000, stock: 8, minStock: 15 },
  { id: 3, code: 'SP-003', name: 'Mì ăn liền Hảo Hảo Tôm chua cay', category: 'Thực phẩm khô', importPrice: 130000, salePrice: 150000, stock: 120, minStock: 20 },
  { id: 4, code: 'SP-004', name: 'Dầu gội đầu Clear 650g', category: 'Hóa mỹ phẩm', importPrice: 115000, salePrice: 145000, stock: 4, minStock: 8 },
]);

const categories = ref([
  { id: 1, name: 'Thực phẩm khô', description: 'Gia vị, mì gói, bánh kẹo và các đồ khô bảo quản dài hạn', parent: null },
  { id: 2, name: 'Hóa mỹ phẩm', description: 'Bột giặt, nước xả, dầu gội, sữa tắm', parent: null },
  { id: 3, name: 'Lương thực', description: 'Gạo tẻ, gạo nếp, ngô khoai sắn', parent: 'Thực phẩm khô' },
]);

const receipts = ref([
  { id: 1, code: 'PN-0001', supplier: 'Công ty Cổ phần TH Milk', total: 12500000, createdBy: 'Thủ kho A', status: 'Confirmed', date: '2026-06-05' },
  { id: 2, code: 'PN-0002', supplier: 'Tổng kho gia dụng miền Bắc', total: 4500000, createdBy: 'Thủ kho A', status: 'Draft', date: '2026-06-07' },
]);
</script>

<style scoped>
.glass-card {
  background: rgba(30, 41, 59, 0.6) !important;
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.08);
}
.text-gradient {
  background: linear-gradient(135deg, var(--v-theme-primary) 0%, var(--v-theme-secondary) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
.border-bottom {
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}
.gap-4 {
  gap: 16px;
}
</style>
