<template>
  <div>
    <v-row class="mb-6">
      <v-col cols="12">
        <div>
          <h1 class="text-h4 font-weight-black text-slate-900">Quản lý Sản phẩm & Kho hàng</h1>
          <p class="text-subtitle-1 text-slate-600">CRUD sản phẩm, phân loại danh mục, lập phiếu nhập kho (Phân hệ Nhóm 5)</p>
        </div>
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
          <v-row class="mb-6 align-center">
            <v-col cols="12" sm="6" md="4">
              <v-text-field
                v-model="searchProduct"
                prepend-inner-icon="mdi-magnify"
                label="Tìm kiếm sản phẩm..."
                variant="outlined"
                density="compact"
                hide-details
                color="primary"
                rounded="xl"
              ></v-text-field>
            </v-col>
            <v-spacer></v-spacer>
            <v-col cols="auto" v-if="authStore.hasRole(['Admin', 'Warehouse'])">
              <v-btn
                color="primary"
                prepend-icon="mdi-plus"
                class="rounded-xl shadow-md px-6 py-2 transition-all hover:-translate-y-[1px] hover:shadow-lg active:scale-98"
                elevation="2"
                @click="openCreateDialog"
              >
                Thêm sản phẩm mới
              </v-btn>
            </v-col>
          </v-row>
 
          <div class="overflow-x-auto rounded-xl border border-slate-200 bg-white">
            <table class="w-full text-left border-collapse text-slate-700">
              <thead>
                <tr>
                  <th class="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-left border-b border-slate-200">Mã SP</th>
                  <th class="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-left border-b border-slate-200">Ảnh</th>
                  <th class="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-left border-b border-slate-200">Tên sản phẩm</th>
                  <th class="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-left border-b border-slate-200">Danh mục</th>
                  <th class="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-left border-b border-slate-200">Giá nhập</th>
                  <th class="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-left border-b border-slate-200">Giá bán</th>
                  <th class="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-left border-b border-slate-200">Tồn kho / Ngưỡng</th>
                  <th class="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-left border-b border-slate-200">Trạng thái</th>
                  <th class="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-left border-b border-slate-200" v-if="authStore.hasRole(['Admin', 'Warehouse'])">Thao tác</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 bg-white">
                <tr v-if="productStore.loading">
                  <td colspan="8" class="text-center py-8">
                    <v-progress-circular indeterminate color="primary"></v-progress-circular>
                  </td>
                </tr>
                <tr v-else-if="productStore.products.length === 0">
                  <td colspan="8" class="text-center py-8 text-slate-400">
                    Không tìm thấy sản phẩm nào
                  </td>
                </tr>
                <tr v-else v-for="product in productStore.products" :key="product.id" class="hover:bg-slate-50/50 transition-colors duration-150">
                  <td class="px-6 py-4">
                    <span class="text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100 px-2.5 py-1 rounded-md font-mono">
                      {{ product.code }}
                    </span>
                  </td>
                  <td class="px-6 py-4">
                    <v-avatar rounded size="40" color="grey-lighten-3">
                      <v-img v-if="product.imageUrl" :src="getImageUrl(product.imageUrl)" cover></v-img>
                      <v-icon v-else color="grey">mdi-image-outline</v-icon>
                    </v-avatar>
                  </td>
                  <td class="px-6 py-4 font-semibold text-slate-900">{{ product.name }}</td>
                  <td class="px-6 py-4 text-slate-600">{{ product.categoryName || 'Chưa phân loại' }}</td>
                  <td class="px-6 py-4 text-slate-600">{{ formatPrice(product.importPrice) }}</td>
                  <td class="px-6 py-4 font-semibold text-emerald-600">{{ formatPrice(product.salePrice) }}</td>
                  <td class="px-6 py-4">
                    <span :class="product.quantityInStock >= product.minStockThreshold ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'" class="inline-flex items-center text-xs font-bold px-2.5 py-0.5 rounded-full border">
                      {{ product.quantityInStock }} / {{ product.minStockThreshold }}
                    </span>
                  </td>
                  <td class="px-6 py-4">
                    <span class="px-3 py-1 rounded-full text-xs font-bold"
                          :class="product.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'">
                      {{ product.isActive ? 'Đang bán' : 'Ngừng bán' }}
                    </span>
                  </td>
                  <td class="px-6 py-4" v-if="authStore.hasRole(['Admin', 'Warehouse'])">
                    <v-menu>
                      <template v-slot:activator="{ props }">
                        <v-btn icon size="x-small" variant="text" color="primary" v-bind="props" class="hover:bg-slate-100">
                          <v-icon>mdi-dots-vertical</v-icon>
                        </v-btn>
                      </template>
                      <v-list class="rounded-xl" density="compact">
                        <v-list-item @click="openDetailsDialog(product.id)" class="hover:bg-slate-100">
                          <template v-slot:prepend>
                            <v-icon color="info" size="small">mdi-eye-outline</v-icon>
                          </template>
                          <v-list-item-title class="text-sm">Xem chi tiết</v-list-item-title>
                        </v-list-item>
                        <v-list-item @click="openEditDialog(product)" class="hover:bg-slate-100">
                          <template v-slot:prepend>
                            <v-icon color="primary" size="small">mdi-pencil-outline</v-icon>
                          </template>
                          <v-list-item-title class="text-sm">Sửa sản phẩm</v-list-item-title>
                        </v-list-item>
                        <v-divider class="my-1" v-if="authStore.hasRole('Admin')"></v-divider>
                        <v-list-item v-if="authStore.hasRole('Admin')" @click="toggleProductStatus(product.id, product.isActive)" class="hover:bg-slate-100">
                          <template v-slot:prepend>
                            <v-icon :color="product.isActive ? 'warning' : 'success'" size="small">{{ product.isActive ? 'mdi-pause-circle-outline' : 'mdi-play-circle-outline' }}</v-icon>
                          </template>
                          <v-list-item-title class="text-sm">{{ product.isActive ? 'Ngừng bán' : 'Khôi phục' }}</v-list-item-title>
                        </v-list-item>
                        <v-list-item v-if="authStore.hasRole('Admin')" @click="handleDelete(product.id)" class="hover:bg-red-50">
                          <template v-slot:prepend>
                            <v-icon color="error" size="small">mdi-trash-can-outline</v-icon>
                          </template>
                          <v-list-item-title class="text-sm text-error">Xóa sản phẩm</v-list-item-title>
                        </v-list-item>
                      </v-list>
                    </v-menu>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div class="mt-4 d-flex justify-center" v-if="productStore.totalPages > 1">
            <v-pagination
              v-model="productStore.currentPage"
              :length="productStore.totalPages"
              color="primary"
              @update:modelValue="(val) => productStore.fetchProducts(val, searchProduct)"
              rounded="circle"
            ></v-pagination>
          </div>
        </v-window-item>

        <!-- Categories Tab -->
        <v-window-item value="categories">
          <div class="d-flex justify-space-between align-center mb-6 flex-wrap gap-4">
            <h3 class="text-h6 font-weight-bold text-slate-900 flex items-center gap-2">
              <v-icon color="primary">mdi-file-tree-outline</v-icon>
              Quản lý Cây danh mục sản phẩm
            </h3>
            <v-btn
              v-if="authStore.hasRole(['Admin', 'Warehouse'])"
              color="primary"
              prepend-icon="mdi-plus"
              class="rounded-xl shadow-md px-6 py-2 transition-all hover:-translate-y-[1px] hover:shadow-lg active:scale-98"
              elevation="2"
              @click="openCreateCategoryDialog"
            >
              Thêm danh mục mới
            </v-btn>
          </div>

          <div class="overflow-x-auto rounded-xl border border-slate-200 bg-white">
            <table class="w-full text-left border-collapse text-slate-700">
              <thead>
                <tr class="bg-slate-50 border-b border-slate-200">
                  <th class="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">ID</th>
                  <th class="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Tên danh mục</th>
                  <th class="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Mô tả</th>
                  <th class="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Thứ tự sắp xếp</th>
                  <th class="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Danh mục cha</th>
                  <th class="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500" v-if="authStore.hasRole(['Admin', 'Warehouse'])">Hành động</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                <tr v-if="productStore.categoriesLoading">
                  <td colspan="6" class="text-center py-8">
                    <v-progress-circular indeterminate color="primary"></v-progress-circular>
                  </td>
                </tr>
                <tr v-else-if="flatCategoriesList.length === 0">
                  <td colspan="6" class="text-center py-8 text-slate-400">
                    Không có danh mục nào
                  </td>
                </tr>
                <template v-else v-for="cat in parentCategoriesList" :key="cat.id">
                  <tr class="hover:bg-slate-50/50 transition-colors duration-150">
                    <td class="px-6 py-4 font-mono text-sm text-slate-450">#{{ cat.id }}</td>
                    <td class="px-6 py-4">
                      <div class="d-flex align-center gap-2">
                        <v-btn v-if="cat.children && cat.children.length > 0" icon size="x-small" variant="text" color="primary" @click="toggleCategoryExpand(cat.id)" class="hover:bg-slate-100">
                          <v-icon>{{ expandedCategories[cat.id] ? 'mdi-chevron-down' : 'mdi-chevron-right' }}</v-icon>
                        </v-btn>
                        <div v-else style="width: 32px"></div>
                        <span class="font-weight-black text-slate-900">{{ cat.name }}</span>
                      </div>
                    </td>
                    <td class="px-6 py-4 text-slate-600">{{ cat.description || '-' }}</td>
                    <td class="px-6 py-4 font-mono text-sm">{{ cat.sortOrder }}</td>
                    <td class="px-6 py-4">
                      <span v-if="cat.children && cat.children.length > 0" class="text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-0.5 rounded-full">
                        {{ cat.children.length }} con
                      </span>
                      <span v-else class="text-slate-400 text-xs font-medium">Cấp cao nhất</span>
                    </td>
                    <td class="px-6 py-4" v-if="authStore.hasRole(['Admin', 'Warehouse'])">
                      <div class="d-flex align-center">
                        <v-btn icon size="x-small" color="primary" variant="text" class="me-2 hover:bg-slate-100" @click="openEditCategoryDialog(cat)">
                          <v-icon>mdi-pencil-outline</v-icon>
                        </v-btn>
                        <v-btn v-if="authStore.hasRole('Admin')" icon size="x-small" color="error" variant="text" class="hover:bg-slate-100" @click="handleDeleteCategory(cat.id)">
                          <v-icon>mdi-trash-can-outline</v-icon>
                        </v-btn>
                      </div>
                    </td>
                  </tr>

                </template>

              </tbody>
            </table>
          </div>

          <div class="mt-4 d-flex justify-center" v-if="productStore.categoriesTotalPages > 1">
            <v-pagination
              v-model="productStore.categoriesCurrentPage"
              :length="productStore.categoriesTotalPages"
              color="primary"
              @update:modelValue="(val) => productStore.fetchCategories(val)"
              rounded="circle"
            ></v-pagination>
          </div>
        </v-window-item>

        <!-- Stock Tab -->
        <v-window-item value="stock">
          <div class="d-flex justify-space-between align-center mb-6">
            <h3 class="text-h6 font-weight-bold text-slate-900">Danh sách Phiếu nhập kho (Stock Receipts)</h3>
            <v-btn
              v-if="authStore.hasRole(['Admin', 'Warehouse'])"
              color="primary"
              prepend-icon="mdi-plus"
              class="rounded-xl shadow-md px-6 py-2 transition-all hover:-translate-y-[1px] hover:shadow-lg active:scale-98"
              elevation="2"
              @click="openReceiptDialog"
            >
              Tạo phiếu nhập mới
            </v-btn>
          </div>
          <div class="overflow-x-auto rounded-xl border border-slate-200 bg-white">
            <table class="w-full text-left border-collapse text-slate-700">
              <thead>
                <tr class="bg-slate-50 border-b border-slate-200">
                  <th class="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Mã phiếu</th>
                  <th class="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Nhà cung cấp</th>
                  <th class="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Tổng tiền</th>
                  <th class="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Người tạo</th>
                  <th class="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Trạng thái</th>
                  <th class="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Ngày lập</th>
                  <th class="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500" v-if="authStore.hasRole('Admin')">Hành động</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                <tr v-if="productStore.receiptsLoading">
                  <td colspan="7" class="text-center py-8">
                    <v-progress-circular indeterminate color="primary"></v-progress-circular>
                  </td>
                </tr>
                <tr v-else-if="productStore.receipts.length === 0">
                  <td colspan="7" class="text-center py-8 text-slate-400">
                    Không có phiếu nhập kho nào
                  </td>
                </tr>
                <tr v-else v-for="receipt in productStore.receipts" :key="receipt.id" class="hover:bg-slate-50/50 transition-colors duration-150">
                  <td class="px-6 py-4">
                    <span class="font-mono font-bold text-blue-600">
                      {{ receipt.receiptCode }}
                    </span>
                  </td>
                  <td class="px-6 py-4 font-semibold text-slate-900">{{ receipt.supplierName || 'Mặc định' }}</td>
                  <td class="px-6 py-4 text-slate-700 font-medium">{{ formatPrice(receipt.totalAmount) }}</td>
                  <td class="px-6 py-4 text-slate-500 text-sm">User ID: {{ receipt.createdBy }}</td>
                  <td class="px-6 py-4">
                    <span :class="receipt.status === 'Confirmed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'" class="inline-flex items-center text-xs font-bold px-2.5 py-0.5 rounded-full border">
                      {{ receipt.status === 'Confirmed' ? 'Đã duyệt' : 'Bản nháp' }}
                    </span>
                  </td>
                  <td class="px-6 py-4 text-sm text-slate-500">{{ formatDate(receipt.createdAt) }}</td>
                  <td class="px-6 py-4" v-if="authStore.hasRole('Admin')">
                    <div class="d-flex align-center gap-2">
                      <v-btn
                        v-if="receipt.status !== 'Confirmed'"
                        size="x-small" color="success" variant="flat" class="rounded-lg shadow-sm text-white font-weight-bold me-2"
                        @click="handleConfirmReceipt(receipt.id)"
                      >
                        Duyệt
                      </v-btn>
                      <v-btn
                        v-if="receipt.status !== 'Confirmed'"
                        icon size="x-small" color="primary" variant="text" class="hover:bg-slate-100 me-1"
                        @click="openEditReceiptDialog(receipt)"
                      >
                        <v-icon>mdi-pencil-outline</v-icon>
                      </v-btn>
                      <v-btn
                        v-if="receipt.status !== 'Confirmed'"
                        icon size="x-small" color="error" variant="text" class="hover:bg-slate-100"
                        @click="handleDeleteReceipt(receipt.id)"
                      >
                        <v-icon>mdi-trash-can-outline</v-icon>
                      </v-btn>
                      <span v-if="receipt.status === 'Confirmed'" class="text-slate-400 text-sm">-</span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="mt-4 d-flex justify-center" v-if="productStore.receiptsTotalPages > 1">
            <v-pagination
              v-model="productStore.receiptsCurrentPage"
              :length="productStore.receiptsTotalPages"
              color="primary"
              @update:modelValue="(val) => productStore.fetchReceipts(val)"
              rounded="circle"
            ></v-pagination>
          </div>
        </v-window-item>
      </v-window>
    </v-card>

    <!-- Dialog Thêm/Sửa Sản phẩm -->
    <v-dialog v-model="showDialog" max-width="600px" persistent>
      <v-card class="glass-card text-slate-850" rounded="xl">
        <v-card-title class="d-flex justify-space-between align-center px-6 py-4 border-bottom">
          <span class="text-h5 font-weight-black">{{ dialogTitle }}</span>
          <v-btn icon variant="text" @click="showDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text class="pa-6">
          <v-form ref="productForm" v-model="formValid">
            <v-row>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="editingProduct.code"
                  label="Mã sản phẩm *"
                  variant="outlined"
                  density="compact"
                  color="primary"
                  :rules="[v => !!v || 'Mã sản phẩm là bắt buộc']"
                  :disabled="isEditMode"
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="editingProduct.name"
                  label="Tên sản phẩm *"
                  variant="outlined"
                  density="compact"
                  color="primary"
                  :rules="[v => !!v || 'Tên sản phẩm là bắt buộc']"
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-textarea
                  v-model="editingProduct.description"
                  label="Mô tả sản phẩm"
                  variant="outlined"
                  density="compact"
                  color="primary"
                  rows="3"
                ></v-textarea>
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model.number="editingProduct.importPrice"
                  label="Giá nhập *"
                  type="number"
                  variant="outlined"
                  density="compact"
                  color="primary"
                  :rules="[v => v >= 0 || 'Giá nhập không được âm']"
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model.number="editingProduct.salePrice"
                  label="Giá bán *"
                  type="number"
                  variant="outlined"
                  density="compact"
                  color="primary"
                  :rules="[v => v >= 0 || 'Giá bán không được âm']"
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <v-select
                  v-model="editingProduct.categoryId"
                  :items="flatCategories"
                  item-title="name"
                  item-value="id"
                  label="Danh mục *"
                  variant="outlined"
                  density="compact"
                  color="primary"
                  :rules="[v => !!v || 'Danh mục là bắt buộc']"
                ></v-select>
              </v-col>
              <v-col cols="12" sm="6">
                <v-file-input
                  v-model="imageFile"
                  label="Hình ảnh sản phẩm (Tùy chọn)"
                  accept="image/*"
                  variant="outlined"
                  density="compact"
                  color="primary"
                  prepend-icon="mdi-camera"
                  show-size
                ></v-file-input>
              </v-col>
              <v-col cols="12" sm="12" v-if="editingProduct.imageUrl">
                <div class="mb-2 text-sm text-slate-500">Ảnh hiện tại:</div>
                <v-img :src="getImageUrl(editingProduct.imageUrl)" max-height="100" max-width="100" class="rounded border bg-slate-50"></v-img>
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model.number="editingProduct.minStockThreshold"
                  label="Ngưỡng cảnh báo tồn kho"
                  type="number"
                  variant="outlined"
                  density="compact"
                  color="primary"
                  :rules="[v => v >= 0 || 'Ngưỡng không được âm']"
                ></v-text-field>
              </v-col>
              <v-col cols="12" v-if="!isEditMode">
                <v-text-field
                  v-model.number="editingProduct.initialStock"
                  label="Số lượng tồn kho ban đầu"
                  type="number"
                  variant="outlined"
                  density="compact"
                  color="primary"
                  :rules="[v => v >= 0 || 'Số lượng không được âm']"
                ></v-text-field>
              </v-col>
              <v-col cols="12" v-if="isEditMode">
                <v-switch
                  v-model="editingProduct.isActive"
                  label="Hoạt động"
                  color="primary"
                ></v-switch>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions class="px-6 pb-6 pt-0">
          <v-spacer></v-spacer>
          <v-btn variant="outlined" rounded="xl" color="slate-500" class="px-5 font-weight-bold border-slate-300" @click="showDialog = false">Hủy</v-btn>
          <v-btn variant="elevated" rounded="xl" color="primary" class="px-5 font-weight-bold text-white shadow-md shadow-primary/20" :disabled="!formValid" :loading="saveLoading" @click="saveProduct">Lưu sản phẩm</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog Thêm Phiếu Nhập Kho -->
    <v-dialog v-model="showReceiptDialog" max-width="800px" persistent>
      <v-card class="glass-card text-slate-850" rounded="xl">
        <v-card-title class="d-flex justify-space-between align-center px-6 py-4 border-bottom">
          <span class="text-h5 font-weight-black">Tạo Phiếu Nhập Kho Mới</span>
          <v-btn icon variant="text" @click="showReceiptDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text class="pa-6">
          <v-form ref="receiptForm" v-model="receiptFormValid">
            <v-row>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="newReceipt.supplierName"
                  label="Nhà cung cấp *"
                  variant="outlined"
                  density="compact"
                  color="primary"
                  :rules="[v => !!v || 'Nhà cung cấp là bắt buộc']"
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="newReceipt.note"
                  label="Ghi chú"
                  variant="outlined"
                  density="compact"
                  color="primary"
                ></v-text-field>
              </v-col>
            </v-row>

            <div class="d-flex justify-space-between align-center my-4">
              <span class="text-subtitle-1 font-weight-bold">Danh sách mặt hàng nhập</span>
              <v-btn color="secondary" size="small" prepend-icon="mdi-plus" @click="addReceiptItem">Thêm dòng</v-btn>
            </div>

            <v-row v-for="(item, index) in newReceipt.items" :key="index" class="align-center">
              <v-col cols="12" sm="5">
                <v-select
                  v-model="item.productId"
                  :items="productStore.products"
                  item-title="name"
                  item-value="id"
                  label="Chọn sản phẩm *"
                  variant="outlined"
                  density="compact"
                  color="primary"
                  :rules="[v => !!v || 'Sản phẩm là bắt buộc']"
                ></v-select>
              </v-col>
              <v-col cols="12" sm="3">
                <v-text-field
                  v-model.number="item.quantity"
                  label="Số lượng *"
                  type="number"
                  variant="outlined"
                  density="compact"
                  color="primary"
                  :rules="[v => v > 0 || 'Số lượng > 0']"
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="3">
                <v-text-field
                  v-model.number="item.importPrice"
                  label="Giá nhập *"
                  type="number"
                  variant="outlined"
                  density="compact"
                  color="primary"
                  :rules="[v => v >= 0 || 'Giá không âm']"
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="1" class="text-center">
                <v-btn icon color="error" variant="text" size="small" @click="removeReceiptItem(index)" :disabled="newReceipt.items.length === 1">
                  <v-icon>mdi-delete</v-icon>
                </v-btn>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions class="px-6 pb-6 pt-0">
          <v-spacer></v-spacer>
          <v-btn variant="outlined" rounded="xl" color="slate-500" class="px-5 font-weight-bold border-slate-300" @click="showReceiptDialog = false">Hủy</v-btn>
          <v-btn variant="elevated" rounded="xl" color="primary" class="px-5 font-weight-bold text-white shadow-md shadow-primary/20" :disabled="!receiptFormValid" :loading="receiptSaveLoading" @click="saveReceipt">Lưu phiếu</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog Thêm/Sửa Danh Mục -->
    <v-dialog v-model="showCategoryDialog" max-width="500px" persistent>
      <v-card class="glass-card text-slate-850" rounded="xl">
        <v-card-title class="d-flex justify-space-between align-center px-6 py-4 border-bottom">
          <span class="text-h5 font-weight-black">{{ categoryDialogTitle }}</span>
          <v-btn icon variant="text" @click="showCategoryDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text class="pa-6">
          <v-form ref="categoryForm" v-model="categoryFormValid">
            <v-row>
              <v-col cols="12">
                <v-text-field
                  v-model="editingCategory.name"
                  label="Tên danh mục *"
                  variant="outlined"
                  density="compact"
                  color="primary"
                  :rules="[v => !!v || 'Tên danh mục là bắt buộc']"
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-textarea
                  v-model="editingCategory.description"
                  label="Mô tả danh mục"
                  variant="outlined"
                  density="compact"
                  color="primary"
                  rows="3"
                ></v-textarea>
              </v-col>
              <v-col cols="12" sm="8">
                <v-select
                  v-model="editingCategory.parentCategoryId"
                  :items="availableParentCategories"
                  item-title="name"
                  item-value="id"
                  label="Danh mục cha (Tùy chọn)"
                  variant="outlined"
                  density="compact"
                  color="primary"
                  clearable
                ></v-select>
              </v-col>
              <v-col cols="12" sm="4">
                <v-text-field
                  v-model.number="editingCategory.sortOrder"
                  label="Thứ tự"
                  type="number"
                  variant="outlined"
                  density="compact"
                  color="primary"
                  :rules="[v => v >= 0 || 'Thứ tự không được âm']"
                ></v-text-field>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions class="px-6 pb-6 pt-0">
          <v-spacer></v-spacer>
          <v-btn variant="outlined" rounded="xl" color="slate-500" class="px-5 font-weight-bold border-slate-300" @click="showCategoryDialog = false">Hủy</v-btn>
          <v-btn variant="elevated" rounded="xl" color="primary" class="px-5 font-weight-bold text-white shadow-md shadow-primary/20" :disabled="!categoryFormValid" :loading="categorySaveLoading" @click="saveCategory">Lưu</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="detailsDialog" max-width="900" persistent>
      <v-card class="rounded-xl shadow-xl border border-slate-100">
        <v-card-title class="px-6 py-4 border-b border-slate-100 bg-slate-50 d-flex justify-space-between align-center">
          <span class="text-h6 font-bold text-slate-800">Chi tiết sản phẩm</span>
          <v-btn icon="mdi-close" variant="text" size="small" @click="detailsDialog = false"></v-btn>
        </v-card-title>
        <v-card-text class="px-6 py-4 p-0">
          <v-tabs v-model="detailsTab" color="primary" class="border-b border-slate-200">
            <v-tab value="overview"><v-icon start>mdi-information-outline</v-icon> Tổng quan</v-tab>
            <v-tab value="price"><v-icon start>mdi-currency-usd</v-icon> Lịch sử giá</v-tab>
            <v-tab value="stock"><v-icon start>mdi-package-variant-closed</v-icon> Thẻ kho</v-tab>
          </v-tabs>
          <v-window v-model="detailsTab" class="mt-4">
            <v-window-item value="overview">
              <div v-if="detailsLoading" class="p-8 flex justify-center items-center">
                <v-progress-circular indeterminate color="primary"></v-progress-circular>
              </div>
              <div v-else-if="detailsProduct" class="grid grid-cols-1 md:grid-cols-3 gap-6 p-4">
                <div class="col-span-1">
                  <v-img v-if="detailsProduct.imageUrl" :src="getImageUrl(detailsProduct.imageUrl)" class="rounded-lg shadow-sm border border-slate-200 w-full object-cover" aspect-ratio="1"></v-img>
                  <div v-else class="rounded-lg bg-slate-100 border border-slate-200 w-full aspect-square d-flex justify-center align-center text-slate-400">
                    <v-icon size="64">mdi-image-outline</v-icon>
                  </div>
                </div>
                <div class="col-span-2 space-y-4">
                  <div>
                    <div class="text-sm text-slate-500 font-medium">Mã sản phẩm</div>
                    <div class="text-lg font-mono font-bold text-blue-700">{{ detailsProduct.code }}</div>
                  </div>
                  <div>
                    <div class="text-sm text-slate-500 font-medium">Tên sản phẩm</div>
                    <div class="text-xl font-bold text-slate-900">{{ detailsProduct.name }}</div>
                  </div>
                  <div class="grid grid-cols-2 gap-4">
                    <div class="bg-slate-50 p-3 rounded-lg border border-slate-100">
                      <div class="text-xs text-slate-500 font-medium mb-1">Giá nhập</div>
                      <div class="font-semibold text-slate-800">{{ formatPrice(detailsProduct.importPrice) }}</div>
                    </div>
                    <div class="bg-emerald-50 p-3 rounded-lg border border-emerald-100">
                      <div class="text-xs text-emerald-600 font-medium mb-1">Giá bán</div>
                      <div class="font-bold text-emerald-700">{{ formatPrice(detailsProduct.salePrice) }}</div>
                    </div>
                  </div>
                  <div>
                    <div class="text-sm text-slate-500 font-medium">Danh mục</div>
                    <div class="text-md text-slate-800">{{ detailsProduct.categoryName || 'Chưa phân loại' }}</div>
                  </div>
                  <div>
                    <div class="text-sm text-slate-500 font-medium mb-1">Mô tả</div>
                    <p class="text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100 text-sm whitespace-pre-wrap">{{ detailsProduct.description || 'Không có mô tả.' }}</p>
                  </div>
                </div>
              </div>
            </v-window-item>
            <v-window-item value="price">
              <div v-if="detailsProduct" class="p-4">
                <table class="w-full text-left border-collapse text-slate-700 text-sm">
                  <thead>
                    <tr>
                      <th class="px-4 py-3 font-semibold bg-slate-50 border-b border-slate-200">Thời gian áp dụng</th>
                      <th class="px-4 py-3 font-semibold bg-slate-50 border-b border-slate-200">Giá nhập</th>
                      <th class="px-4 py-3 font-semibold bg-slate-50 border-b border-slate-200">Giá bán</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="ph in detailsProduct.priceHistories" :key="ph.id" class="border-b border-slate-100 hover:bg-slate-50">
                      <td class="px-4 py-3">{{ new Date(ph.effectiveDate).toLocaleString('vi-VN') }}</td>
                      <td class="px-4 py-3">{{ formatPrice(ph.importPrice) }}</td>
                      <td class="px-4 py-3 font-medium text-emerald-600">{{ formatPrice(ph.salePrice) }}</td>
                    </tr>
                    <tr v-if="!detailsProduct.priceHistories?.length">
                      <td colspan="3" class="px-4 py-6 text-center text-slate-400">Không có dữ liệu lịch sử giá.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </v-window-item>
            <v-window-item value="stock">
              <div v-if="detailsProduct" class="p-4">
                <div class="mb-4 flex gap-4">
                  <div class="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg border border-blue-100">
                    Tồn kho hiện tại: <span class="font-bold text-lg">{{ detailsProduct.quantityInStock }}</span>
                  </div>
                  <div class="bg-amber-50 text-amber-700 px-4 py-2 rounded-lg border border-amber-100">
                    Ngưỡng cảnh báo: <span class="font-bold">{{ detailsProduct.minStockThreshold }}</span>
                  </div>
                </div>
                <table class="w-full text-left border-collapse text-slate-700 text-sm">
                  <thead>
                    <tr>
                      <th class="px-4 py-3 font-semibold bg-slate-50 border-b border-slate-200">Thời gian</th>
                      <th class="px-4 py-3 font-semibold bg-slate-50 border-b border-slate-200">Loại/Lý do</th>
                      <th class="px-4 py-3 font-semibold bg-slate-50 border-b border-slate-200 text-right">Biến động</th>
                      <th class="px-4 py-3 font-semibold bg-slate-50 border-b border-slate-200">Tham chiếu</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="sm in detailsProduct.stockMoves" :key="sm.id" class="border-b border-slate-100 hover:bg-slate-50">
                      <td class="px-4 py-3">{{ new Date(sm.createdAt).toLocaleString('vi-VN') }}</td>
                      <td class="px-4 py-3">
                        <span class="px-2 py-1 rounded text-xs font-medium" :class="sm.quantity > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'">
                          {{ sm.moveType }}
                        </span>
                      </td>
                      <td class="px-4 py-3 text-right font-mono font-bold" :class="sm.quantity > 0 ? 'text-emerald-600' : 'text-rose-600'">
                        {{ sm.quantity > 0 ? '+' : '' }}{{ sm.quantity }}
                      </td>
                      <td class="px-4 py-3 text-slate-500 font-mono text-xs">{{ sm.referenceDocument || '-' }}</td>
                    </tr>
                    <tr v-if="!detailsProduct.stockMoves?.length">
                      <td colspan="4" class="px-4 py-6 text-center text-slate-400">Không có dữ liệu thẻ kho.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </v-window-item>
          </v-window>
        </v-card-text>
        <v-card-actions class="px-6 py-4 border-t border-slate-100 bg-slate-50">
          <v-spacer></v-spacer>
          <v-btn color="slate-600" variant="text" class="text-none px-4" @click="detailsDialog = false">Đóng</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="snackbar" :color="snackbarColor" timeout="3000">
      {{ snackbarText }}
    </v-snackbar>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from 'vue';
import { useProductStore } from '../../stores/product';
import { useAuthStore } from '../../stores/auth';
import api from '../../config/api';

const productStore = useProductStore();
const authStore = useAuthStore();

const tab = ref('products');
const searchProduct = ref('');

// Watch search and reload products
watch(searchProduct, (newVal) => {
  productStore.fetchProducts(1, newVal);
});

// Dialog states
const showDialog = ref(false);
const isEditMode = ref(false);
const dialogTitle = computed(() => isEditMode.value ? 'Cập nhật sản phẩm' : 'Thêm sản phẩm mới');
const formValid = ref(false);
const saveLoading = ref(false);

const detailsDialog = ref(false);
const detailsTab = ref('overview');
const detailsProduct = ref(null);
const detailsLoading = ref(false);

// Category expand/collapse state
const expandedCategories = ref({});
const toggleCategoryExpand = (categoryId) => {
  expandedCategories.value[categoryId] = !expandedCategories.value[categoryId];
};

const openDetailsDialog = async (id) => {
  try {
    detailsProduct.value = null; // Clear previous
    detailsLoading.value = true;
    detailsDialog.value = true;
    detailsTab.value = 'overview';
    const res = await api.get(`/api/products/${id}`);
    detailsProduct.value = res.data;
    detailsLoading.value = false;
  } catch (error) {
    detailsLoading.value = false;
    showNotify('Lỗi tải chi tiết sản phẩm', 'error');
  }
};

const imageFile = ref(null);
const getImageUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return `http://localhost:5000${url}`;
};

const editingProduct = ref({
  id: null,
  code: '',
  name: '',
  description: '',
  importPrice: 0,
  salePrice: 0,
  categoryId: null,
  minStockThreshold: 10,
  initialStock: 0,
  isActive: true
});

// Stock Receipt Dialog states
const showReceiptDialog = ref(false);
const receiptFormValid = ref(false);
const receiptSaveLoading = ref(false);
const isEditReceipt = ref(false);
const editingReceiptId = ref(null);
const newReceipt = ref({
  supplierName: '',
  note: '',
  items: [
    { productId: null, quantity: 1, importPrice: 0 }
  ]
});

// Snackbar notification state
const snackbar = ref(false);
const snackbarText = ref('');
const snackbarColor = ref('success');

const showNotify = (text, color = 'success') => {
  snackbarText.value = text;
  snackbarColor.value = color;
  snackbar.value = true;
};

// Flattened categories for the select input
const flatCategories = computed(() => {
  const result = [];
  const recurse = (nodes) => {
    for (const node of nodes) {
      result.push({
        id: node.id,
        name: node.name
      });
      if (node.children && node.children.length > 0) {
        recurse(node.children);
      }
    }
  };
  recurse(productStore.categories);
  return result;
});

// Flattened category list with parent names for the category table view
const flatCategoriesList = computed(() => {
  const result = [];
  const recurse = (nodes, parentName = null, depth = 0) => {
    for (const node of nodes) {
      result.push({
        id: node.id,
        name: node.name,
        description: node.description,
        parentCategoryId: node.parentCategoryId,
        sortOrder: node.sortOrder || 0,
        parent: parentName,
        depth: depth
      });
      if (node.children && node.children.length > 0) {
        recurse(node.children, node.name, depth + 1);
      }
    }
  };
  recurse(productStore.categories);
  return result;
});

// Parent categories only (for table display with expandable children)
const parentCategoriesList = computed(() => {
  return productStore.categories || [];
});

// Flatten children N levels - dùng cho template render danh mục con đệ quy
const flattenChildren = (nodes, parentName, depth = 1) => {
  const result = [];
  for (const node of nodes) {
    result.push({
      ...node,
      parentName,
      depth,
    });
    // Nếu node đang được expand VÀ có children -> flatten tiếp
    if (expandedCategories.value[node.id] && node.children && node.children.length > 0) {
      result.push(...flattenChildren(node.children, node.name, depth + 1));
    }
  }
  return result;
};

onMounted(() => {
  productStore.fetchProducts();
  productStore.fetchCategories();
  productStore.fetchReceipts();
});

const formatPrice = (price) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price || 0);
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('vi-VN') + ' ' + date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
};

// CRUD handlers
const openCreateDialog = () => {
  isEditMode.value = false;
  editingProduct.value = {
    id: null,
    code: '',
    name: '',
    description: '',
    importPrice: 0,
    salePrice: 0,
    categoryId: flatCategories.value[0]?.id || null,
    minStockThreshold: 10,
    initialStock: 0,
    isActive: true,
    imageUrl: ''
  };
  imageFile.value = null;
  showDialog.value = true;
};

const openEditDialog = (product) => {
  isEditMode.value = true;
  editingProduct.value = {
    id: product.id,
    code: product.code,
    name: product.name,
    description: product.description,
    importPrice: product.importPrice,
    salePrice: product.salePrice,
    categoryId: product.categoryId,
    minStockThreshold: product.minStockThreshold,
    isActive: product.isActive,
    imageUrl: product.imageUrl
  };
  imageFile.value = null;
  showDialog.value = true;
};

const saveProduct = async () => {
  if (!formValid.value) return;
  saveLoading.value = true;
  
  // Handle image upload if a file is selected
  let uploadedImageUrl = editingProduct.value.imageUrl;
  if (imageFile.value && imageFile.value.length > 0) {
    try {
      const formData = new FormData();
      formData.append('file', imageFile.value[0]);
      const uploadRes = await api.post('/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      uploadedImageUrl = uploadRes.data.url;
    } catch (err) {
      showNotify('Lỗi tải ảnh lên: ' + (err.response?.data?.message || err.message), 'error');
      saveLoading.value = false;
      return;
    }
  }

  let res;
  if (isEditMode.value) {
    res = await productStore.updateProduct(editingProduct.value.id, {
      name: editingProduct.value.name,
      description: editingProduct.value.description,
      importPrice: editingProduct.value.importPrice,
      salePrice: editingProduct.value.salePrice,
      categoryId: editingProduct.value.categoryId,
      minStockThreshold: editingProduct.value.minStockThreshold,
      imageUrl: uploadedImageUrl,
      isActive: editingProduct.value.isActive
    });
  } else {
    res = await productStore.createProduct({
      code: editingProduct.value.code,
      name: editingProduct.value.name,
      description: editingProduct.value.description,
      importPrice: editingProduct.value.importPrice,
      salePrice: editingProduct.value.salePrice,
      categoryId: editingProduct.value.categoryId,
      minStockThreshold: editingProduct.value.minStockThreshold,
      imageUrl: uploadedImageUrl,
      initialStock: editingProduct.value.initialStock
    });
  }
  saveLoading.value = false;
  if (res.success) {
    showDialog.value = false;
    showNotify(isEditMode.value ? 'Cập nhật sản phẩm thành công!' : 'Thêm sản phẩm mới thành công!');
  } else {
    showNotify(res.message, 'error');
  }
};

const handleDelete = async (id) => {
  if (confirm('Bạn có chắc chắn muốn ngừng bán sản phẩm này? (Soft Delete)')) {
    const res = await productStore.deleteProduct(id);
    if (res.success) {
      showNotify('Đã chuyển sản phẩm sang trạng thái Ngừng bán!');
    } else {
      showNotify(res.message, 'error');
    }
  }
};

// Toggle product status (active/inactive)
// deleteProduct (soft delete) -> isActive = false
// restore: dùng updateProduct với isActive = true
const toggleProductStatus = async (id, currentStatus) => {
  const message = currentStatus
    ? 'Bạn có chắc muốn ngừng bán sản phẩm này?'
    : 'Bạn muốn khôi phục sản phẩm này sang trạng thái Đang bán?';

  if (!confirm(message)) return;

  if (currentStatus) {
    // Ngừng bán: gọi soft delete
    const res = await productStore.deleteProduct(id);
    if (res.success) {
      showNotify('Đã chuyển sản phẩm sang trạng thái Ngừng bán!');
    } else {
      showNotify(res.message || 'Có lỗi xảy ra', 'error');
    }
  } else {
    // Khôi phục: update isActive = true
    const res = await productStore.updateProduct(id, { isActive: true });
    if (res.success) {
      showNotify('Đã khôi phục sản phẩm thành công!');
    } else {
      showNotify(res.message || 'Có lỗi khi khôi phục', 'error');
    }
  }
};

// Stock receipt handlers
const openReceiptDialog = () => {
  isEditReceipt.value = false;
  editingReceiptId.value = null;
  newReceipt.value = {
    supplierName: '',
    note: '',
    items: [
      { productId: productStore.products[0]?.id || null, quantity: 1, importPrice: 0 }
    ]
  };
  showReceiptDialog.value = true;
};

const openEditReceiptDialog = async (receipt) => {
  try {
    const res = await productStore.fetchReceiptDetail(receipt.id);
    if (res.success && res.data) {
      isEditReceipt.value = true;
      editingReceiptId.value = receipt.id;
      newReceipt.value = {
        supplierName: res.data.supplierName || '',
        note: res.data.note || '',
        items: res.data.items?.length ? res.data.items.map(i => ({ productId: i.productId, quantity: i.quantity, importPrice: i.importPrice })) : [{ productId: productStore.products[0]?.id || null, quantity: 1, importPrice: 0 }]
      };
      showReceiptDialog.value = true;
    } else {
      showNotify(res.message || 'Lỗi tải phiếu nhập', 'error');
    }
  } catch (e) {
    showNotify('Lỗi tải chi tiết phiếu nhập', 'error');
  }
};

const addReceiptItem = () => {
  newReceipt.value.items.push({
    productId: productStore.products[0]?.id || null,
    quantity: 1,
    importPrice: 0
  });
};

const removeReceiptItem = (index) => {
  newReceipt.value.items.splice(index, 1);
};

const saveReceipt = async () => {
  if (!receiptFormValid.value) return;
  receiptSaveLoading.value = true;
  let res;
  if (isEditReceipt.value) {
    res = await productStore.updateReceipt(editingReceiptId.value, newReceipt.value);
  } else {
    res = await productStore.createReceipt(newReceipt.value);
  }
  receiptSaveLoading.value = false;
  if (res.success) {
    showReceiptDialog.value = false;
    showNotify(isEditReceipt.value ? 'Cập nhật phiếu nhập thành công!' : 'Tạo phiếu nhập kho thành công!');
    productStore.fetchProducts(); // Refresh stock quantities
  } else {
    showNotify(res.message || 'Có lỗi xảy ra', 'error');
  }
};

const handleDeleteReceipt = async (id) => {
  if (confirm('Bạn có chắc chắn muốn xóa phiếu nhập nháp này?')) {
    const res = await productStore.deleteReceipt(id);
    if (res.success) {
      showNotify('Đã xóa phiếu nhập kho thành công!');
    } else {
      showNotify(res.message || 'Xóa thất bại', 'error');
    }
  }
};

const handleConfirmReceipt = async (id) => {
  if (confirm('Duyệt phiếu nhập này sẽ cộng số lượng hàng vào tồn kho. Tiếp tục?')) {
    const res = await productStore.confirmReceipt(id);
    if (res.success) {
      showNotify('Duyệt phiếu nhập thành công!');
      productStore.fetchProducts(); // Refresh stock quantities
    } else {
      showNotify(res.message, 'error');
    }
  }
};

// Category Dialog States
const showCategoryDialog = ref(false);
const isCategoryEditMode = ref(false);
const categoryDialogTitle = computed(() => isCategoryEditMode.value ? 'Cập nhật danh mục' : 'Thêm danh mục mới');
const categoryFormValid = ref(false);
const categorySaveLoading = ref(false);
const categoryForm = ref(null);

const editingCategory = ref({
  id: null,
  name: '',
  description: '',
  parentCategoryId: null,
  sortOrder: 0
});

const openCreateCategoryDialog = () => {
  isCategoryEditMode.value = false;
  editingCategory.value = {
    id: null,
    name: '',
    description: '',
    parentCategoryId: null,
    sortOrder: 0
  };
  if (categoryForm.value) categoryForm.value.resetValidation();
  showCategoryDialog.value = true;
};

const openEditCategoryDialog = (cat) => {
  isCategoryEditMode.value = true;
  editingCategory.value = {
    id: cat.id,
    name: cat.name,
    description: cat.description,
    parentCategoryId: cat.parentCategoryId,
    sortOrder: cat.sortOrder
  };
  if (categoryForm.value) categoryForm.value.resetValidation();
  showCategoryDialog.value = true;
};

const availableParentCategories = computed(() => {
  const list = flatCategories.value.map(c => ({ id: c.id, name: c.name }));
  if (isCategoryEditMode.value && editingCategory.value.id) {
    return list.filter(c => c.id !== editingCategory.value.id);
  }
  return list;
});

const saveCategory = async () => {
  if (!categoryFormValid.value) return;
  categorySaveLoading.value = true;
  let res;
  if (isCategoryEditMode.value) {
    res = await productStore.updateCategory(editingCategory.value.id, {
      name: editingCategory.value.name,
      description: editingCategory.value.description,
      parentCategoryId: editingCategory.value.parentCategoryId,
      sortOrder: editingCategory.value.sortOrder
    });
  } else {
    res = await productStore.createCategory({
      name: editingCategory.value.name,
      description: editingCategory.value.description,
      parentCategoryId: editingCategory.value.parentCategoryId,
      sortOrder: editingCategory.value.sortOrder
    });
  }
  categorySaveLoading.value = false;
  if (res.success) {
    showCategoryDialog.value = false;
    showNotify(isCategoryEditMode.value ? 'Cập nhật danh mục thành công!' : 'Thêm danh mục mới thành công!');
    productStore.fetchCategories(); // Reload category tree
  } else {
    showNotify(res.message, 'error');
  }
};

const handleDeleteCategory = async (id) => {
  if (confirm('Bạn có chắc chắn muốn xóa danh mục này? Xóa danh mục cha sẽ ảnh hưởng đến các danh mục con.')) {
    const res = await productStore.deleteCategory(id);
    if (res.success) {
      showNotify('Xóa danh mục thành công!');
      productStore.fetchCategories(); // Refresh
    } else {
      showNotify(res.message, 'error');
    }
  }
};
</script>

<style scoped>
.glass-card {
  background: #ffffff !important;
  border: 1px solid #e2e8f0 !important;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.03) !important;
}
.text-gradient {
  background: linear-gradient(135deg, var(--v-theme-primary) 0%, var(--v-theme-secondary) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
.border-bottom {
  border-bottom: 1px solid #e2e8f0;
}
.gap-4 {
  gap: 16px;
}
</style>
