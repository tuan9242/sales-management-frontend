<template>
  <div class="product-management">
    <!-- ═══════════════════════════════════════════════════════════ -->
    <!--  ENHANCED HEADER                                           -->
    <!-- ═══════════════════════════════════════════════════════════ -->
    <div class="d-flex align-center mb-5 animate-fade-in">
      <div class="header-icon-wrap mr-4">
        <v-icon size="26" color="white">mdi-package-variant-closed</v-icon>
      </div>
      <div>
        <h1 class="text-h4 font-weight-black text-slate-900 mb-0">Quản lý Sản phẩm &amp; Kho hàng</h1>
        <p class="text-body-2 text-slate-500 mb-0">CRUD sản phẩm · Phân loại danh mục · Lập phiếu nhập kho — Phân hệ Nhóm 5</p>
      </div>
    </div>

    <!-- ═══════════════════════════════════════════════════════════ -->
    <!--  COMPACT DASHBOARD STATS (không chiếm quá nhiều)           -->
    <!-- ═══════════════════════════════════════════════════════════ -->
    <v-row dense class="mb-5 animate-fade-in" style="animation-delay:.05s">
      <v-col cols="6" sm="3" v-for="card in dashboardCards" :key="card.key">
        <div class="stat-card" :class="`stat-card--${card.variant}`">
          <div class="stat-card__icon"><v-icon size="18">{{ card.icon }}</v-icon></div>
          <span class="stat-card__value">{{ card.value }}</span>
          <span class="stat-card__label">{{ card.label }}</span>
        </div>
      </v-col>
    </v-row>

    <!-- ═══════════════════════════════════════════════════════════ -->
    <!--  MAIN TABBED CARD                                          -->
    <!-- ═══════════════════════════════════════════════════════════ -->
    <v-card class="glass-card mb-6 animate-fade-in" rounded="xl" style="animation-delay:.1s">
      <v-tabs v-model="tab" color="primary" bg-color="transparent" class="px-4 border-bottom border-opacity-10">
        <v-tab value="products" class="font-weight-bold text-none">
          <v-icon start>mdi-package-variant-closed</v-icon>
          Sản phẩm
        </v-tab>
        <v-tab value="categories" class="font-weight-bold text-none">
          <v-icon start>mdi-file-tree-outline</v-icon>
          Danh mục
        </v-tab>
        <v-tab value="stock" class="font-weight-bold text-none">
          <v-icon start>mdi-warehouse</v-icon>
          Nhập kho &amp; Tồn kho
        </v-tab>
      </v-tabs>

      <v-window v-model="tab" class="pa-6">
        <!-- ─────────────────────────────────────────────────── -->
        <!--  PRODUCTS TAB                                       -->
        <!-- ─────────────────────────────────────────────────── -->
        <v-window-item value="products">
          <!-- Search + Filter Toggle + Add Button -->
          <v-row class="mb-2 align-center">
            <v-col cols="12" sm="4" md="4">
              <v-text-field
                v-model="searchProduct"
                prepend-inner-icon="mdi-magnify"
                label="Tìm kiếm sản phẩm..."
                variant="outlined"
                density="compact"
                hide-details
                color="primary"
                rounded="xl"
                clearable
                @click:clear="searchProduct = ''"
              ></v-text-field>
            </v-col>
            <v-col cols="auto" class="d-flex align-center gap-2">
              <v-btn
                variant="outlined"
                rounded="xl"
                color="slate"
                class="text-none filter-toggle-btn"
                @click="showFilters = !showFilters"
              >
                <v-icon start size="18">mdi-filter-variant</v-icon>
                Bộ lọc
                <span v-if="activeFilterCount > 0" class="filter-count-badge ml-2">{{ activeFilterCount }}</span>
                <v-icon end size="16">{{ showFilters ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
              </v-btn>

              <v-btn
                v-if="authStore.hasRole(['Admin', 'Warehouse'])"
                :variant="isSelectionMode ? 'flat' : 'outlined'"
                :color="isSelectionMode ? 'primary' : 'slate'"
                rounded="xl"
                class="text-none"
                @click="toggleSelectionMode"
              >
                <v-icon start size="18">{{ isSelectionMode ? 'mdi-checkbox-multiple-marked' : 'mdi-checkbox-multiple-blank-outline' }}</v-icon>
                {{ isSelectionMode ? 'Đang chọn nhiều' : 'Chọn nhiều' }}
              </v-btn>
            </v-col>
            <v-spacer></v-spacer>
            <v-col cols="auto" v-if="authStore.hasRole(['Admin', 'Warehouse'])">
              <v-btn
                color="primary"
                prepend-icon="mdi-plus"
                class="rounded-xl shadow-md px-6 py-2 btn-hover-lift"
                elevation="2"
                @click="openCreateDialog"
              >
                Thêm sản phẩm mới
              </v-btn>
            </v-col>
          </v-row>

          <!-- Collapsible Advanced Filters -->
          <v-expand-transition>
            <div v-show="showFilters">
              <v-row class="mb-4 align-center">
                <v-col cols="12" sm="4" md="3">
                  <v-select
                    v-model="filterCategory"
                    :items="categorySelectItems"
                    item-title="name"
                    item-value="id"
                    label="Lọc theo danh mục"
                    variant="outlined"
                    density="compact"
                    hide-details
                    color="primary"
                    rounded="xl"
                    clearable
                  ></v-select>
                </v-col>
                <v-col cols="12" sm="4" md="3">
                  <v-select
                    v-model="filterStatus"
                    :items="[
                      { value: '', title: 'Tất cả trạng thái' },
                      { value: 'true', title: 'Đang bán' },
                      { value: 'false', title: 'Ngừng bán' }
                    ]"
                    item-title="title"
                    item-value="value"
                    label="Lọc theo trạng thái"
                    variant="outlined"
                    density="compact"
                    hide-details
                    color="primary"
                    rounded="xl"
                  ></v-select>
                </v-col>
                <v-col cols="auto" v-if="activeFilterCount > 0">
                  <v-btn variant="text" color="error" size="small" class="text-none" @click="clearProductFilters">
                    <v-icon start size="16">mdi-filter-remove</v-icon>
                    Xóa bộ lọc
                  </v-btn>
                </v-col>
              </v-row>
            </div>
          </v-expand-transition>

          <!-- Product Table -->
          <div class="overflow-x-auto rounded-xl border border-slate-200 bg-white data-table-wrap">
            <table class="w-full text-left border-collapse text-slate-700 data-table">
              <thead>
                <tr>
                  <th class="px-4 py-4 text-left border-b border-slate-200" v-if="authStore.hasRole(['Admin', 'Warehouse']) && isSelectionMode" style="width:48px">
                    <v-checkbox-btn v-model="isAllSelected" color="primary" hide-details density="compact"></v-checkbox-btn>
                  </th>
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
                <!-- Skeleton Loader -->
                <template v-if="productStore.loading">
                  <tr v-for="n in 6" :key="`skel-prod-${n}`" class="skeleton-row">
                    <td class="px-4 py-4" v-if="authStore.hasRole(['Admin', 'Warehouse']) && isSelectionMode"><div class="skeleton" style="width:20px;height:20px;border-radius:4px"></div></td>
                    <td class="px-6 py-4"><div class="skeleton" style="width:78px;height:24px;border-radius:6px"></div></td>
                    <td class="px-6 py-4"><div class="skeleton" style="width:40px;height:40px;border-radius:8px"></div></td>
                    <td class="px-6 py-4"><div class="skeleton" style="width:140px;height:14px;border-radius:4px"></div></td>
                    <td class="px-6 py-4"><div class="skeleton" style="width:90px;height:14px;border-radius:4px"></div></td>
                    <td class="px-6 py-4"><div class="skeleton" style="width:78px;height:14px;border-radius:4px"></div></td>
                    <td class="px-6 py-4"><div class="skeleton" style="width:78px;height:14px;border-radius:4px"></div></td>
                    <td class="px-6 py-4"><div class="skeleton" style="width:64px;height:22px;border-radius:12px"></div></td>
                    <td class="px-6 py-4"><div class="skeleton" style="width:68px;height:22px;border-radius:12px"></div></td>
                    <td class="px-6 py-4" v-if="authStore.hasRole(['Admin', 'Warehouse'])"><div class="skeleton" style="width:96px;height:24px;border-radius:4px"></div></td>
                  </tr>
                </template>
                <!-- Empty State -->
                <tr v-else-if="productStore.products.length === 0">
                  <td :colspan="authStore.hasRole(['Admin', 'Warehouse']) ? 10 : 8" class="text-center py-12">
                    <div class="empty-state">
                      <v-icon size="52" color="grey-lighten-1" class="mb-3">mdi-package-variant-remove</v-icon>
                      <div class="text-body-1 text-slate-500 font-weight-medium">Không tìm thấy sản phẩm nào</div>
                      <div class="text-body-2 text-slate-400 mt-1">Thử thay đổi bộ lọc hoặc tìm kiếm với từ khóa khác</div>
                    </div>
                  </td>
                </tr>
                <!-- Data Rows -->
                <tr
                  v-else
                  v-for="product in productStore.products"
                  :key="product.id"
                  class="table-row-hover"
                  :class="{'row-selected': selectedProductIds.includes(product.id)}"
                >
                  <td class="px-4 py-4 whitespace-nowrap" v-if="authStore.hasRole(['Admin', 'Warehouse']) && isSelectionMode">
                    <v-checkbox-btn v-model="selectedProductIds" :value="product.id" color="primary" hide-details density="compact"></v-checkbox-btn>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span class="text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100 px-2.5 py-1 rounded-md font-mono whitespace-nowrap">
                      {{ product.code }}
                    </span>
                  </td>
                  <td class="px-6 py-4">
                    <v-avatar rounded size="40" color="grey-lighten-3" class="product-avatar">
                      <v-img v-if="product.imageUrl" :src="getImageUrl(product.imageUrl)" cover></v-img>
                      <v-icon v-else color="grey">mdi-image-outline</v-icon>
                    </v-avatar>
                  </td>
                  <td class="px-6 py-4 font-semibold text-slate-900">{{ product.name }}</td>
                  <td class="px-6 py-4 text-slate-600">{{ product.categoryName || 'Chưa phân loại' }}</td>
                  <td class="px-6 py-4 text-slate-600">{{ formatPrice(product.importPrice) }}</td>
                  <td class="px-6 py-4 font-semibold text-emerald-600">{{ formatPrice(product.salePrice) }}</td>
                  <td class="px-6 py-4">
                    <span
                      :class="product.quantityInStock >= product.minStockThreshold
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200 pulse-warning'"
                      class="inline-flex items-center text-xs font-bold px-2.5 py-0.5 rounded-full border"
                    >
                      {{ product.quantityInStock }} / {{ product.minStockThreshold }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span
                      class="status-badge"
                      :class="product.isActive ? 'status-badge--active' : 'status-badge--inactive'"
                    >
                      <span class="status-badge__dot"></span>
                      {{ product.isActive ? 'Đang bán' : 'Ngừng bán' }}
                    </span>
                  </td>
                  <td class="px-6 py-4" v-if="authStore.hasRole(['Admin', 'Warehouse'])">
                    <div class="d-flex align-center gap-1">
                      <v-btn icon size="x-small" color="info" variant="text" class="action-icon-btn" title="Xem chi tiết" @click="openDetailsDialog(product.id)">
                        <v-icon size="18">mdi-eye-outline</v-icon>
                      </v-btn>
                      <v-btn icon size="x-small" color="primary" variant="text" class="action-icon-btn" title="Sửa" @click="openEditDialog(product)">
                        <v-icon size="18">mdi-pencil-outline</v-icon>
                      </v-btn>
                      <v-btn
                        v-if="authStore.hasRole('Admin')"
                        icon size="x-small"
                        :color="product.isActive ? 'warning' : 'success'"
                        variant="text"
                        class="action-icon-btn"
                        :title="product.isActive ? 'Ngừng bán' : 'Khôi phục'"
                        @click="toggleProductStatus(product.id, product.isActive)"
                      >
                        <v-icon size="18">{{ product.isActive ? 'mdi-pause-circle-outline' : 'mdi-play-circle-outline' }}</v-icon>
                      </v-btn>
                      <v-btn
                        v-if="authStore.hasRole('Admin') && !product.hasTransactions"
                        icon size="x-small" color="error" variant="text"
                        class="action-icon-btn"
                        title="Xóa vĩnh viễn"
                        @click="handleSingleDelete(product.id)"
                      >
                        <v-icon size="18">mdi-trash-can-outline</v-icon>
                      </v-btn>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Smart Pagination -->
          <div class="d-flex align-center justify-space-between mt-5 flex-wrap gap-3" v-if="productStore.totalPages > 0">
            <span class="text-body-2 text-slate-500">
              Hiển thị <b>{{ paginationInfo.start }}-{{ paginationInfo.end }}</b> / <b>{{ paginationInfo.total }}</b> sản phẩm
            </span>
            <div class="custom-pagination d-flex align-center gap-1" v-if="productStore.totalPages > 1">
              <button class="pagination-btn" :disabled="productStore.currentPage === 1" @click="loadProductsWithFilters(productStore.currentPage - 1)">‹</button>
              <template v-for="page in productPaginationRange" :key="`ppag-${page}`">
                <span v-if="page === '...'" class="pagination-ellipsis">…</span>
                <button v-else class="pagination-btn" :class="{ active: productStore.currentPage === page }" @click="loadProductsWithFilters(page)">{{ page }}</button>
              </template>
              <button class="pagination-btn" :disabled="productStore.currentPage === productStore.totalPages" @click="loadProductsWithFilters(productStore.currentPage + 1)">›</button>
            </div>
          </div>

        </v-window-item>

        <!-- ─────────────────────────────────────────────────── -->
        <!--  CATEGORIES TAB                                     -->
        <!-- ─────────────────────────────────────────────────── -->
        <v-window-item value="categories">
          <div class="d-flex justify-space-between align-center mb-6 flex-wrap gap-4">
            <h3 class="text-h6 font-weight-bold text-slate-900 d-flex align-center" style="gap:8px">
              <v-icon color="primary">mdi-file-tree-outline</v-icon>
              Quản lý Cây danh mục sản phẩm
            </h3>
            <v-btn
              v-if="authStore.hasRole(['Admin', 'Warehouse'])"
              color="primary"
              prepend-icon="mdi-plus"
              class="rounded-xl shadow-md px-6 py-2 btn-hover-lift"
              elevation="2"
              @click="openCreateCategoryDialog"
            >
              Thêm danh mục mới
            </v-btn>
          </div>

          <div class="overflow-x-auto rounded-xl border border-slate-200 bg-white data-table-wrap">
            <table class="w-full text-left border-collapse text-slate-700 data-table">
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
                <!-- Skeleton -->
                <template v-if="productStore.categoriesLoading">
                  <tr v-for="n in 4" :key="`skel-cat-${n}`" class="skeleton-row">
                    <td class="px-6 py-4"><div class="skeleton" style="width:40px;height:14px;border-radius:4px"></div></td>
                    <td class="px-6 py-4"><div class="skeleton" style="width:130px;height:14px;border-radius:4px"></div></td>
                    <td class="px-6 py-4"><div class="skeleton" style="width:160px;height:14px;border-radius:4px"></div></td>
                    <td class="px-6 py-4"><div class="skeleton" style="width:30px;height:14px;border-radius:4px"></div></td>
                    <td class="px-6 py-4"><div class="skeleton" style="width:80px;height:22px;border-radius:12px"></div></td>
                    <td class="px-6 py-4" v-if="authStore.hasRole(['Admin', 'Warehouse'])"><div class="skeleton" style="width:64px;height:24px;border-radius:4px"></div></td>
                  </tr>
                </template>
                <!-- Empty -->
                <tr v-else-if="flatCategoriesList.length === 0">
                  <td colspan="6" class="text-center py-12">
                    <div class="empty-state">
                      <v-icon size="48" color="grey-lighten-1" class="mb-3">mdi-folder-open-outline</v-icon>
                      <div class="text-body-1 text-slate-500 font-weight-medium">Không có danh mục nào</div>
                      <div class="text-body-2 text-slate-400 mt-1">Bắt đầu bằng cách tạo danh mục đầu tiên</div>
                    </div>
                  </td>
                </tr>
                <!-- Data -->
                <template v-else v-for="cat in parentCategoriesList" :key="cat.id">
                  <tr class="table-row-hover">
                    <td class="px-6 py-4 font-mono text-sm text-slate-450">#{{ cat.id }}</td>
                    <td class="px-6 py-4">
                      <div class="d-flex align-center gap-2">
                        <v-btn v-if="cat.children && cat.children.length > 0" icon size="x-small" variant="text" color="primary" @click="toggleCategoryExpand(cat.id)" class="action-icon-btn">
                          <v-icon>{{ expandedCategories[cat.id] ? 'mdi-chevron-down' : 'mdi-chevron-right' }}</v-icon>
                        </v-btn>
                        <div v-else style="width:32px"></div>
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
                        <v-btn icon size="x-small" color="primary" variant="text" class="me-2 action-icon-btn" @click="openEditCategoryDialog(cat)">
                          <v-icon>mdi-pencil-outline</v-icon>
                        </v-btn>
                        <v-btn v-if="authStore.hasRole('Admin')" icon size="x-small" color="error" variant="text" class="action-icon-btn" @click="handleDeleteCategory(cat.id)">
                          <v-icon>mdi-trash-can-outline</v-icon>
                        </v-btn>
                      </div>
                    </td>
                  </tr>

                  <!-- Recursive child categories -->
                  <template v-if="expandedCategories[cat.id] && cat.children && cat.children.length > 0">
                    <tr
                      v-for="item in flattenChildren(cat.children, cat.name, 1)"
                      :key="`flat-${item.id}`"
                      class="bg-slate-50/30 table-row-hover"
                    >
                      <td class="px-6 py-4 font-mono text-sm text-slate-450">#{{ item.id }}</td>
                      <td class="px-6 py-4">
                        <div class="d-flex align-center gap-2" :style="{ marginLeft: `${item.depth * 40}px` }">
                          <v-btn
                            v-if="item.children && item.children.length > 0"
                            icon size="x-small" variant="text" color="primary"
                            @click="toggleCategoryExpand(item.id)"
                            class="action-icon-btn"
                          >
                            <v-icon>{{ expandedCategories[item.id] ? 'mdi-chevron-down' : 'mdi-chevron-right' }}</v-icon>
                          </v-btn>
                          <div v-else style="width:32px"></div>
                          <span class="font-semibold text-slate-700">{{ item.name }}</span>
                        </div>
                      </td>
                      <td class="px-6 py-4 text-slate-600 text-sm">{{ item.description || '-' }}</td>
                      <td class="px-6 py-4 font-mono text-sm">{{ item.sortOrder }}</td>
                      <td class="px-6 py-4">
                        <span class="text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200 px-2.5 py-0.5 rounded-full">
                          {{ item.parentName }}
                        </span>
                      </td>
                      <td class="px-6 py-4" v-if="authStore.hasRole(['Admin', 'Warehouse'])">
                        <div class="d-flex align-center">
                          <v-btn icon size="x-small" color="primary" variant="text" class="me-2 action-icon-btn" @click="openEditCategoryDialog(item)">
                            <v-icon>mdi-pencil-outline</v-icon>
                          </v-btn>
                          <v-btn v-if="authStore.hasRole('Admin')" icon size="x-small" color="error" variant="text" class="action-icon-btn" @click="handleDeleteCategory(item.id)">
                            <v-icon>mdi-trash-can-outline</v-icon>
                          </v-btn>
                        </div>
                      </td>
                    </tr>
                  </template>
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

        <!-- ─────────────────────────────────────────────────── -->
        <!--  STOCK TAB                                          -->
        <!-- ─────────────────────────────────────────────────── -->
        <v-window-item value="stock">
          <v-row class="mb-6 align-center">
            <v-col cols="12" sm="auto">
              <h3 class="text-h6 font-weight-bold text-slate-900 d-flex align-center" style="gap:8px">
                <v-icon color="primary">mdi-warehouse</v-icon>
                Danh sách Phiếu nhập kho
              </h3>
            </v-col>
            <v-spacer></v-spacer>
            <v-col cols="12" sm="3">
              <v-select
                v-model="filterReceiptStatus"
                :items="[
                  { value: '', title: 'Tất cả trạng thái' },
                  { value: 'Draft', title: 'Bản nháp' },
                  { value: 'Confirmed', title: 'Đã duyệt' }
                ]"
                item-title="title"
                item-value="value"
                label="Lọc theo trạng thái"
                variant="outlined"
                density="compact"
                hide-details
                color="primary"
                rounded="xl"
              ></v-select>
            </v-col>
            <v-col cols="auto" v-if="authStore.hasRole(['Admin', 'Warehouse'])">
              <v-btn
                color="primary"
                prepend-icon="mdi-plus"
                class="rounded-xl shadow-md px-6 py-2 btn-hover-lift"
                elevation="2"
                @click="openReceiptDialog"
              >
                Tạo phiếu nhập mới
              </v-btn>
            </v-col>
          </v-row>

          <div class="overflow-x-auto rounded-xl border border-slate-200 bg-white data-table-wrap">
            <table class="w-full text-left border-collapse text-slate-700 data-table">
              <thead>
                <tr class="bg-slate-50 border-b border-slate-200">
                  <th class="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Mã phiếu</th>
                  <th class="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Nhà cung cấp</th>
                  <th class="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Tổng tiền</th>
                  <th class="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Người tạo</th>
                  <th class="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Trạng thái</th>
                  <th class="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Ngày lập</th>
                  <th class="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Hành động</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                <!-- Skeleton -->
                <template v-if="productStore.receiptsLoading">
                  <tr v-for="n in 4" :key="`skel-rec-${n}`" class="skeleton-row">
                    <td class="px-6 py-4"><div class="skeleton" style="width:90px;height:14px;border-radius:4px"></div></td>
                    <td class="px-6 py-4"><div class="skeleton" style="width:120px;height:14px;border-radius:4px"></div></td>
                    <td class="px-6 py-4"><div class="skeleton" style="width:90px;height:14px;border-radius:4px"></div></td>
                    <td class="px-6 py-4"><div class="skeleton" style="width:100px;height:14px;border-radius:4px"></div></td>
                    <td class="px-6 py-4"><div class="skeleton" style="width:68px;height:22px;border-radius:12px"></div></td>
                    <td class="px-6 py-4"><div class="skeleton" style="width:110px;height:14px;border-radius:4px"></div></td>
                    <td class="px-6 py-4"><div class="skeleton" style="width:80px;height:24px;border-radius:4px"></div></td>
                  </tr>
                </template>
                <!-- Empty -->
                <tr v-else-if="productStore.receipts.length === 0">
                  <td colspan="7" class="text-center py-12">
                    <div class="empty-state">
                      <v-icon size="48" color="grey-lighten-1" class="mb-3">mdi-receipt-text-remove-outline</v-icon>
                      <div class="text-body-1 text-slate-500 font-weight-medium">Không có phiếu nhập kho nào</div>
                      <div class="text-body-2 text-slate-400 mt-1">Tạo phiếu nhập mới để bắt đầu quản lý kho hàng</div>
                    </div>
                  </td>
                </tr>
                <!-- Data -->
                <tr v-else v-for="receipt in productStore.receipts" :key="receipt.id" class="table-row-hover">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span class="font-mono font-bold text-blue-600 whitespace-nowrap">{{ receipt.receiptCode }}</span>
                  </td>
                  <td class="px-6 py-4 font-semibold text-slate-900">{{ receipt.supplierName || 'Mặc định' }}</td>
                  <td class="px-6 py-4 text-slate-700 font-medium whitespace-nowrap">{{ formatPrice(receipt.totalAmount) }}</td>
                  <td class="px-6 py-4 text-slate-600 text-sm whitespace-nowrap">{{ getUserName(receipt.createdBy) }}</td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span
                      :class="receipt.status === 'Confirmed'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'"
                      class="inline-flex items-center text-xs font-bold px-2.5 py-0.5 rounded-full border whitespace-nowrap"
                    >
                      {{ receipt.status === 'Confirmed' ? 'Đã duyệt' : 'Bản nháp' }}
                    </span>
                  </td>
                  <td class="px-6 py-4 text-sm text-slate-500 whitespace-nowrap">{{ formatDate(receipt.createdAt) }}</td>
                  <td class="px-6 py-4">
                    <div class="d-flex align-center gap-2">
                      <v-btn icon size="x-small" color="info" variant="text" class="action-icon-btn" @click="viewReceiptDetails(receipt)" title="Xem chi tiết">
                        <v-icon>mdi-eye-outline</v-icon>
                      </v-btn>
                      <template v-if="receipt.status !== 'Confirmed'">
                        <v-btn
                          v-if="authStore.hasRole('Admin')"
                          size="x-small" color="success" variant="flat"
                          class="rounded-lg shadow-sm text-white font-weight-bold me-1"
                          @click="handleConfirmReceipt(receipt.id)" title="Duyệt phiếu"
                        >
                          Duyệt
                        </v-btn>
                        <template v-if="authStore.hasRole(['Admin', 'Warehouse'])">
                          <v-btn icon size="x-small" color="primary" variant="text" class="action-icon-btn" @click="openEditReceiptDialog(receipt)" title="Sửa phiếu nháp">
                            <v-icon>mdi-pencil-outline</v-icon>
                          </v-btn>
                          <v-btn icon size="x-small" color="error" variant="text" class="action-icon-btn" @click="handleDeleteReceipt(receipt.id)" title="Xóa phiếu nháp">
                            <v-icon>mdi-trash-can-outline</v-icon>
                          </v-btn>
                        </template>
                      </template>
                      <span v-if="receipt.status === 'Confirmed' && !authStore.hasRole('Admin')" class="text-slate-400 text-sm">Đã duyệt</span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Receipts Pagination -->
          <div class="d-flex align-center justify-space-between mt-5 flex-wrap gap-3" v-if="productStore.receiptsTotalPages > 0">
            <span class="text-body-2 text-slate-500">
              Hiển thị <b>{{ receiptPaginationInfo.start }}-{{ receiptPaginationInfo.end }}</b> / <b>{{ receiptPaginationInfo.total }}</b> phiếu nhập
            </span>
            <div class="custom-pagination d-flex align-center gap-1" v-if="productStore.receiptsTotalPages > 1">
              <button class="pagination-btn" :disabled="productStore.receiptsCurrentPage === 1" @click="productStore.fetchReceipts(productStore.receiptsCurrentPage - 1, filterReceiptStatus)">‹</button>
              <template v-for="page in receiptPaginationRange" :key="`rpag-${page}`">
                <span v-if="page === '...'" class="pagination-ellipsis">…</span>
                <button v-else class="pagination-btn" :class="{ active: productStore.receiptsCurrentPage === page }" @click="productStore.fetchReceipts(page, filterReceiptStatus)">{{ page }}</button>
              </template>
              <button class="pagination-btn" :disabled="productStore.receiptsCurrentPage === productStore.receiptsTotalPages" @click="productStore.fetchReceipts(productStore.receiptsCurrentPage + 1, filterReceiptStatus)">›</button>
            </div>
          </div>
        </v-window-item>
      </v-window>
    </v-card>

    <!-- ═══════════════════════════════════════════════════════════ -->
    <!--  DIALOG: THÊM / SỬA SẢN PHẨM                             -->
    <!-- ═══════════════════════════════════════════════════════════ -->
    <v-dialog v-model="showDialog" max-width="620px" persistent>
      <v-card class="glass-card text-slate-850 dialog-enter" rounded="xl">
        <v-card-title class="d-flex justify-space-between align-center px-6 py-4 border-bottom">
          <span class="text-h5 font-weight-black">{{ dialogTitle }}</span>
          <v-btn icon variant="text" @click="showDialog = false"><v-icon>mdi-close</v-icon></v-btn>
        </v-card-title>
        <v-card-text class="pa-6">
          <v-form ref="productForm" v-model="formValid">
            <v-row>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="editingProduct.code"
                  label="Mã sản phẩm *"
                  variant="outlined" density="compact" color="primary"
                  :rules="[v => !!v || 'Mã sản phẩm là bắt buộc']"
                  :disabled="isEditMode"
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="editingProduct.name"
                  label="Tên sản phẩm *"
                  variant="outlined" density="compact" color="primary"
                  :rules="[v => !!v || 'Tên sản phẩm là bắt buộc']"
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-textarea
                  v-model="editingProduct.description"
                  label="Mô tả sản phẩm"
                  variant="outlined" density="compact" color="primary" rows="3"
                ></v-textarea>
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model.number="editingProduct.importPrice"
                  label="Giá nhập *"
                  type="number" variant="outlined" density="compact" color="primary"
                  prefix="₫"
                  :rules="[
                    v => v !== null && v !== '' || 'Giá nhập là bắt buộc',
                    v => v >= 0 || 'Giá nhập không được âm'
                  ]"
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model.number="editingProduct.salePrice"
                  label="Giá bán *"
                  type="number" variant="outlined" density="compact" color="primary"
                  prefix="₫"
                  :rules="[
                    v => v !== null && v !== '' || 'Giá bán là bắt buộc',
                    v => v >= 0 || 'Giá bán không được âm',
                    v => v >= editingProduct.importPrice || 'Giá bán phải ≥ giá nhập'
                  ]"
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <v-select
                  v-model="editingProduct.categoryId"
                  :items="flatCategories"
                  item-title="name" item-value="id"
                  label="Danh mục *"
                  variant="outlined" density="compact" color="primary"
                  :rules="[v => !!v || 'Danh mục là bắt buộc']"
                ></v-select>
              </v-col>
              <v-col cols="12" sm="6">
                <v-file-input
                  v-model="imageFile"
                  label="Hình ảnh sản phẩm"
                  accept="image/*" variant="outlined" density="compact" color="primary"
                  prepend-icon="mdi-camera" show-size
                ></v-file-input>
              </v-col>
              <!-- Image Preview -->
              <v-col cols="12" v-if="imagePreviewUrl || editingProduct.imageUrl">
                <div class="d-flex align-center gap-4">
                  <div v-if="imagePreviewUrl" class="image-preview-box">
                    <div class="text-caption text-slate-500 mb-1 font-weight-medium">Ảnh mới:</div>
                    <v-img :src="imagePreviewUrl" max-height="100" max-width="100" class="rounded-lg border bg-slate-50" cover></v-img>
                  </div>
                  <div v-if="editingProduct.imageUrl && !imagePreviewUrl" class="image-preview-box">
                    <div class="text-caption text-slate-500 mb-1 font-weight-medium">Ảnh hiện tại:</div>
                    <v-img :src="getImageUrl(editingProduct.imageUrl)" max-height="100" max-width="100" class="rounded-lg border bg-slate-50" cover></v-img>
                  </div>
                </div>
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model.number="editingProduct.minStockThreshold"
                  label="Ngưỡng cảnh báo tồn kho"
                  type="number" variant="outlined" density="compact" color="primary"
                  :rules="[v => v >= 0 || 'Ngưỡng không được âm']"
                ></v-text-field>
              </v-col>
              <v-col cols="12" v-if="!isEditMode">
                <v-text-field
                  v-model.number="editingProduct.initialStock"
                  label="Số lượng tồn kho ban đầu"
                  type="number" variant="outlined" density="compact" color="primary"
                  :rules="[v => v >= 0 || 'Số lượng không được âm']"
                ></v-text-field>
              </v-col>
              <v-col cols="12" v-if="isEditMode">
                <v-switch v-model="editingProduct.isActive" label="Hoạt động" color="primary"></v-switch>
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

    <!-- ═══════════════════════════════════════════════════════════ -->
    <!--  DIALOG: THÊM / SỬA PHIẾU NHẬP KHO                       -->
    <!-- ═══════════════════════════════════════════════════════════ -->
    <v-dialog v-model="showReceiptDialog" max-width="800px" persistent>
      <v-card class="glass-card text-slate-850 dialog-enter" rounded="xl">
        <v-card-title class="d-flex justify-space-between align-center px-6 py-4 border-bottom">
          <span class="text-h5 font-weight-black">{{ isEditReceipt ? 'Cập Nhật Phiếu Nhập Kho' : 'Tạo Phiếu Nhập Kho Mới' }}</span>
          <v-btn icon variant="text" @click="showReceiptDialog = false"><v-icon>mdi-close</v-icon></v-btn>
        </v-card-title>
        <v-card-text class="pa-6">
          <v-form ref="receiptForm" v-model="receiptFormValid">
            <v-row>
              <v-col cols="12" sm="6">
                <v-combobox
                  v-model="newReceipt.supplierName"
                  :items="supplierNames"
                  label="Nhà cung cấp *"
                  variant="outlined" density="compact" color="primary"
                  :rules="[v => !!v || 'Nhà cung cấp là bắt buộc']"
                  :loading="orderStore.suppliersLoading"
                  clearable
                ></v-combobox>
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="newReceipt.note"
                  label="Ghi chú"
                  variant="outlined" density="compact" color="primary"
                ></v-text-field>
              </v-col>
            </v-row>

            <div class="d-flex justify-space-between align-center my-4">
              <span class="text-subtitle-1 font-weight-bold">Danh sách mặt hàng nhập</span>
              <v-btn color="secondary" size="small" prepend-icon="mdi-plus" class="rounded-lg text-none" @click="addReceiptItem">Thêm dòng</v-btn>
            </div>

            <v-row v-for="(item, index) in newReceipt.items" :key="index" class="align-center">
              <v-col cols="12" sm="5">
                <v-select
                  v-model="item.productId"
                  :items="productStore.allProducts"
                  item-title="name" item-value="id"
                  label="Chọn sản phẩm *"
                  variant="outlined" density="compact" color="primary"
                  :rules="[v => !!v || 'Sản phẩm là bắt buộc']"
                  @update:modelValue="() => onProductSelected(item)"
                ></v-select>
              </v-col>
              <v-col cols="12" sm="3">
                <v-text-field
                  v-model.number="item.quantity"
                  label="Số lượng *"
                  type="number" variant="outlined" density="compact" color="primary"
                  :rules="[v => v > 0 || 'Số lượng > 0']"
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="3">
                <v-text-field
                  v-model.number="item.importPrice"
                  label="Giá nhập *"
                  type="number" variant="outlined" density="compact" color="primary"
                  prefix="₫"
                  :rules="[v => v >= 0 || 'Giá không âm']"
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="1" class="text-center">
                <v-btn icon color="error" variant="text" size="small" @click="removeReceiptItem(index)" :disabled="newReceipt.items.length === 1">
                  <v-icon>mdi-delete</v-icon>
                </v-btn>
              </v-col>
            </v-row>

            <!-- Receipt Total Preview -->
            <div class="d-flex justify-end mt-2" v-if="newReceipt.items.length > 0">
              <div class="bg-slate-50 border border-slate-200 rounded-lg px-4 py-2">
                <span class="text-body-2 text-slate-500">Tổng ước tính: </span>
                <span class="font-weight-bold text-emerald-600">{{ formatPrice(receiptItemsTotal) }}</span>
              </div>
            </div>
          </v-form>
        </v-card-text>
        <v-card-actions class="px-6 pb-6 pt-0">
          <v-spacer></v-spacer>
          <v-btn variant="outlined" rounded="xl" color="slate-500" class="px-5 font-weight-bold border-slate-300" @click="showReceiptDialog = false">Hủy</v-btn>
          <v-btn variant="elevated" rounded="xl" color="primary" class="px-5 font-weight-bold text-white shadow-md shadow-primary/20" :disabled="!receiptFormValid" :loading="receiptSaveLoading" @click="saveReceipt">Lưu phiếu</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- ═══════════════════════════════════════════════════════════ -->
    <!--  DIALOG: XEM CHI TIẾT PHIẾU NHẬP KHO                      -->
    <!-- ═══════════════════════════════════════════════════════════ -->
    <v-dialog v-model="showReceiptDetailDialog" max-width="750px">
      <v-card class="rounded-xl shadow-xl border border-slate-100 dialog-enter">
        <v-card-title class="px-6 py-4 border-b border-slate-100 bg-slate-50 d-flex justify-space-between align-center">
          <span class="text-h6 font-bold text-slate-800">Chi tiết Phiếu nhập kho</span>
          <v-btn icon="mdi-close" variant="text" size="small" @click="showReceiptDetailDialog = false"></v-btn>
        </v-card-title>
        <v-card-text class="pa-6" v-if="selectedReceiptDetail">
          <div class="grid grid-cols-2 gap-4 mb-6">
            <div>
              <div class="text-xs text-slate-500 font-semibold uppercase">Mã phiếu</div>
              <div class="text-md font-mono font-bold text-blue-700">{{ selectedReceiptDetail.receiptCode }}</div>
            </div>
            <div>
              <div class="text-xs text-slate-500 font-semibold uppercase">Nhà cung cấp</div>
              <div class="text-md font-semibold text-slate-900">{{ selectedReceiptDetail.supplierName || 'Mặc định' }}</div>
            </div>
            <div>
              <div class="text-xs text-slate-500 font-semibold uppercase">Trạng thái</div>
              <div>
                <span :class="selectedReceiptDetail.status === 'Confirmed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'" class="inline-flex items-center text-xs font-bold px-2.5 py-0.5 rounded-full border">
                  {{ selectedReceiptDetail.status === 'Confirmed' ? 'Đã duyệt' : 'Bản nháp' }}
                </span>
              </div>
            </div>
            <div>
              <div class="text-xs text-slate-500 font-semibold uppercase">Ngày lập</div>
              <div class="text-md text-slate-700">{{ formatDate(selectedReceiptDetail.createdAt) }}</div>
            </div>
            <div>
              <div class="text-xs text-slate-500 font-semibold uppercase">Người tạo</div>
              <div class="text-md font-semibold text-slate-900">{{ getUserName(selectedReceiptDetail.createdBy) }}</div>
            </div>
            <div v-if="selectedReceiptDetail.status === 'Confirmed'">
              <div class="text-xs text-slate-500 font-semibold uppercase">Người duyệt</div>
              <div class="text-md font-semibold text-slate-900">{{ getUserName(selectedReceiptDetail.confirmedBy) }}</div>
            </div>
            <div>
              <div class="text-xs text-slate-500 font-semibold uppercase">Ghi chú</div>
              <div class="text-md text-slate-600">{{ selectedReceiptDetail.note || '-' }}</div>
            </div>
          </div>

          <div class="text-subtitle-1 font-weight-bold mb-3">Danh sách mặt hàng</div>
          <div class="overflow-x-auto rounded-xl border border-slate-200 bg-white">
            <table class="w-full text-left border-collapse text-slate-700 text-sm">
              <thead>
                <tr class="bg-slate-50 border-b border-slate-200">
                  <th class="px-4 py-3 font-semibold text-slate-500">Sản phẩm</th>
                  <th class="px-4 py-3 font-semibold text-slate-500 text-right">Số lượng</th>
                  <th class="px-4 py-3 font-semibold text-slate-500 text-right">Đơn giá nhập</th>
                  <th class="px-4 py-3 font-semibold text-slate-500 text-right">Thành tiền</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                <tr v-for="item in selectedReceiptDetail.items" :key="item.id" class="hover:bg-slate-50/50">
                  <td class="px-4 py-3 font-medium text-slate-900">{{ getProductName(item.productId) }}</td>
                  <td class="px-4 py-3 text-right">{{ item.quantity }}</td>
                  <td class="px-4 py-3 text-right">{{ formatPrice(item.importPrice) }}</td>
                  <td class="px-4 py-3 text-right font-semibold text-slate-900">{{ formatPrice(item.subTotal) }}</td>
                </tr>
                <tr class="bg-slate-50 font-bold border-t border-slate-200">
                  <td colspan="3" class="px-4 py-3 text-right">Tổng tiền:</td>
                  <td class="px-4 py-3 text-right text-emerald-600">{{ formatPrice(selectedReceiptDetail.totalAmount) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </v-card-text>
        <v-card-actions class="px-6 py-4 border-t border-slate-100 bg-slate-50">
          <v-spacer></v-spacer>
          <v-btn color="slate-600" variant="text" class="text-none px-4" @click="showReceiptDetailDialog = false">Đóng</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- ═══════════════════════════════════════════════════════════ -->
    <!--  DIALOG: THÊM / SỬA DANH MỤC                              -->
    <!-- ═══════════════════════════════════════════════════════════ -->
    <v-dialog v-model="showCategoryDialog" max-width="500px" persistent>
      <v-card class="glass-card text-slate-850 dialog-enter" rounded="xl">
        <v-card-title class="d-flex justify-space-between align-center px-6 py-4 border-bottom">
          <span class="text-h5 font-weight-black">{{ categoryDialogTitle }}</span>
          <v-btn icon variant="text" @click="showCategoryDialog = false"><v-icon>mdi-close</v-icon></v-btn>
        </v-card-title>
        <v-card-text class="pa-6">
          <v-form ref="categoryForm" v-model="categoryFormValid">
            <v-row>
              <v-col cols="12">
                <v-text-field
                  v-model="editingCategory.name"
                  label="Tên danh mục *"
                  variant="outlined" density="compact" color="primary"
                  :rules="[v => !!v || 'Tên danh mục là bắt buộc']"
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-textarea
                  v-model="editingCategory.description"
                  label="Mô tả danh mục"
                  variant="outlined" density="compact" color="primary" rows="3"
                ></v-textarea>
              </v-col>
              <v-col cols="12" sm="8">
                <v-select
                  v-model="editingCategory.parentCategoryId"
                  :items="availableParentCategories"
                  item-title="name" item-value="id"
                  label="Danh mục cha (Tùy chọn)"
                  variant="outlined" density="compact" color="primary"
                  clearable
                ></v-select>
              </v-col>
              <v-col cols="12" sm="4">
                <v-text-field
                  v-model.number="editingCategory.sortOrder"
                  label="Thứ tự"
                  type="number" variant="outlined" density="compact" color="primary"
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

    <!-- ═══════════════════════════════════════════════════════════ -->
    <!--  DIALOG: CHI TIẾT SẢN PHẨM                                -->
    <!-- ═══════════════════════════════════════════════════════════ -->
    <v-dialog v-model="detailsDialog" max-width="900" persistent>
      <v-card class="rounded-xl shadow-xl border border-slate-100 dialog-enter">
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
              <div v-if="detailsLoading" class="p-8 d-flex justify-center align-center">
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
                <div class="mb-4 d-flex gap-4 flex-wrap">
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

    <!-- ═══════════════════════════════════════════════════════════ -->
    <!--  CUSTOM CONFIRM DIALOG (thay thế window.confirm)           -->
    <!-- ═══════════════════════════════════════════════════════════ -->
    <v-dialog v-model="confirmDialogVisible" max-width="440" persistent>
      <v-card class="rounded-xl dialog-enter" style="overflow:hidden">
        <div class="confirm-dialog__header" :class="`confirm-dialog__header--${confirmDialogState.severity}`">
          <v-icon size="36" color="white">{{ confirmDialogState.icon }}</v-icon>
        </div>
        <v-card-text class="text-center pt-5 pb-2 px-6">
          <h3 class="text-h6 font-weight-bold text-slate-900 mb-2">{{ confirmDialogState.title }}</h3>
          <p class="text-body-2 text-slate-600">{{ confirmDialogState.message }}</p>
        </v-card-text>
        <v-card-actions class="px-6 pb-5 pt-2 justify-center" style="gap:12px">
          <v-btn variant="outlined" rounded="xl" color="slate" class="px-6 text-none font-weight-bold" @click="resolveConfirmDialog(false)">Hủy bỏ</v-btn>
          <v-btn variant="elevated" rounded="xl" :color="confirmDialogState.severity === 'error' ? 'error' : 'warning'" class="px-6 text-none font-weight-bold text-white" @click="resolveConfirmDialog(true)">{{ confirmDialogState.confirmText }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- ═══════════════════════════════════════════════════════════ -->
    <!--  ENHANCED SNACKBAR                                         -->
    <!-- ═══════════════════════════════════════════════════════════ -->
    <v-snackbar v-model="snackbar" :color="snackbarColor" timeout="3500" location="top right" rounded="lg" class="enhanced-snackbar">
      <div class="d-flex align-center" style="gap:8px">
        <v-icon size="20">{{ snackbarIcon }}</v-icon>
        <span class="font-weight-medium">{{ snackbarText }}</span>
      </div>
      <template v-slot:actions>
        <v-btn icon size="x-small" variant="text" @click="snackbar = false">
          <v-icon size="16">mdi-close</v-icon>
        </v-btn>
      </template>
    </v-snackbar>
    <!-- ═══════════════════════════════════════════════════════════ -->
    <!--  FLOATING BULK ACTION BAR (Viewport Fixed)                 -->
    <!-- ═══════════════════════════════════════════════════════════ -->
    <v-slide-y-reverse-transition>
      <div v-if="selectedProductIds.length > 0" class="bulk-action-bar">
        <div class="bulk-action-bar__inner">
          <div class="bulk-action-bar__count">
            <v-icon size="18" class="mr-1" color="white">mdi-checkbox-marked-circle</v-icon>
            Đã chọn <span class="bulk-action-bar__number">{{ selectedProductIds.length }}</span> sản phẩm
          </div>
          <div class="bulk-action-bar__divider"></div>
          <div class="d-flex align-center gap-2">
            <v-btn
              v-if="hasActiveSelected"
              size="small"
              color="warning"
              prepend-icon="mdi-pause-circle-outline"
              variant="flat"
              class="rounded-xl text-none px-4"
              @click="handleBulkDeactivate"
            >
              Ngừng bán ({{ activeSelectedIds.length }})
            </v-btn>
            <v-btn
              v-if="hasInactiveSelected"
              size="small"
              color="success"
              prepend-icon="mdi-play-circle-outline"
              variant="flat"
              class="rounded-xl text-none px-4"
              @click="handleBulkActivate"
            >
              Bán lại ({{ inactiveSelectedIds.length }})
            </v-btn>
            <v-btn
              v-if="authStore.hasRole('Admin') && hasDeletableSelected"
              size="small"
              color="error"
              prepend-icon="mdi-trash-can-outline"
              variant="flat"
              class="rounded-xl text-none px-4"
              @click="handleBulkDelete"
            >
              Xóa vĩnh viễn ({{ deletableSelectedIds.length }})
            </v-btn>
          </div>
          <v-btn icon="mdi-close" variant="text" size="small" color="white" class="ml-2" @click="selectedProductIds = []"></v-btn>
        </div>
      </div>
    </v-slide-y-reverse-transition>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from 'vue';
import { useProductStore } from '../../stores/product';
import { useAuthStore } from '../../stores/auth';
import { useOrderStore } from '../../stores/order';
import { useUserStore } from '../../stores/user';
import api from '../../config/api';

// ═══════════════════════════════════════════════════════════════
//  STORE INSTANCES
// ═══════════════════════════════════════════════════════════════
const productStore = useProductStore();
const authStore = useAuthStore();
const orderStore = useOrderStore();
const userStore = useUserStore();

// ═══════════════════════════════════════════════════════════════
//  TAB & FILTER STATE
// ═══════════════════════════════════════════════════════════════
const tab = ref('products');
const searchProduct = ref('');
const showFilters = ref(false);

// Filters
const filterCategory = ref(null);
const filterStatus = ref('');
const filterReceiptStatus = ref('');

const activeFilterCount = computed(() => {
  let count = 0;
  if (filterCategory.value) count++;
  if (filterStatus.value) count++;
  return count;
});

const clearProductFilters = () => {
  filterCategory.value = null;
  filterStatus.value = '';
};

// ═══════════════════════════════════════════════════════════════
//  DASHBOARD STATS (COMPACT)
// ═══════════════════════════════════════════════════════════════
const dashboardCards = computed(() => [
  { key: 'total', variant: 'total', icon: 'mdi-package-variant', value: productStore.totalProducts, label: 'Tổng sản phẩm' },
  { key: 'categories', variant: 'active', icon: 'mdi-shape-outline', value: productStore.categoriesTotal || flatCategories.value.length, label: 'Danh mục' },
  { key: 'receipts', variant: 'info', icon: 'mdi-receipt-text-outline', value: productStore.receiptsTotal, label: 'Phiếu nhập kho' },
  { key: 'lowStock', variant: 'warning', icon: 'mdi-alert-outline', value: productStore.lowStockProducts.length, label: 'Sắp hết hàng' },
]);

const selectedProductIds = ref([]);
const isSelectionMode = ref(false);

const toggleSelectionMode = () => {
  isSelectionMode.value = !isSelectionMode.value;
  if (!isSelectionMode.value) {
    selectedProductIds.value = [];
  }
};

const isAllSelected = computed({
  get() {
    return productStore.products.length > 0 && selectedProductIds.value.length === productStore.products.length;
  },
  set(val) {
    selectedProductIds.value = val ? productStore.products.map(p => p.id) : [];
  }
});

const selectedProducts = computed(() => {
  return productStore.products.filter(p => selectedProductIds.value.includes(p.id));
});

const activeSelectedIds = computed(() => {
  return selectedProducts.value.filter(p => p.isActive).map(p => p.id);
});

const inactiveSelectedIds = computed(() => {
  return selectedProducts.value.filter(p => !p.isActive).map(p => p.id);
});

const deletableSelectedIds = computed(() => {
  return selectedProducts.value.filter(p => !p.hasTransactions).map(p => p.id);
});

const hasActiveSelected = computed(() => activeSelectedIds.value.length > 0);
const hasInactiveSelected = computed(() => inactiveSelectedIds.value.length > 0);
const hasDeletableSelected = computed(() => deletableSelectedIds.value.length > 0);

// ═══════════════════════════════════════════════════════════════
//  CATEGORY HELPERS
// ═══════════════════════════════════════════════════════════════
const categorySelectItems = computed(() => {
  return [{ id: null, name: 'Tất cả danh mục' }, ...flatCategories.value];
});

const flatCategories = computed(() => {
  const result = [];
  const recurse = (nodes) => {
    for (const node of nodes) {
      result.push({ id: node.id, name: node.name });
      if (node.children && node.children.length > 0) recurse(node.children);
    }
  };
  recurse(productStore.categories);
  return result;
});

const flatCategoriesList = computed(() => {
  const result = [];
  const recurse = (nodes, parentName = null, depth = 0) => {
    for (const node of nodes) {
      result.push({
        id: node.id, name: node.name, description: node.description,
        parentCategoryId: node.parentCategoryId, sortOrder: node.sortOrder || 0,
        parent: parentName, depth
      });
      if (node.children && node.children.length > 0) recurse(node.children, node.name, depth + 1);
    }
  };
  recurse(productStore.categories);
  return result;
});

const parentCategoriesList = computed(() => productStore.categories || []);

const expandedCategories = ref({});
const toggleCategoryExpand = (categoryId) => {
  const updated = { ...expandedCategories.value };
  updated[categoryId] = !updated[categoryId];
  expandedCategories.value = updated;
};

const flattenChildren = (nodes = [], parentName, depth = 1) => {
  const result = [];
  if (!nodes) return result;
  for (const node of nodes) {
    result.push({ ...node, parentName, depth });
    if (expandedCategories.value[node.id] && node.children && node.children.length > 0) {
      result.push(...flattenChildren(node.children, node.name, depth + 1));
    }
  }
  return result;
};

// ═══════════════════════════════════════════════════════════════
//  SEARCH & FILTER WATCHERS
// ═══════════════════════════════════════════════════════════════
const loadProductsWithFilters = (page = 1) => {
  productStore.fetchProducts(page, searchProduct.value, filterCategory.value, filterStatus.value);
};

let searchTimeout = null;
watch(searchProduct, () => {
  if (searchTimeout) clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => loadProductsWithFilters(1), 300);
});

watch([filterCategory, filterStatus], () => loadProductsWithFilters(1));

watch(filterReceiptStatus, (newVal) => productStore.fetchReceipts(1, newVal));

watch(() => productStore.products, () => { selectedProductIds.value = []; });

watch(tab, () => {
  isSelectionMode.value = false;
  selectedProductIds.value = [];
});

onUnmounted(() => {
  if (searchTimeout) clearTimeout(searchTimeout);
  if (imagePreviewUrl.value) URL.revokeObjectURL(imagePreviewUrl.value);
});

// ═══════════════════════════════════════════════════════════════
//  CUSTOM CONFIRM DIALOG (Promise-based, thay window.confirm)
// ═══════════════════════════════════════════════════════════════
const confirmDialogVisible = ref(false);
const confirmDialogState = ref({
  title: '',
  message: '',
  icon: 'mdi-alert-circle-outline',
  severity: 'warning', // 'warning' | 'error'
  confirmText: 'Xác nhận',
});
let confirmDialogResolve = null;

const showConfirmDialog = (options) => {
  return new Promise((resolve) => {
    confirmDialogResolve = resolve;
    confirmDialogState.value = {
      title: options.title || 'Xác nhận',
      message: options.message || '',
      icon: options.icon || 'mdi-alert-circle-outline',
      severity: options.severity || 'warning',
      confirmText: options.confirmText || 'Xác nhận',
    };
    confirmDialogVisible.value = true;
  });
};

const resolveConfirmDialog = (result) => {
  confirmDialogVisible.value = false;
  if (confirmDialogResolve) confirmDialogResolve(result);
};

// ═══════════════════════════════════════════════════════════════
//  NOTIFICATION (ENHANCED SNACKBAR)
// ═══════════════════════════════════════════════════════════════
const snackbar = ref(false);
const snackbarText = ref('');
const snackbarColor = ref('success');

const snackbarIcon = computed(() => {
  const map = { success: 'mdi-check-circle', error: 'mdi-alert-circle', warning: 'mdi-alert', info: 'mdi-information' };
  return map[snackbarColor.value] || 'mdi-check-circle';
});

const showNotify = (text, color = 'success') => {
  snackbarText.value = text;
  snackbarColor.value = color;
  snackbar.value = true;
};

// ═══════════════════════════════════════════════════════════════
//  BULK ACTION HANDLERS
// ═══════════════════════════════════════════════════════════════
const handleBulkDeactivate = async () => {
  if (activeSelectedIds.value.length === 0) return;
  const ok = await showConfirmDialog({
    title: 'Ngừng bán hàng loạt',
    message: `Bạn có chắc chắn muốn ngừng bán ${activeSelectedIds.value.length} sản phẩm đang hoạt động đã chọn?`,
    icon: 'mdi-pause-circle-outline',
    severity: 'warning',
    confirmText: 'Ngừng bán',
  });
  if (!ok) return;
  const res = await productStore.bulkDeactivateProduct(activeSelectedIds.value);
  if (res.success) {
    showNotify(`Đã ngừng bán thành công ${activeSelectedIds.value.length} sản phẩm.`);
    selectedProductIds.value = [];
  } else {
    showNotify(res.message || 'Lỗi thao tác hàng loạt', 'error');
  }
};

const handleBulkActivate = async () => {
  if (inactiveSelectedIds.value.length === 0) return;
  const ok = await showConfirmDialog({
    title: 'Khôi phục bán lại',
    message: `Bạn có muốn khôi phục bán lại cho ${inactiveSelectedIds.value.length} sản phẩm đang ngừng bán đã chọn?`,
    icon: 'mdi-play-circle-outline',
    severity: 'warning',
    confirmText: 'Khôi phục',
  });
  if (!ok) return;
  const res = await productStore.bulkActivateProduct(inactiveSelectedIds.value);
  if (res.success) {
    showNotify(`Đã khôi phục trạng thái bán thành công cho ${inactiveSelectedIds.value.length} sản phẩm.`);
    selectedProductIds.value = [];
  } else {
    showNotify(res.message || 'Lỗi thao tác hàng loạt', 'error');
  }
};

const handleBulkDelete = async () => {
  if (deletableSelectedIds.value.length === 0) return;
  const ok = await showConfirmDialog({
    title: 'Xóa vĩnh viễn hàng loạt',
    message: `CẢNH BÁO: Bạn có chắc chắn muốn xóa vĩnh viễn ${deletableSelectedIds.value.length} sản phẩm chưa phát sinh giao dịch đã chọn? Thao tác này KHÔNG THỂ hoàn tác!`,
    icon: 'mdi-trash-can-outline',
    severity: 'error',
    confirmText: 'Xóa vĩnh viễn',
  });
  if (!ok) return;
  const res = await productStore.bulkDeleteProduct(deletableSelectedIds.value);
  if (res.success) {
    const data = res.data;
    if (data.failedCount > 0) {
      showNotify(`Đã xóa thành công ${data.successCount} sản phẩm. Thất bại ${data.failedCount} sản phẩm do đã có giao dịch.`, 'warning');
    } else {
      showNotify(`Đã xóa vĩnh viễn thành công ${data.successCount} sản phẩm.`);
    }
    selectedProductIds.value = [];
  } else {
    showNotify(res.message || 'Lỗi xóa hàng loạt', 'error');
  }
};

// ═══════════════════════════════════════════════════════════════
//  SINGLE DELETE HANDLER
// ═══════════════════════════════════════════════════════════════
const handleSingleDelete = async (id) => {
  const ok = await showConfirmDialog({
    title: 'Xóa vĩnh viễn sản phẩm',
    message: 'Bạn có chắc chắn muốn xóa vĩnh viễn sản phẩm này? Thao tác này chỉ thực hiện được nếu sản phẩm chưa phát sinh giao dịch nhập/xuất kho. Thao tác KHÔNG THỂ hoàn tác!',
    icon: 'mdi-trash-can-outline',
    severity: 'error',
    confirmText: 'Xóa vĩnh viễn',
  });
  if (!ok) return;
  const res = await productStore.deleteProduct(id);
  if (res.success) {
    showNotify('Đã xóa vĩnh viễn sản phẩm thành công!');
  } else {
    showNotify(res.message || 'Xóa sản phẩm thất bại.', 'error');
  }
};

// ═══════════════════════════════════════════════════════════════
//  PRODUCT DIALOG STATES
// ═══════════════════════════════════════════════════════════════
const showDialog = ref(false);
const isEditMode = ref(false);
const dialogTitle = computed(() => isEditMode.value ? 'Cập nhật sản phẩm' : 'Thêm sản phẩm mới');
const formValid = ref(false);
const saveLoading = ref(false);
const productForm = ref(null);

const supplierNames = computed(() => {
  return orderStore.suppliers.map(s => s.name || s.supplierName || '');
});

const editingProduct = ref({
  id: null, code: '', name: '', description: '',
  importPrice: 0, salePrice: 0, categoryId: null,
  minStockThreshold: 10, initialStock: 0, isActive: true, imageUrl: ''
});

// Image upload & preview
const imageFile = ref(null);
const imagePreviewUrl = ref(null);

watch(imageFile, (newFile) => {
  if (imagePreviewUrl.value) {
    URL.revokeObjectURL(imagePreviewUrl.value);
    imagePreviewUrl.value = null;
  }
  const f = Array.isArray(newFile) ? newFile[0] : newFile;
  if (f instanceof File) {
    imagePreviewUrl.value = URL.createObjectURL(f);
  }
});

const getImageUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  const gateway = window.VUE_APP_API_GATEWAY_URL || process.env.VUE_APP_API_GATEWAY_URL || `${window.location.protocol}//${window.location.hostname}:5000`;
  return `${gateway}${url}`;
};

// Product Details Dialog
const detailsDialog = ref(false);
const detailsTab = ref('overview');
const detailsProduct = ref(null);
const detailsLoading = ref(false);

const openDetailsDialog = async (id) => {
  try {
    detailsProduct.value = null;
    detailsLoading.value = true;
    detailsDialog.value = true;
    detailsTab.value = 'overview';
    const res = await api.get(`/api/products/${id}`);
    detailsProduct.value = res.data;
  } catch (error) {
    showNotify('Lỗi tải chi tiết sản phẩm', 'error');
  } finally {
    detailsLoading.value = false;
  }
};

// ═══════════════════════════════════════════════════════════════
//  PRODUCT CRUD HANDLERS
// ═══════════════════════════════════════════════════════════════
const openCreateDialog = () => {
  isEditMode.value = false;
  editingProduct.value = {
    id: null, code: '', name: '', description: '',
    importPrice: 0, salePrice: 0,
    categoryId: flatCategories.value[0]?.id || null,
    minStockThreshold: 10, initialStock: 0, isActive: true, imageUrl: ''
  };
  imageFile.value = null;
  imagePreviewUrl.value = null;
  if (productForm.value) productForm.value.resetValidation();
  showDialog.value = true;
};

const openEditDialog = (product) => {
  isEditMode.value = true;
  editingProduct.value = {
    id: product.id, code: product.code, name: product.name,
    description: product.description, importPrice: product.importPrice,
    salePrice: product.salePrice, categoryId: product.categoryId,
    minStockThreshold: product.minStockThreshold,
    isActive: product.isActive, imageUrl: product.imageUrl
  };
  imageFile.value = null;
  imagePreviewUrl.value = null;
  if (productForm.value) productForm.value.resetValidation();
  showDialog.value = true;
};

const saveProduct = async () => {
  if (!formValid.value) return;
  saveLoading.value = true;

  let uploadedImageUrl = editingProduct.value.imageUrl;
  let fileToUpload = null;
  if (Array.isArray(imageFile.value) && imageFile.value.length > 0) {
    fileToUpload = imageFile.value[0];
  } else if (imageFile.value && (imageFile.value instanceof File || typeof imageFile.value === 'object')) {
    fileToUpload = imageFile.value;
  }

  if (fileToUpload) {
    try {
      const formData = new FormData();
      formData.append('file', fileToUpload);
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
      name: editingProduct.value.name, description: editingProduct.value.description,
      importPrice: editingProduct.value.importPrice, salePrice: editingProduct.value.salePrice,
      categoryId: editingProduct.value.categoryId, minStockThreshold: editingProduct.value.minStockThreshold,
      imageUrl: uploadedImageUrl, isActive: editingProduct.value.isActive
    });
  } else {
    res = await productStore.createProduct({
      code: editingProduct.value.code, name: editingProduct.value.name,
      description: editingProduct.value.description, importPrice: editingProduct.value.importPrice,
      salePrice: editingProduct.value.salePrice, categoryId: editingProduct.value.categoryId,
      minStockThreshold: editingProduct.value.minStockThreshold, imageUrl: uploadedImageUrl,
      initialStock: editingProduct.value.initialStock
    });
  }
  saveLoading.value = false;
  if (res.success) {
    showDialog.value = false;
    showNotify(isEditMode.value ? 'Cập nhật sản phẩm thành công!' : 'Thêm sản phẩm mới thành công!');
    productStore.fetchLowStock(); // Refresh low stock count
  } else {
    showNotify(res.message, 'error');
  }
};

// Toggle product status
const toggleProductStatus = async (id, currentStatus) => {
  const ok = await showConfirmDialog({
    title: currentStatus ? 'Ngừng bán sản phẩm' : 'Khôi phục sản phẩm',
    message: currentStatus
      ? 'Bạn có chắc muốn ngừng bán sản phẩm này? Sản phẩm sẽ không còn hiển thị trong danh sách bán hàng.'
      : 'Bạn muốn khôi phục sản phẩm này sang trạng thái Đang bán?',
    icon: currentStatus ? 'mdi-pause-circle-outline' : 'mdi-play-circle-outline',
    severity: 'warning',
    confirmText: currentStatus ? 'Ngừng bán' : 'Khôi phục',
  });
  if (!ok) return;

  const res = await productStore.updateProduct(id, { isActive: !currentStatus });
  if (res.success) {
    showNotify(currentStatus ? 'Đã chuyển sản phẩm sang trạng thái Ngừng bán!' : 'Đã khôi phục sản phẩm thành công!');
  } else {
    showNotify(res.message || 'Có lỗi xảy ra', 'error');
  }
};

// ═══════════════════════════════════════════════════════════════
//  STOCK RECEIPT HANDLERS
// ═══════════════════════════════════════════════════════════════
const showReceiptDialog = ref(false);
const receiptFormValid = ref(false);
const receiptSaveLoading = ref(false);
const isEditReceipt = ref(false);
const editingReceiptId = ref(null);
const receiptForm = ref(null);
const newReceipt = ref({
  supplierName: '', note: '',
  items: [{ productId: null, quantity: 1, importPrice: 0 }]
});

// Receipt items total preview
const receiptItemsTotal = computed(() => {
  return newReceipt.value.items.reduce((sum, item) => sum + (item.quantity || 0) * (item.importPrice || 0), 0);
});

const showReceiptDetailDialog = ref(false);
const selectedReceiptDetail = ref(null);

const viewReceiptDetails = async (receipt) => {
  try {
    const res = await productStore.fetchReceiptDetail(receipt.id);
    if (res.success && res.data) {
      selectedReceiptDetail.value = res.data;
      showReceiptDetailDialog.value = true;
    } else {
      showNotify(res.message || 'Lỗi tải chi tiết phiếu nhập', 'error');
    }
  } catch (e) {
    showNotify('Lỗi tải chi tiết phiếu nhập', 'error');
  }
};

const getProductName = (productId) => {
  const prod = productStore.allProducts.find(p => p.id === productId);
  return prod ? prod.name : `Sản phẩm #${productId}`;
};

const onProductSelected = (item) => {
  const selectedProd = productStore.allProducts.find(p => p.id === item.productId);
  if (selectedProd) item.importPrice = selectedProd.importPrice;
};

const openReceiptDialog = () => {
  isEditReceipt.value = false;
  editingReceiptId.value = null;
  const defaultProd = productStore.allProducts[0];
  newReceipt.value = {
    supplierName: '', note: '',
    items: [{ productId: defaultProd?.id || null, quantity: 1, importPrice: defaultProd?.importPrice || 0 }]
  };
  if (receiptForm.value) receiptForm.value.resetValidation();
  showReceiptDialog.value = true;
};

const openEditReceiptDialog = async (receipt) => {
  try {
    const res = await productStore.fetchReceiptDetail(receipt.id);
    if (res.success && res.data) {
      isEditReceipt.value = true;
      editingReceiptId.value = receipt.id;
      const defaultProd = productStore.allProducts[0];
      newReceipt.value = {
        supplierName: res.data.supplierName || '',
        note: res.data.note || '',
        items: res.data.items?.length
          ? res.data.items.map(i => ({ productId: i.productId, quantity: i.quantity, importPrice: i.importPrice }))
          : [{ productId: defaultProd?.id || null, quantity: 1, importPrice: defaultProd?.importPrice || 0 }]
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
  const defaultProd = productStore.allProducts[0];
  newReceipt.value.items.push({
    productId: defaultProd?.id || null,
    quantity: 1,
    importPrice: defaultProd?.importPrice || 0
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
    productStore.fetchProducts();
    productStore.fetchLowStock();
  } else {
    showNotify(res.message || 'Có lỗi xảy ra', 'error');
  }
};

const handleDeleteReceipt = async (id) => {
  const ok = await showConfirmDialog({
    title: 'Xóa phiếu nhập nháp',
    message: 'Bạn có chắc chắn muốn xóa phiếu nhập nháp này? Thao tác này không thể hoàn tác.',
    icon: 'mdi-trash-can-outline',
    severity: 'error',
    confirmText: 'Xóa phiếu',
  });
  if (!ok) return;
  const res = await productStore.deleteReceipt(id);
  if (res.success) {
    showNotify('Đã xóa phiếu nhập kho thành công!');
  } else {
    showNotify(res.message || 'Xóa thất bại', 'error');
  }
};

const handleConfirmReceipt = async (id) => {
  const ok = await showConfirmDialog({
    title: 'Duyệt phiếu nhập kho',
    message: 'Duyệt phiếu nhập này sẽ cộng số lượng hàng vào tồn kho. Sau khi duyệt, phiếu không thể chỉnh sửa hoặc xóa. Tiếp tục?',
    icon: 'mdi-check-decagram',
    severity: 'warning',
    confirmText: 'Duyệt phiếu',
  });
  if (!ok) return;
  const res = await productStore.confirmReceipt(id);
  if (res.success) {
    showNotify('Duyệt phiếu nhập thành công!');
    productStore.fetchProducts();
    productStore.fetchLowStock();
  } else {
    showNotify(res.message, 'error');
  }
};

// ═══════════════════════════════════════════════════════════════
//  CATEGORY DIALOG STATES & HANDLERS
// ═══════════════════════════════════════════════════════════════
const showCategoryDialog = ref(false);
const isCategoryEditMode = ref(false);
const categoryDialogTitle = computed(() => isCategoryEditMode.value ? 'Cập nhật danh mục' : 'Thêm danh mục mới');
const categoryFormValid = ref(false);
const categorySaveLoading = ref(false);
const categoryForm = ref(null);

const editingCategory = ref({ id: null, name: '', description: '', parentCategoryId: null, sortOrder: 0 });

const openCreateCategoryDialog = () => {
  isCategoryEditMode.value = false;
  editingCategory.value = { id: null, name: '', description: '', parentCategoryId: null, sortOrder: 0 };
  if (categoryForm.value) categoryForm.value.resetValidation();
  showCategoryDialog.value = true;
};

const openEditCategoryDialog = (cat) => {
  isCategoryEditMode.value = true;
  editingCategory.value = {
    id: cat.id, name: cat.name, description: cat.description,
    parentCategoryId: cat.parentCategoryId, sortOrder: cat.sortOrder
  };
  if (categoryForm.value) categoryForm.value.resetValidation();
  showCategoryDialog.value = true;
};

const getDescendantIds = (categoryId, nodes) => {
  const ids = [];
  const findNode = (nodesList) => {
    for (const node of nodesList) {
      if (node.id === categoryId) {
        const collectIds = (n) => {
          if (n.children && n.children.length > 0) {
            for (const child of n.children) { ids.push(child.id); collectIds(child); }
          }
        };
        collectIds(node);
        return true;
      }
      if (node.children && node.children.length > 0) {
        if (findNode(node.children)) return true;
      }
    }
    return false;
  };
  findNode(nodes);
  return ids;
};

const availableParentCategories = computed(() => {
  const list = flatCategories.value.map(c => ({ id: c.id, name: c.name }));
  if (isCategoryEditMode.value && editingCategory.value.id) {
    const descendantIds = getDescendantIds(editingCategory.value.id, productStore.categories);
    return list.filter(c => c.id !== editingCategory.value.id && !descendantIds.includes(c.id));
  }
  return list;
});

const saveCategory = async () => {
  if (!categoryFormValid.value) return;
  categorySaveLoading.value = true;
  let res;
  if (isCategoryEditMode.value) {
    res = await productStore.updateCategory(editingCategory.value.id, {
      name: editingCategory.value.name, description: editingCategory.value.description,
      parentCategoryId: editingCategory.value.parentCategoryId, sortOrder: editingCategory.value.sortOrder
    });
  } else {
    res = await productStore.createCategory({
      name: editingCategory.value.name, description: editingCategory.value.description,
      parentCategoryId: editingCategory.value.parentCategoryId, sortOrder: editingCategory.value.sortOrder
    });
  }
  categorySaveLoading.value = false;
  if (res.success) {
    showCategoryDialog.value = false;
    showNotify(isCategoryEditMode.value ? 'Cập nhật danh mục thành công!' : 'Thêm danh mục mới thành công!');
    productStore.fetchCategories();
  } else {
    showNotify(res.message, 'error');
  }
};

const handleDeleteCategory = async (id) => {
  const ok = await showConfirmDialog({
    title: 'Xóa danh mục',
    message: 'Bạn có chắc chắn muốn xóa danh mục này? Xóa danh mục cha sẽ ảnh hưởng đến các danh mục con. Thao tác không thể hoàn tác!',
    icon: 'mdi-folder-remove-outline',
    severity: 'error',
    confirmText: 'Xóa danh mục',
  });
  if (!ok) return;
  const res = await productStore.deleteCategory(id);
  if (res.success) {
    showNotify('Xóa danh mục thành công!');
    productStore.fetchCategories();
  } else {
    showNotify(res.message, 'error');
  }
};

// ═══════════════════════════════════════════════════════════════
//  UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════
const formatPrice = (price) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price || 0);
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  let cleanDateString = dateString;
  if (!dateString.includes('Z') && !dateString.includes('+') && !/-\d{2}:\d{2}$/.test(dateString)) {
    cleanDateString = dateString + 'Z';
  }
  const date = new Date(cleanDateString);
  return date.toLocaleDateString('vi-VN') + ' ' + date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
};

const getUserName = (userId) => {
  if (userId === 0 || userId === '0' || userId === null || userId === undefined || userId === '' || userId === 'System') return 'Hệ thống';
  if (authStore.user && (authStore.user.id === userId || String(authStore.user.id) === String(userId))) {
    return authStore.user.fullName || authStore.user.email || 'Tôi';
  }
  const foundUser = userStore.users.find(u => String(u.id).toLowerCase() === String(userId).toLowerCase());
  if (foundUser) {
    return foundUser.fullName || foundUser.displayName || foundUser.email || `Nhân viên #${userId}`;
  }
  return `Nhân viên #${userId}`;
};

// ═══════════════════════════════════════════════════════════════
//  SMART PAGINATION
// ═══════════════════════════════════════════════════════════════
const buildPaginationRange = (current, total) => {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = [1];
  if (current > 3) pages.push('...');
  for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) pages.push(i);
  if (current < total - 2) pages.push('...');
  if (total > 1) pages.push(total);
  return pages;
};

const productPaginationRange = computed(() => buildPaginationRange(productStore.currentPage, productStore.totalPages));
const receiptPaginationRange = computed(() => buildPaginationRange(productStore.receiptsCurrentPage, productStore.receiptsTotalPages));

const paginationInfo = computed(() => {
  const ps = productStore.pageSize;
  const start = Math.min((productStore.currentPage - 1) * ps + 1, productStore.totalProducts);
  const end = Math.min(productStore.currentPage * ps, productStore.totalProducts);
  return { start, end, total: productStore.totalProducts };
});

const receiptPaginationInfo = computed(() => {
  const ps = productStore.pageSize;
  const start = Math.min((productStore.receiptsCurrentPage - 1) * ps + 1, productStore.receiptsTotal);
  const end = Math.min(productStore.receiptsCurrentPage * ps, productStore.receiptsTotal);
  return { start, end, total: productStore.receiptsTotal };
});

// ═══════════════════════════════════════════════════════════════
//  LIFECYCLE
// ═══════════════════════════════════════════════════════════════
onMounted(() => {
  productStore.fetchAllProducts();
  productStore.fetchProducts();
  productStore.fetchCategories();
  productStore.fetchReceipts();
  productStore.fetchLowStock();

  if (authStore.hasRole(['Admin', 'Warehouse'])) {
    orderStore.fetchSuppliers();
    userStore.fetchUsers();
  }
});
</script>

<style scoped>
/* ═══════════════════════════════════════════════════════════════
   ANIMATIONS
   ═══════════════════════════════════════════════════════════════ */
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes shimmer {
  0%   { background-position: -400px 0; }
  100% { background-position: 400px 0; }
}
@keyframes pulseWarning {
  0%, 100% { opacity: 1; }
  50%      { opacity: .65; }
}

.animate-fade-in {
  animation: fadeInUp .45s cubic-bezier(.22,1,.36,1) both;
}

/* ═══════════════════════════════════════════════════════════════
   HEADER
   ═══════════════════════════════════════════════════════════════ */
.header-icon-wrap {
  width: 48px; height: 48px;
  border-radius: 14px;
  background: linear-gradient(135deg, #2563eb 0%, #6366f1 100%);
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 4px 14px -3px rgba(37, 99, 235, .35);
  flex-shrink: 0;
}

/* ═══════════════════════════════════════════════════════════════
   COMPACT STAT CARDS
   ═══════════════════════════════════════════════════════════════ */
.stat-card {
  display: flex; align-items: center; gap: 10px;
  padding: 10px 14px;
  border-radius: 12px;
  background: #fff;
  border: 1px solid #e2e8f0;
  transition: all .2s ease;
  min-height: 46px;
}
.stat-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px -4px rgba(0,0,0,.08);
}
.stat-card__icon {
  width: 32px; height: 32px; border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.stat-card__value {
  font-size: 18px; font-weight: 800; line-height: 1;
}
.stat-card__label {
  font-size: 11px; color: #64748b; font-weight: 500; white-space: nowrap;
}

/* Stat Card Variants */
.stat-card--total .stat-card__icon  { background: #eff6ff; color: #2563eb; }
.stat-card--total .stat-card__value { color: #1e40af; }

.stat-card--active .stat-card__icon  { background: #ecfdf5; color: #10b981; }
.stat-card--active .stat-card__value { color: #047857; }

.stat-card--info .stat-card__icon  { background: #eef2ff; color: #6366f1; }
.stat-card--info .stat-card__value { color: #4338ca; }

.stat-card--warning .stat-card__icon  { background: #fffbeb; color: #f59e0b; }
.stat-card--warning .stat-card__value { color: #b45309; }

/* ═══════════════════════════════════════════════════════════════
   GLASS CARD
   ═══════════════════════════════════════════════════════════════ */
.glass-card {
  background: #ffffff !important;
  border: 1px solid #e2e8f0 !important;
  box-shadow: 0 10px 15px -3px rgba(0,0,0,.05), 0 4px 6px -2px rgba(0,0,0,.03) !important;
}
.border-bottom { border-bottom: 1px solid #e2e8f0; }

/* ═══════════════════════════════════════════════════════════════
   FILTER TOGGLE
   ═══════════════════════════════════════════════════════════════ */
.filter-toggle-btn { border-color: #cbd5e1 !important; }
.filter-count-badge {
  display: inline-flex; align-items: center; justify-content: center;
  width: 20px; height: 20px; border-radius: 50%;
  background: #2563eb; color: #fff;
  font-size: 11px; font-weight: 700;
}

/* ═══════════════════════════════════════════════════════════════
   DATA TABLE ENHANCEMENTS
   ═══════════════════════════════════════════════════════════════ */
.data-table-wrap {
  box-shadow: 0 1px 3px rgba(0,0,0,.04);
}
.table-row-hover {
  transition: background-color 0.15s ease, border-left-color 0.15s ease;
  border-left: 3px solid transparent;
}
.table-row-hover:hover {
  background-color: rgba(241, 245, 249, .6) !important;
  border-left-color: #2563eb;
}
.row-selected {
  background-color: rgba(219, 234, 254, .25) !important;
  border-left-color: #3b82f6 !important;
}
.product-avatar {
  transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}
.product-avatar:hover {
  transform: scale(1.12);
}
.action-icon-btn {
  background-color: #ffffff !important;
  border: 1px solid #e2e8f0 !important;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05) !important;
  transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.2s cubic-bezier(0.4, 0, 0.2, 1), border-color 0.2s ease !important;
}
.action-icon-btn:hover {
  background-color: #ffffff !important;
  transform: translateY(-2px) scale(1.08) !important;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.12) !important;
  border-color: currentColor !important;
}
.action-icon-btn:active {
  transform: translateY(0) scale(0.95) !important;
}

/* Status Badge with dot */
.status-badge {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 4px 12px; border-radius: 9999px;
  font-size: 12px; font-weight: 700; white-space: nowrap;
}
.status-badge__dot {
  width: 7px; height: 7px; border-radius: 50%;
}
.status-badge--active {
  background: #ecfdf5; color: #047857;
}
.status-badge--active .status-badge__dot {
  background: #10b981;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, .2);
}
.status-badge--inactive {
  background: #f1f5f9; color: #64748b;
}
.status-badge--inactive .status-badge__dot {
  background: #94a3b8;
}
.pulse-warning {
  animation: pulseWarning 2s ease-in-out infinite;
}

/* ═══════════════════════════════════════════════════════════════
   SKELETON LOADER
   ═══════════════════════════════════════════════════════════════ */
.skeleton {
  background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
  background-size: 800px 100%;
  animation: shimmer 1.5s ease-in-out infinite;
  border-radius: 4px;
}
.skeleton-row td {
  border-bottom: 1px solid #f1f5f9 !important;
}

/* ═══════════════════════════════════════════════════════════════
   PAGINATION
   ═══════════════════════════════════════════════════════════════ */
.custom-pagination { display: flex; align-items: center; gap: 4px; }
.pagination-btn {
  min-width: 36px; height: 36px;
  display: inline-flex; align-items: center; justify-content: center;
  border-radius: 8px;
  background-color: #f8fafc; color: #374151;
  font-weight: 500; font-size: 13px;
  border: 1px solid #e2e8f0;
  cursor: pointer; transition: all .2s ease;
  padding: 0 4px;
}
.pagination-btn:hover:not(:disabled):not(.active) {
  background-color: #eef2ff; border-color: #c7d2fe; color: #4338ca;
}
.pagination-btn.active {
  background-color: #2563eb; color: #fff;
  border-color: #2563eb; font-weight: 700;
  box-shadow: 0 2px 8px -2px rgba(37,99,235,.4);
}
.pagination-btn:disabled { cursor: not-allowed; opacity: .4; }
.pagination-ellipsis {
  display: inline-flex; align-items: center; justify-content: center;
  width: 32px; color: #94a3b8; font-size: 14px; user-select: none;
}

/* ═══════════════════════════════════════════════════════════════
   BULK ACTION BAR
   ═══════════════════════════════════════════════════════════════ */
.bulk-action-bar {
  position: fixed; bottom: 24px; left: 50%;
  transform: translateX(-50%); z-index: 50;
}
.bulk-action-bar__inner {
  display: flex; align-items: center; gap: 16px;
  background: rgba(15, 23, 42, .92);
  backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
  color: #fff; padding: 12px 20px;
  border-radius: 16px;
  box-shadow: 0 20px 50px -12px rgba(0,0,0,.35);
  border: 1px solid rgba(255,255,255,.08);
}
.bulk-action-bar__count {
  display: flex; align-items: center;
  font-size: 13px; font-weight: 600; white-space: nowrap;
}
.bulk-action-bar__number {
  color: #60a5fa; font-weight: 800; margin: 0 4px; font-size: 15px;
}
.bulk-action-bar__divider {
  width: 1px; height: 20px; background: rgba(255,255,255,.15);
}

/* ═══════════════════════════════════════════════════════════════
   CONFIRM DIALOG
   ═══════════════════════════════════════════════════════════════ */
.confirm-dialog__header {
  display: flex; align-items: center; justify-content: center;
  padding: 24px 0 12px;
}
.confirm-dialog__header--warning {
  background: linear-gradient(135deg, #fbbf2420 0%, transparent 100%);
}
.confirm-dialog__header--warning .v-icon { color: #f59e0b !important; }
.confirm-dialog__header--error {
  background: linear-gradient(135deg, #ef444420 0%, transparent 100%);
}
.confirm-dialog__header--error .v-icon { color: #ef4444 !important; }

/* Custom dialog entrance animation removed to avoid double-transition conflicts with Vuetify. */

/* ═══════════════════════════════════════════════════════════════
   EMPTY STATE
   ═══════════════════════════════════════════════════════════════ */
.empty-state {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
}

/* ═══════════════════════════════════════════════════════════════
   IMAGE PREVIEW
   ═══════════════════════════════════════════════════════════════ */
.image-preview-box {
  transition: all .2s ease;
}
.image-preview-box:hover {
  transform: scale(1.05);
}

/* ═══════════════════════════════════════════════════════════════
   BUTTON HOVER LIFT
   ═══════════════════════════════════════════════════════════════ */
.btn-hover-lift {
  transition: all .2s ease !important;
}
.btn-hover-lift:hover {
  transform: translateY(-2px) !important;
  box-shadow: 0 8px 25px -5px rgba(37, 99, 235, .3) !important;
}
.btn-hover-lift:active {
  transform: translateY(0) scale(.98) !important;
}

/* ═══════════════════════════════════════════════════════════════
   ENHANCED SNACKBAR
   ═══════════════════════════════════════════════════════════════ */
.enhanced-snackbar .v-snackbar__wrapper {
  border-radius: 12px !important;
}

/* ═══════════════════════════════════════════════════════════════
   MISC
   ═══════════════════════════════════════════════════════════════ */
.gap-4 { gap: 16px; }
</style>
