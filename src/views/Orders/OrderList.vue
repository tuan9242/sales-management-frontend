<template>
  <div>
    <!-- Page Header -->
    <v-row class="mb-6">
      <v-col cols="12" class="d-flex justify-space-between align-center flex-wrap gap-4">
        <div>
          <h1 class="text-h4 font-weight-black text-slate-900 tracking-tight flex items-center gap-2">
            <v-icon color="primary" size="large">mdi-cart-outline</v-icon>
            Quản lý Đơn hàng & Bán lẻ
          </h1>
          <p class="text-subtitle-1 text-slate-600 mt-1">Lập hóa đơn, quản lý trạng thái giao dịch và công nợ khách hàng (Nhóm 4)</p>
        </div>
        <v-btn color="primary" prepend-icon="mdi-cart-plus" class="rounded-xl px-6 font-weight-bold text-white" elevation="0" @click="openCreateDialog">
          Tạo đơn bán hàng
        </v-btn>
      </v-col>
    </v-row>

    <!-- Stat chips -->
    <v-row class="mb-4">
      <v-col cols="6" sm="3">
        <v-card rounded="xl" elevation="0" class="stat-chip pa-4 text-center border border-slate-200">
          <div class="text-h5 font-weight-black text-primary">{{ orders.length }}</div>
          <div class="text-caption text-slate-500">Tổng đơn</div>
        </v-card>
      </v-col>
      <v-col cols="6" sm="3">
        <v-card rounded="xl" elevation="0" class="stat-chip pa-4 text-center border border-amber-200 bg-amber-50">
          <div class="text-h5 font-weight-black text-amber-700">{{ pendingCount }}</div>
          <div class="text-caption text-amber-600">Chờ xử lý</div>
        </v-card>
      </v-col>
      <v-col cols="6" sm="3">
        <v-card rounded="xl" elevation="0" class="stat-chip pa-4 text-center border border-emerald-200 bg-emerald-50">
          <div class="text-h5 font-weight-black text-emerald-700">{{ completedCount }}</div>
          <div class="text-caption text-emerald-600">Đã hoàn thành</div>
        </v-card>
      </v-col>
      <v-col cols="6" sm="3">
        <v-card rounded="xl" elevation="0" class="stat-chip pa-4 text-center border border-rose-200 bg-rose-50">
          <div class="text-h5 font-weight-black text-rose-700">{{ formatPrice(debtTotal) }}</div>
          <div class="text-caption text-rose-600">Tổng công nợ</div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Error Alert -->
    <v-alert v-if="error" type="error" variant="tonal" density="compact" class="mb-4" closable @click:close="error = null">
      {{ error }}
    </v-alert>

    <!-- Tabs: Đơn hàng / Công nợ -->
    <v-card class="glass-card" rounded="xl" elevation="0">
      <v-tabs v-model="activeTab" color="primary" bg-color="transparent" class="px-4 border-b border-slate-200">
        <v-tab value="orders" class="font-weight-bold">
          <v-icon start>mdi-format-list-bulleted</v-icon> Danh sách đơn hàng
        </v-tab>
        <v-tab value="debt" class="font-weight-bold">
          <v-icon start>mdi-cash-clock</v-icon> Công nợ
          <v-chip v-if="debtOrders.length" size="x-small" color="error" class="ml-2">{{ debtOrders.length }}</v-chip>
        </v-tab>
        <v-tab value="customers" class="font-weight-bold">
          <v-icon start>mdi-account-group</v-icon> Khách hàng
          <v-chip size="x-small" color="primary" variant="tonal" class="ml-2">{{ customerStats.length }}</v-chip>
        </v-tab>
        <v-tab value="suppliers" class="font-weight-bold">
          <v-icon start>mdi-truck-outline</v-icon> Nhà cung cấp
          <v-chip size="x-small" color="teal" variant="tonal" class="ml-2">{{ suppliers.length }}</v-chip>
        </v-tab>
      </v-tabs>

      <v-window v-model="activeTab">
        <!-- ── TAB ĐƠN HÀNG ── -->
        <v-window-item value="orders">
          <!-- Toolbar -->
          <div class="pa-4 d-flex align-center flex-wrap gap-3">
            <v-text-field
              v-model="search"
              prepend-inner-icon="mdi-magnify"
              label="Tìm theo mã đơn, khách hàng..."
              variant="outlined"
              density="compact"
              hide-details
              color="primary"
              rounded="xl"
              class="search-input"
              style="min-width:240px;max-width:360px"
              @update:model-value="currentPage = 1"
            ></v-text-field>

            <v-select
              v-model="statusFilter"
              :items="statusFilterOptions"
              item-title="label"
              item-value="value"
              variant="outlined"
              density="compact"
              hide-details
              style="min-width:200px;max-width:240px"
              prepend-inner-icon="mdi-filter-outline"
              @update:model-value="currentPage = 1"
            ></v-select>

            <v-spacer></v-spacer>

            <v-btn variant="outlined" size="small" class="rounded-lg" @click="fetchOrders">
              <v-icon start>mdi-refresh</v-icon> Làm mới
            </v-btn>
          </div>

          <!-- Loading -->
          <v-progress-linear v-if="loading" indeterminate color="primary" height="2"></v-progress-linear>

          <!-- Table -->
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse text-slate-700">
              <thead>
                <tr class="bg-slate-50 border-b border-slate-200">
                  <th class="px-5 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Mã đơn</th>
                  <th class="px-5 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Khách hàng</th>
                  <th class="px-5 py-3 text-xs font-bold uppercase tracking-wider text-slate-500 text-center">Số SP</th>
                  <th class="px-5 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Tổng tiền</th>
                  <th class="px-5 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Thanh toán</th>
                  <th class="px-5 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Trạng thái</th>
                  <th class="px-5 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Ngày tạo</th>
                  <th class="px-5 py-3 text-xs font-bold uppercase tracking-wider text-slate-500 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                <tr v-if="!loading && paginatedOrders.length === 0">
                  <td colspan="8" class="text-center py-12 text-slate-500">
                    <v-icon size="48" color="grey-lighten-1" class="mb-3 d-block mx-auto">mdi-cart-off</v-icon>
                    Chưa có đơn hàng nào. Hãy tạo đơn đầu tiên!
                  </td>
                </tr>
                <tr
                  v-for="order in paginatedOrders"
                  :key="order.id"
                  class="hover:bg-slate-50/60 transition-colors duration-150"
                >
                  <td class="px-5 py-3">
                    <span class="font-mono font-bold text-primary cursor-pointer hover:underline" @click="viewOrder(order)">
                      {{ order.orderCode || `#${order.id}` }}
                    </span>
                  </td>
                  <td class="px-5 py-3 font-semibold text-slate-900">{{ order.customerName || '—' }}</td>
                  <td class="px-5 py-3 text-center">
                    <span class="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs font-semibold">
                      {{ order.items?.length ?? order.orderItems?.length ?? 0 }}
                    </span>
                  </td>
                  <td class="px-5 py-3 font-semibold text-slate-900">{{ formatPrice(order.totalAmount ?? order.finalAmount) }}</td>
                  <td class="px-5 py-3">
                    <span :class="paymentDisplay(order).cls" class="text-xs font-medium border px-2.5 py-0.5 rounded-full">
                      {{ paymentDisplay(order).label }}
                    </span>
                  </td>
                  <td class="px-5 py-3">
                    <span :class="statusBadgeClass(order.status)">{{ translateStatus(order.status) }}</span>
                  </td>
                  <td class="px-5 py-3 text-sm text-slate-500">{{ formatDate(order.orderDate ?? order.createdAt) }}</td>
                  <td class="px-5 py-3">
                    <div class="d-flex gap-1 justify-center">
                      <v-tooltip text="Xem chi tiết" location="top">
                        <template #activator="{ props }">
                          <v-btn v-bind="props" icon="mdi-eye-outline" size="x-small" variant="text" color="primary" @click="viewOrder(order)"></v-btn>
                        </template>
                      </v-tooltip>
                      <v-tooltip text="Chỉnh sửa đơn" location="top">
                        <template #activator="{ props }">
                          <v-btn v-bind="props" icon="mdi-pencil-outline" size="x-small" variant="text" color="warning" @click="openEditDialog(order)"></v-btn>
                        </template>
                      </v-tooltip>
                      <v-tooltip text="Xóa đơn" location="top">
                        <template #activator="{ props }">
                          <v-btn v-bind="props" icon="mdi-delete-outline" size="x-small" variant="text" color="error" @click="confirmDelete(order)"></v-btn>
                        </template>
                      </v-tooltip>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Pagination -->
          <div v-if="totalOrders > 0" class="px-5 py-3 border-t border-slate-200 d-flex align-center justify-space-between flex-wrap gap-3">
            <div class="text-sm text-slate-500">
              Hiển thị <strong class="text-slate-700">{{ rangeStart }}–{{ rangeEnd }}</strong> / <strong class="text-slate-700">{{ totalOrders }}</strong> đơn hàng
            </div>
            <div class="d-flex align-center gap-3">
              <v-select
                v-model="pageSize"
                :items="[5, 10, 20, 50]"
                density="compact"
                variant="outlined"
                hide-details
                style="width:88px"
                @update:model-value="currentPage = 1"
              ></v-select>
              <v-pagination
                v-model="currentPage"
                :length="totalPages"
                :total-visible="5"
                density="compact"
                color="primary"
                rounded="lg"
              ></v-pagination>
            </div>
          </div>
        </v-window-item>

        <!-- ── TAB CÔNG NỢ ── -->
        <v-window-item value="debt">
          <div class="pa-5">
            <div class="d-flex align-center justify-space-between mb-4">
              <div>
                <p class="text-body-1 font-weight-bold text-slate-800">Danh sách đơn hàng chưa thanh toán</p>
                <p class="text-caption text-slate-500 mt-0.5">
                  Tổng công nợ: <strong class="text-rose-600">{{ formatPrice(debtTotal) }}</strong>
                </p>
              </div>
            </div>

            <div class="overflow-x-auto rounded-xl border border-slate-200 bg-white">
              <table class="w-full text-left border-collapse text-slate-700">
                <thead>
                  <tr class="bg-slate-50 border-b border-slate-200">
                    <th class="px-5 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Mã đơn</th>
                    <th class="px-5 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Khách hàng</th>
                    <th class="px-5 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Số tiền nợ</th>
                    <th class="px-5 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Trạng thái</th>
                    <th class="px-5 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Ngày tạo</th>
                    <th class="px-5 py-3 text-xs font-bold uppercase tracking-wider text-slate-500 text-center">Thao tác</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                  <tr v-if="debtOrders.length === 0">
                    <td colspan="6" class="text-center py-10 text-slate-400">
                      <v-icon size="36" class="mb-2 d-block mx-auto" color="success">mdi-check-circle-outline</v-icon>
                      Không có công nợ tồn đọng
                    </td>
                  </tr>
                  <tr v-for="order in debtOrders" :key="order.id" class="hover:bg-rose-50/30 transition-colors">
                    <td class="px-5 py-3">
                      <span class="font-mono font-bold text-primary cursor-pointer" @click="viewOrder(order)">
                        {{ order.orderCode || `#${order.id}` }}
                      </span>
                    </td>
                    <td class="px-5 py-3 font-semibold text-slate-900">{{ order.customerName || '—' }}</td>
                    <td class="px-5 py-3 font-bold text-rose-600">{{ formatPrice(order.totalAmount ?? order.finalAmount) }}</td>
                    <td class="px-5 py-3">
                      <span :class="statusBadgeClass(order.status)">{{ translateStatus(order.status) }}</span>
                    </td>
                    <td class="px-5 py-3 text-sm text-slate-500">{{ formatDate(order.orderDate ?? order.createdAt) }}</td>
                    <td class="px-5 py-3 text-center">
                      <v-btn size="x-small" color="success" variant="flat" rounded="lg" @click="markAsPaid(order)">
                        <v-icon start size="small">mdi-cash-check</v-icon> Thu tiền
                      </v-btn>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </v-window-item>

        <!-- ── TAB KHÁCH HÀNG ── -->
        <v-window-item value="customers">
          <div class="pa-5">
            <div class="d-flex align-center gap-3 mb-4">
              <v-text-field
                v-model="customerSearch"
                prepend-inner-icon="mdi-magnify"
                label="Tìm theo tên, SĐT..."
                variant="outlined"
                density="compact"
                hide-details
                rounded="xl"
                style="max-width:320px"
              ></v-text-field>
              <p class="text-caption text-slate-500 ml-auto">{{ filteredCustomerStats.length }} khách hàng</p>
            </div>

            <div class="overflow-x-auto rounded-xl border border-slate-200 bg-white">
              <table class="w-full text-left border-collapse text-slate-700">
                <thead>
                  <tr class="bg-slate-50 border-b border-slate-200">
                    <th class="px-5 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Khách hàng</th>
                    <th class="px-5 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">SĐT</th>
                    <th class="px-5 py-3 text-xs font-bold uppercase tracking-wider text-slate-500 text-center">Tổng đơn</th>
                    <th class="px-5 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Tổng chi tiêu</th>
                    <th class="px-5 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Công nợ</th>
                    <th class="px-5 py-3 text-xs font-bold uppercase tracking-wider text-slate-500 text-center">Chi tiết</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                  <tr v-if="filteredCustomerStats.length === 0">
                    <td colspan="6" class="text-center py-10 text-slate-400">
                      <v-icon size="36" class="mb-2 d-block mx-auto" color="grey-lighten-1">mdi-account-off-outline</v-icon>
                      Chưa có dữ liệu khách hàng
                    </td>
                  </tr>
                  <tr
                    v-for="cust in filteredCustomerStats"
                    :key="cust.id ?? cust.name"
                    class="hover:bg-slate-50/60 transition-colors cursor-pointer"
                    @click="openCustomerHistory(cust)"
                  >
                    <td class="px-5 py-3 font-semibold text-slate-900">{{ cust.name }}</td>
                    <td class="px-5 py-3 text-sm text-slate-500">{{ cust.phone || '—' }}</td>
                    <td class="px-5 py-3 text-center">
                      <span class="bg-primary/10 text-primary px-2 py-0.5 rounded text-xs font-semibold">{{ cust.orderCount }}</span>
                    </td>
                    <td class="px-5 py-3 font-semibold text-slate-900">{{ formatPrice(cust.totalSpent) }}</td>
                    <td class="px-5 py-3">
                      <span v-if="cust.debtAmount > 0" class="text-rose-600 font-bold">{{ formatPrice(cust.debtAmount) }}</span>
                      <span v-else class="text-emerald-600 text-xs font-medium">Không nợ</span>
                    </td>
                    <td class="px-5 py-3 text-center">
                      <v-btn size="x-small" variant="tonal" color="primary" icon="mdi-eye-outline" @click.stop="openCustomerHistory(cust)"></v-btn>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </v-window-item>
        <!-- ── TAB NHÀ CUNG CẤP ── -->
        <v-window-item value="suppliers">
          <div class="pa-5">
            <div class="d-flex align-center gap-3 mb-4">
              <v-text-field
                v-model="supplierSearch"
                prepend-inner-icon="mdi-magnify"
                label="Tìm theo tên, SĐT, người liên hệ..."
                variant="outlined"
                density="compact"
                hide-details
                rounded="xl"
                style="max-width:360px"
              ></v-text-field>
              <v-spacer></v-spacer>
              <v-btn color="teal" variant="flat" prepend-icon="mdi-plus" class="rounded-xl text-white" @click="openSupplierCreate">
                Thêm nhà cung cấp
              </v-btn>
            </div>

            <v-progress-linear v-if="loadingSuppliers" indeterminate color="teal" height="2" class="mb-2"></v-progress-linear>

            <div class="overflow-x-auto rounded-xl border border-slate-200 bg-white">
              <table class="w-full text-left border-collapse text-slate-700">
                <thead>
                  <tr class="bg-slate-50 border-b border-slate-200">
                    <th class="px-5 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Tên nhà cung cấp</th>
                    <th class="px-5 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">SĐT</th>
                    <th class="px-5 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Email</th>
                    <th class="px-5 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Người liên hệ</th>
                    <th class="px-5 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Địa chỉ</th>
                    <th class="px-5 py-3 text-xs font-bold uppercase tracking-wider text-slate-500 text-center">Thao tác</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                  <tr v-if="!loadingSuppliers && filteredSuppliers.length === 0">
                    <td colspan="6" class="text-center py-12 text-slate-400">
                      <v-icon size="48" color="grey-lighten-1" class="mb-2 d-block mx-auto">mdi-truck-off-outline</v-icon>
                      Chưa có nhà cung cấp nào
                    </td>
                  </tr>
                  <tr v-for="s in filteredSuppliers" :key="s.id" class="hover:bg-slate-50/60 transition-colors">
                    <td class="px-5 py-3 font-semibold text-slate-900">{{ s.name }}</td>
                    <td class="px-5 py-3 text-sm">{{ s.phone || '—' }}</td>
                    <td class="px-5 py-3 text-sm text-slate-500">{{ s.email || '—' }}</td>
                    <td class="px-5 py-3 text-sm">{{ s.contactPerson || '—' }}</td>
                    <td class="px-5 py-3 text-sm text-slate-500">{{ s.address || '—' }}</td>
                    <td class="px-5 py-3">
                      <div class="d-flex gap-1 justify-center">
                        <v-tooltip text="Chỉnh sửa" location="top">
                          <template #activator="{ props }">
                            <v-btn v-bind="props" icon="mdi-pencil-outline" size="x-small" variant="text" color="warning" @click="openSupplierEdit(s)"></v-btn>
                          </template>
                        </v-tooltip>
                        <v-tooltip text="Xóa" location="top">
                          <template #activator="{ props }">
                            <v-btn v-bind="props" icon="mdi-delete-outline" size="x-small" variant="text" color="error" @click="confirmDeleteSupplier(s)"></v-btn>
                          </template>
                        </v-tooltip>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </v-window-item>
      </v-window>
    </v-card>

    <!-- ===== DIALOG THÊM/SỬA NHÀ CUNG CẤP ===== -->
    <v-dialog v-model="supplierDialog" max-width="600" persistent>
      <v-card rounded="xl">
        <v-card-title class="pa-6 pb-4 border-b d-flex align-center justify-space-between">
          <span class="text-h6 font-weight-bold">
            <v-icon color="teal" class="mr-2">mdi-truck-outline</v-icon>
            {{ supplierEditMode ? 'Chỉnh sửa nhà cung cấp' : 'Thêm nhà cung cấp mới' }}
          </span>
          <v-btn icon="mdi-close" variant="text" @click="supplierDialog = false"></v-btn>
        </v-card-title>
        <v-card-text class="pa-6">
          <v-row dense>
            <v-col cols="12">
              <label class="field-label">Tên nhà cung cấp <span class="text-error">*</span></label>
              <v-text-field v-model="supplierForm.name" variant="outlined" density="comfortable" placeholder="VD: Công ty TNHH ABC"></v-text-field>
            </v-col>
            <v-col cols="12" sm="6">
              <label class="field-label">Số điện thoại</label>
              <v-text-field v-model="supplierForm.phone" variant="outlined" density="comfortable" placeholder="0912 345 678"></v-text-field>
            </v-col>
            <v-col cols="12" sm="6">
              <label class="field-label">Email</label>
              <v-text-field v-model="supplierForm.email" variant="outlined" density="comfortable" placeholder="contact@abc.com"></v-text-field>
            </v-col>
            <v-col cols="12" sm="6">
              <label class="field-label">Người liên hệ</label>
              <v-text-field v-model="supplierForm.contactPerson" variant="outlined" density="comfortable" placeholder="Nguyễn Văn A"></v-text-field>
            </v-col>
            <v-col cols="12" sm="6">
              <label class="field-label">Địa chỉ</label>
              <v-text-field v-model="supplierForm.address" variant="outlined" density="comfortable" placeholder="123 Nguyễn Huệ, Q.1, TP.HCM"></v-text-field>
            </v-col>
            <v-col cols="12">
              <label class="field-label">Ghi chú</label>
              <v-textarea v-model="supplierForm.note" variant="outlined" density="comfortable" rows="2" placeholder="Ghi chú thêm..."></v-textarea>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions class="pa-4 border-t justify-end gap-2">
          <v-btn variant="outlined" @click="supplierDialog = false">Hủy</v-btn>
          <v-btn color="teal" variant="flat" :loading="savingSupplier" :disabled="!supplierForm.name.trim()" @click="saveSupplier" class="text-white">
            <v-icon start>mdi-content-save-outline</v-icon> {{ supplierEditMode ? 'Lưu thay đổi' : 'Thêm mới' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- ===== DIALOG XÁC NHẬN XÓA NHÀ CUNG CẤP ===== -->
    <v-dialog v-model="supplierDeleteDialog" max-width="400">
      <v-card rounded="xl" class="pa-2">
        <v-card-title class="pa-4 text-body-1 font-weight-bold">Xác nhận xóa nhà cung cấp</v-card-title>
        <v-card-text class="pa-4 pt-0 text-slate-600">
          Bạn có chắc muốn xóa <strong class="text-error">{{ supplierToDelete?.name }}</strong>? Hành động này không thể hoàn tác.
        </v-card-text>
        <v-card-actions class="pa-4 pt-0 justify-end gap-2">
          <v-btn variant="text" @click="supplierDeleteDialog = false">Hủy</v-btn>
          <v-btn color="error" variant="flat" :loading="deletingSupplier" @click="deleteSupplier">Xóa</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- ===== DIALOG LỊCH SỬ MUA KHÁCH HÀNG ===== -->
    <v-dialog v-model="customerHistoryDialog" max-width="780" scrollable>
      <v-card v-if="selectedCustomerHistory" rounded="xl">
        <v-card-title class="pa-6 pb-4 border-b d-flex align-center justify-space-between">
          <div>
            <div class="text-h6 font-weight-bold">
              <v-icon color="primary" class="mr-2">mdi-account-clock</v-icon>
              {{ selectedCustomerHistory.name }}
            </div>
            <div class="d-flex gap-4 mt-1">
              <span class="text-caption text-slate-500">{{ selectedCustomerHistory.orderCount }} đơn hàng</span>
              <span class="text-caption font-weight-bold text-success">Tổng: {{ formatPrice(selectedCustomerHistory.totalSpent) }}</span>
              <span v-if="selectedCustomerHistory.debtAmount > 0" class="text-caption font-weight-bold text-error">Nợ: {{ formatPrice(selectedCustomerHistory.debtAmount) }}</span>
            </div>
          </div>
          <v-btn icon="mdi-close" variant="text" @click="customerHistoryDialog = false"></v-btn>
        </v-card-title>

        <v-card-text class="pa-0">
          <table class="w-full text-left border-collapse text-slate-700">
            <thead>
              <tr class="bg-slate-50 border-b border-slate-200">
                <th class="px-5 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Mã đơn</th>
                <th class="px-5 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Tổng tiền</th>
                <th class="px-5 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Thanh toán</th>
                <th class="px-5 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Trạng thái</th>
                <th class="px-5 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Ngày tạo</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr
                v-for="o in selectedCustomerHistory.orders"
                :key="o.id"
                class="hover:bg-slate-50/60 transition-colors cursor-pointer"
                @click="viewOrder(o); customerHistoryDialog = false"
              >
                <td class="px-5 py-3 font-mono font-bold text-primary">{{ o.orderCode || `#${o.id}` }}</td>
                <td class="px-5 py-3 font-semibold">{{ formatPrice(o.totalAmount ?? o.finalAmount) }}</td>
                <td class="px-5 py-3">
                  <span :class="paymentDisplay(o).cls" class="text-xs font-medium border px-2 py-0.5 rounded-full">{{ paymentDisplay(o).label }}</span>
                </td>
                <td class="px-5 py-3">
                  <span :class="statusBadgeClass(o.status)">{{ translateStatus(o.status) }}</span>
                </td>
                <td class="px-5 py-3 text-sm text-slate-500">{{ formatDate(o.orderDate ?? o.createdAt) }}</td>
              </tr>
            </tbody>
          </table>
        </v-card-text>

        <v-card-actions class="pa-4 border-t justify-end">
          <v-btn variant="text" @click="customerHistoryDialog = false">Đóng</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- ===== DIALOG TẠO ĐƠN HÀNG ===== -->
    <v-dialog v-model="createDialog" max-width="780" persistent>
      <v-card rounded="xl">
        <v-card-title class="pa-6 pb-4 d-flex align-center justify-space-between border-b">
          <span class="text-h6 font-weight-bold">
            <v-icon color="success" class="mr-2">mdi-cart-plus</v-icon>
            Tạo đơn bán hàng mới
          </span>
          <v-btn icon="mdi-close" variant="text" @click="closeCreateDialog"></v-btn>
        </v-card-title>

        <v-card-text class="pa-6">
          <v-form ref="formRef">
            <!-- Khách hàng -->
            <div class="mb-4">
              <label class="field-label">Khách hàng <span class="text-error">*</span></label>
              <v-select
                v-model="form.customerId"
                :items="customers"
                item-title="fullName"
                item-value="id"
                variant="outlined"
                density="comfortable"
                placeholder="Chọn khách hàng..."
                :rules="[v => !!v || 'Vui lòng chọn khách hàng']"
                :loading="loadingCustomers"
                clearable
              >
                <template #item="{ props, item }">
                  <v-list-item v-bind="props">
                    <template #subtitle>
                      {{ item.raw.phone || 'Chưa có SĐT' }}
                      <span v-if="item.raw._source === 'user'" class="text-primary ml-1">(User hệ thống)</span>
                    </template>
                  </v-list-item>
                </template>
              </v-select>
            </div>

            <!-- Sản phẩm -->
            <div class="mb-2">
              <div class="d-flex align-center justify-space-between mb-3">
                <label class="field-label">Sản phẩm <span class="text-error">*</span></label>
                <v-btn size="small" color="success" variant="tonal" prepend-icon="mdi-plus" @click="addItem">
                  Thêm sản phẩm
                </v-btn>
              </div>

              <div v-if="loadingProducts" class="text-center py-4">
                <v-progress-circular indeterminate color="primary" size="24"></v-progress-circular>
                <span class="ml-2 text-caption text-slate-500">Đang tải danh sách sản phẩm...</span>
              </div>

              <div v-for="(item, idx) in form.items" :key="idx" class="item-row mb-3 pa-3 rounded-lg bg-slate-50 border border-slate-200">
                <div class="d-flex align-center gap-2 mb-2">
                  <span class="text-caption font-weight-bold text-slate-500">SP {{ idx + 1 }}</span>
                  <v-spacer></v-spacer>
                  <v-btn icon="mdi-close" size="x-small" variant="text" color="error" @click="removeItem(idx)"></v-btn>
                </div>
                <v-row dense>
                  <v-col cols="12" sm="5">
                    <v-autocomplete
                      v-model="item.productId"
                      :items="productCatalog"
                      item-title="name"
                      item-value="id"
                      label="Chọn sản phẩm"
                      variant="outlined"
                      density="compact"
                      :rules="[v => !!v || 'Bắt buộc']"
                      no-data-text="Không có sản phẩm"
                      @update:model-value="(id) => onProductSelect(id, idx)"
                    >
                      <template #item="{ props: p, item: pi }">
                        <v-list-item v-bind="p">
                          <template #subtitle>
                            <span v-if="(pi.raw.quantity ?? pi.raw.stockQuantity) != null">
                              Tồn kho: {{ pi.raw.quantity ?? pi.raw.stockQuantity }}
                              <span v-if="(pi.raw.quantity ?? pi.raw.stockQuantity) === 0" class="text-error font-weight-bold"> • Hết hàng</span>
                            </span>
                          </template>
                        </v-list-item>
                      </template>
                    </v-autocomplete>
                    <!-- Cảnh báo tồn kho -->
                    <div v-if="item.stockQuantity === 0" class="text-xs text-error mt-1 font-weight-bold">
                      ⚠ Sản phẩm hết hàng
                    </div>
                    <div v-else-if="item.stockQuantity != null && item.quantity > item.stockQuantity" class="text-xs text-warning mt-1 font-weight-bold">
                      ⚠ Chỉ còn {{ item.stockQuantity }} sản phẩm trong kho
                    </div>
                  </v-col>
                  <v-col cols="5" sm="3">
                    <v-text-field
                      v-model.number="item.unitPrice"
                      label="Đơn giá (VND)"
                      variant="outlined"
                      density="compact"
                      type="number"
                      :rules="[v => v > 0 || 'Phải > 0']"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="4" sm="2">
                    <v-text-field
                      v-model.number="item.quantity"
                      label="SL"
                      variant="outlined"
                      density="compact"
                      type="number"
                      min="1"
                      :rules="[v => v > 0 || 'Phải > 0']"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="3" sm="2" class="d-flex align-center justify-center">
                    <span class="text-caption font-weight-bold text-success">
                      {{ formatPrice(item.unitPrice * item.quantity) }}
                    </span>
                  </v-col>
                </v-row>
              </div>

              <div v-if="form.items.length === 0" class="text-center py-4 text-slate-400 text-caption border border-dashed border-slate-300 rounded-lg">
                Chưa có sản phẩm. Nhấn "Thêm sản phẩm" để bắt đầu.
              </div>
            </div>

            <!-- Tổng tiền preview -->
            <div v-if="form.items.length > 0" class="mb-4 pa-3 bg-green-50 rounded-lg border border-green-100">
              <div class="d-flex justify-space-between text-body-2 mb-1">
                <span class="text-slate-600">Tổng tạm tính:</span>
                <span class="font-weight-bold">{{ formatPrice(subtotal) }}</span>
              </div>
              <div class="d-flex justify-space-between text-body-2 mb-1">
                <span class="text-slate-600">Giảm giá:</span>
                <span class="text-error">- {{ formatPrice(form.discountAmount) }}</span>
              </div>
              <v-divider class="my-2"></v-divider>
              <div class="d-flex justify-space-between text-body-1 font-weight-black">
                <span>Khách phải trả:</span>
                <span class="text-success text-h6">{{ formatPrice(subtotal - form.discountAmount) }}</span>
              </div>
            </div>

            <v-row dense>
              <v-col cols="12" sm="6">
                <label class="field-label">Phương thức thanh toán</label>
                <v-select
                  v-model="form.paymentMethod"
                  :items="paymentMethods"
                  variant="outlined"
                  density="comfortable"
                ></v-select>
              </v-col>
              <v-col cols="12" sm="6">
                <label class="field-label">Giảm giá (VND)</label>
                <v-text-field
                  v-model.number="form.discountAmount"
                  variant="outlined"
                  density="comfortable"
                  type="number"
                  min="0"
                ></v-text-field>
              </v-col>
            </v-row>

            <v-checkbox
              v-model="form.isPaid"
              label="Khách đã thanh toán ngay"
              color="success"
              density="compact"
              class="mt-1"
            ></v-checkbox>

            <div class="mt-2">
              <label class="field-label">Ghi chú</label>
              <v-textarea
                v-model="form.note"
                variant="outlined"
                density="comfortable"
                rows="2"
                placeholder="Ghi chú thêm về đơn hàng..."
              ></v-textarea>
            </div>
          </v-form>
        </v-card-text>

        <v-card-actions class="pa-6 pt-0 d-flex justify-end gap-3">
          <v-btn variant="outlined" @click="closeCreateDialog">Hủy</v-btn>
          <v-btn color="success" :loading="submitting" :disabled="form.items.length === 0" @click="submitOrder">
            <v-icon start>mdi-check</v-icon> Xác nhận tạo đơn
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- ===== DIALOG XEM CHI TIẾT ===== -->
    <v-dialog v-model="detailDialog" max-width="720">
      <v-card v-if="selectedOrder" rounded="xl">
        <v-card-title class="pa-6 pb-4 border-b d-flex align-center justify-space-between">
          <span class="text-h6 font-weight-bold">
            Chi tiết đơn — {{ selectedOrder.orderCode || `#${selectedOrder.id}` }}
          </span>
          <v-btn icon="mdi-close" variant="text" @click="detailDialog = false"></v-btn>
        </v-card-title>

        <v-card-text class="pa-6">
          <v-row class="mb-2">
            <v-col cols="6" sm="3">
              <p class="text-caption text-slate-500 mb-1">Khách hàng</p>
              <p class="font-weight-bold text-slate-900">{{ selectedOrder.customerName || '—' }}</p>
            </v-col>
            <v-col cols="6" sm="3">
              <p class="text-caption text-slate-500 mb-1">Ngày đặt</p>
              <p>{{ formatDate(selectedOrder.orderDate ?? selectedOrder.createdAt) }}</p>
            </v-col>
            <v-col cols="6" sm="3">
              <p class="text-caption text-slate-500 mb-1">Thanh toán</p>
              <span :class="paymentDisplay(selectedOrder).cls" class="text-xs font-bold border px-2.5 py-1 rounded-full">
                {{ paymentDisplay(selectedOrder).label === 'Đã TT' ? 'Đã thanh toán' : paymentDisplay(selectedOrder).label === 'Chưa TT' ? 'Chưa thanh toán' : 'Đã hủy' }}
              </span>
            </v-col>
            <v-col cols="6" sm="3">
              <p class="text-caption text-slate-500 mb-1">Ghi chú</p>
              <p class="text-sm">{{ selectedOrder.note || '—' }}</p>
            </v-col>
          </v-row>

          <v-divider class="my-4"></v-divider>
          <p class="text-subtitle-2 font-weight-bold mb-3">Danh sách sản phẩm</p>
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-slate-200">
                <th class="text-left py-2 text-slate-500 font-medium">Sản phẩm</th>
                <th class="text-right py-2 text-slate-500 font-medium">Đơn giá</th>
                <th class="text-right py-2 text-slate-500 font-medium">SL</th>
                <th class="text-right py-2 text-slate-500 font-medium">Thành tiền</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="item in (selectedOrder.items ?? selectedOrder.orderItems ?? [])"
                :key="item.id ?? item.productId"
                class="border-b border-slate-100"
              >
                <td class="py-2">{{ item.productName }}</td>
                <td class="py-2 text-right">{{ formatPrice(item.unitPrice) }}</td>
                <td class="py-2 text-right">{{ item.quantity }}</td>
                <td class="py-2 text-right font-weight-bold">{{ formatPrice((item.lineTotal ?? (item.unitPrice * item.quantity))) }}</td>
              </tr>
              <tr v-if="!(selectedOrder.items ?? selectedOrder.orderItems)?.length">
                <td colspan="4" class="py-4 text-center text-slate-400 text-caption">Không có dữ liệu sản phẩm</td>
              </tr>
            </tbody>
          </table>

          <div class="mt-4 text-right space-y-1">
            <p class="text-body-2 text-slate-600">Tạm tính: <strong>{{ formatPrice(selectedOrder.subTotal ?? selectedOrder.totalAmount) }}</strong></p>
            <p class="text-body-2 text-slate-600">Giảm giá: <strong class="text-error">- {{ formatPrice(selectedOrder.discountAmount ?? 0) }}</strong></p>
            <p class="text-h6 font-weight-black text-success">Tổng: {{ formatPrice(selectedOrder.totalAmount ?? selectedOrder.finalAmount) }}</p>
          </div>
        </v-card-text>

        <v-card-actions class="pa-4 border-t d-flex justify-end gap-2">
          <v-btn variant="outlined" color="primary" size="small" @click="openEditDialog(selectedOrder); detailDialog = false">
            <v-icon start size="small">mdi-pencil-outline</v-icon> Chỉnh sửa
          </v-btn>
          <v-btn variant="text" @click="detailDialog = false">Đóng</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- ===== DIALOG CHỈNH SỬA ĐƠN HÀNG ===== -->
    <v-dialog v-model="editDialog" max-width="760" persistent scrollable>
      <v-card v-if="orderForEdit" rounded="xl">
        <v-card-title class="pa-6 pb-4 border-b d-flex align-center justify-space-between">
          <span class="text-h6 font-weight-bold">
            <v-icon color="warning" class="mr-2">mdi-pencil-outline</v-icon>
            Chỉnh sửa — {{ orderForEdit.orderCode || `#${orderForEdit.id}` }}
          </span>
          <v-btn icon="mdi-close" variant="text" @click="editDialog = false"></v-btn>
        </v-card-title>

        <v-card-text class="pa-6">
          <!-- Thông tin cơ bản (chỉ đọc) -->
          <v-row class="mb-3">
            <v-col cols="6" sm="3">
              <p class="text-caption text-slate-500 mb-1">Khách hàng</p>
              <p class="font-weight-bold text-slate-900">{{ orderForEdit.customerName || '—' }}</p>
            </v-col>
            <v-col cols="6" sm="3">
              <p class="text-caption text-slate-500 mb-1">Ngày đặt</p>
              <p class="text-sm">{{ formatDate(orderForEdit.orderDate ?? orderForEdit.createdAt) }}</p>
            </v-col>
            <v-col cols="6" sm="3">
              <p class="text-caption text-slate-500 mb-1">Phương thức TT</p>
              <p class="text-sm">{{ orderForEdit.paymentMethod || '—' }}</p>
            </v-col>
            <v-col cols="6" sm="3">
              <p class="text-caption text-slate-500 mb-1">Tổng tiền</p>
              <p class="font-weight-black text-success">{{ formatPrice(orderForEdit.totalAmount ?? orderForEdit.finalAmount) }}</p>
            </v-col>
          </v-row>

          <!-- Bảng sản phẩm (chỉ đọc) -->
          <p class="text-subtitle-2 font-weight-bold mb-2">Sản phẩm trong đơn</p>
          <div class="rounded-lg border border-slate-200 overflow-hidden mb-5">
            <table class="w-full text-sm">
              <thead>
                <tr class="bg-slate-50 border-b border-slate-200">
                  <th class="text-left px-4 py-2 text-slate-500 font-medium">Sản phẩm</th>
                  <th class="text-right px-4 py-2 text-slate-500 font-medium">Đơn giá</th>
                  <th class="text-right px-4 py-2 text-slate-500 font-medium">SL</th>
                  <th class="text-right px-4 py-2 text-slate-500 font-medium">Thành tiền</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="item in (orderForEdit.items ?? orderForEdit.orderItems ?? [])"
                  :key="item.id ?? item.productId"
                  class="border-b border-slate-100 last:border-0"
                >
                  <td class="px-4 py-2">{{ item.productName }}</td>
                  <td class="px-4 py-2 text-right">{{ formatPrice(item.unitPrice) }}</td>
                  <td class="px-4 py-2 text-right">{{ item.quantity }}</td>
                  <td class="px-4 py-2 text-right font-weight-bold">{{ formatPrice(item.lineTotal ?? (item.unitPrice * item.quantity)) }}</td>
                </tr>
                <tr v-if="!(orderForEdit.items ?? orderForEdit.orderItems)?.length">
                  <td colspan="4" class="px-4 py-3 text-center text-slate-400 text-caption">Không có dữ liệu sản phẩm</td>
                </tr>
              </tbody>
            </table>
            <div class="px-4 py-2 bg-slate-50 border-t border-slate-200 text-right text-sm">
              <span v-if="(orderForEdit.discountAmount ?? 0) > 0" class="text-slate-500 mr-4">
                Giảm giá: <strong class="text-error">-{{ formatPrice(orderForEdit.discountAmount) }}</strong>
              </span>
              <span class="font-weight-black text-success">Tổng: {{ formatPrice(orderForEdit.totalAmount ?? orderForEdit.finalAmount) }}</span>
            </div>
          </div>

          <v-divider class="mb-4"></v-divider>
          <p class="text-subtitle-2 font-weight-bold mb-3">Cập nhật thông tin</p>

          <v-row>
            <v-col cols="12" sm="6">
              <label class="field-label">Trạng thái đơn hàng</label>
              <v-select
                v-model="editForm.status"
                :items="ALL_STATUSES"
                item-title="label"
                item-value="value"
                variant="outlined"
                density="comfortable"
              ></v-select>
            </v-col>
          </v-row>

          <div class="mt-1">
            <label class="field-label">Ghi chú</label>
            <v-textarea
              v-model="editForm.note"
              variant="outlined"
              density="comfortable"
              rows="2"
              placeholder="Ghi chú về đơn hàng..."
            ></v-textarea>
          </div>
        </v-card-text>

        <v-card-actions class="pa-4 border-t d-flex justify-space-between">
          <v-btn color="error" variant="text" size="small" @click="confirmDelete(orderForEdit); editDialog = false">
            <v-icon start>mdi-delete-outline</v-icon> Xóa đơn
          </v-btn>
          <div class="d-flex gap-2">
            <v-btn variant="outlined" @click="editDialog = false">Hủy</v-btn>
            <v-btn color="primary" :loading="savingEdit" @click="submitEdit">
              <v-icon start>mdi-content-save-outline</v-icon> Lưu thay đổi
            </v-btn>
          </div>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- ===== DIALOG XÁC NHẬN XÓA ===== -->
    <v-dialog v-model="deleteDialog" max-width="400">
      <v-card rounded="xl" class="pa-2">
        <v-card-title class="pa-4 text-body-1 font-weight-bold">Xác nhận xóa đơn hàng</v-card-title>
        <v-card-text class="pa-4 pt-0 text-slate-600">
          Bạn có chắc muốn xóa đơn <strong class="text-error">{{ orderToDelete?.orderCode }}</strong> không? Hành động này không thể hoàn tác.
        </v-card-text>
        <v-card-actions class="pa-4 pt-0 justify-end gap-2">
          <v-btn variant="text" @click="deleteDialog = false">Hủy</v-btn>
          <v-btn color="error" variant="flat" :loading="deleting" @click="deleteOrder">Xóa</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Snackbar thông báo -->
    <v-snackbar v-model="snackbar" :color="snackbarColor" timeout="3500" location="bottom right" rounded="lg">
      {{ snackbarText }}
      <template #actions>
        <v-btn variant="text" @click="snackbar = false">Đóng</v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import api from '@/config/api';

// ── State ──────────────────────────────────────────
const orders = ref([]);
const customers = ref([]);
const productCatalog = ref([]);
const loading = ref(false);
const loadingCustomers = ref(false);
const loadingProducts = ref(false);
const error = ref(null);

// Pagination
const currentPage = ref(1);
const pageSize = ref(10);
const search = ref('');
const statusFilter = ref('all');
const activeTab = ref('orders');
const customerSearch = ref('');
const customerHistoryDialog = ref(false);
const selectedCustomerHistory = ref(null);

// Supplier state
const suppliers = ref([]);
const loadingSuppliers = ref(false);
const supplierSearch = ref('');
const supplierDialog = ref(false);
const supplierDeleteDialog = ref(false);
const savingSupplier = ref(false);
const deletingSupplier = ref(false);
const supplierToDelete = ref(null);
const supplierEditMode = ref(false);
const defaultSupplierForm = () => ({ id: null, name: '', phone: '', email: '', address: '', contactPerson: '', note: '' });
const supplierForm = ref(defaultSupplierForm());

// Dialogs
const createDialog = ref(false);
const detailDialog = ref(false);
const editDialog = ref(false);
const deleteDialog = ref(false);
const submitting = ref(false);
const deleting = ref(false);
const savingEdit = ref(false);
const selectedOrder = ref(null);
const orderForEdit = ref(null);
const orderToDelete = ref(null);
const editForm = ref({ status: '', isPaid: false, note: '' });
const formRef = ref(null);

// Snackbar
const snackbar = ref(false);
const snackbarText = ref('');
const snackbarColor = ref('success');

// Form
const paymentMethods = ['Tiền mặt', 'Chuyển khoản', 'Thẻ ngân hàng', 'Ví điện tử'];
const defaultForm = () => ({
  customerId: null,
  discountAmount: 0,
  isPaid: false,
  paymentMethod: 'Tiền mặt',
  note: '',
  items: []
});
const form = ref(defaultForm());

// ── Constants ──────────────────────────────────────
const STATUS_MAP = {
  Pending:   { label: 'Chờ xử lý',     color: 'amber',   badge: 'bg-amber-50 text-amber-700 border-amber-200' },
  Confirmed: { label: 'Đã xác nhận',   color: 'blue',    badge: 'bg-blue-50 text-blue-700 border-blue-200' },
  Shipping:  { label: 'Đang giao',      color: 'indigo',  badge: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  Completed: { label: 'Đã hoàn thành', color: 'emerald', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  Paid:      { label: 'Đã thanh toán', color: 'emerald', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  Cancelled: { label: 'Đã hủy',        color: 'red',     badge: 'bg-rose-50 text-rose-700 border-rose-200' },
  Canceled:  { label: 'Đã hủy',        color: 'red',     badge: 'bg-rose-50 text-rose-700 border-rose-200' },
};

const statusFilterOptions = [
  { label: 'Tất cả trạng thái', value: 'all' },
  { label: 'Chờ xử lý',        value: 'Pending' },
  { label: 'Đã thanh toán',    value: 'paid' },
  { label: 'Đã hủy',           value: 'Cancelled' },
];

const ALL_STATUSES = [
  { value: 'Pending',   label: 'Chờ xử lý',     color: 'amber' },
  { value: 'Completed', label: 'Đã hoàn thành',  color: 'success' },
  { value: 'Cancelled', label: 'Đã hủy',         color: 'error' },
];

// ── Helpers ────────────────────────────────────────
const isEffectivelyPaid = (order) =>
  order.isPaid || order.status === 'Completed' || order.status === 'Paid';

const paymentDisplay = (order) => {
  if (order.status === 'Cancelled' || order.status === 'Canceled') {
    return { label: 'Hủy', cls: 'bg-rose-50 text-rose-700 border-rose-200' };
  }
  if (order.status === 'Completed' || order.status === 'Paid') {
    return { label: 'Đã TT', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
  }
  return { label: 'Chưa TT', cls: 'bg-amber-50 text-amber-700 border-amber-200' };
};

// ── Computed ───────────────────────────────────────
const filteredOrders = computed(() => {
  let list = orders.value;
  if (statusFilter.value === 'paid') {
    list = list.filter(o => o.status === 'Completed' || o.status === 'Paid');
  } else if (statusFilter.value === 'Cancelled') {
    list = list.filter(o => o.status === 'Cancelled' || o.status === 'Canceled');
  } else if (statusFilter.value !== 'all') {
    list = list.filter(o => o.status === statusFilter.value);
  }
  if (search.value.trim()) {
    const q = search.value.toLowerCase();
    list = list.filter(o =>
      (o.orderCode || '').toLowerCase().includes(q) ||
      (o.customerName || '').toLowerCase().includes(q)
    );
  }
  return list;
});

const totalOrders = computed(() => filteredOrders.value.length);
const totalPages = computed(() => Math.ceil(totalOrders.value / pageSize.value) || 1);
const paginatedOrders = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  return filteredOrders.value.slice(start, start + pageSize.value);
});

const rangeStart = computed(() => (currentPage.value - 1) * pageSize.value + 1);
const rangeEnd = computed(() => Math.min(currentPage.value * pageSize.value, totalOrders.value));

const pendingCount = computed(() => orders.value.filter(o => o.status === 'Pending' || o.status === 'Confirmed' || o.status === 'Shipping').length);
const completedCount = computed(() => orders.value.filter(o => o.status === 'Completed' || o.status === 'Paid').length);
const debtOrders = computed(() => orders.value.filter(o =>
  o.status !== 'Completed' && o.status !== 'Paid' &&
  o.status !== 'Cancelled' && o.status !== 'Canceled'
));
const debtTotal = computed(() => debtOrders.value.reduce((sum, o) => sum + (o.totalAmount ?? o.finalAmount ?? 0), 0));

const customerStats = computed(() => {
  const map = new Map();
  for (const o of orders.value) {
    const key = String(o.customerId || o.customerName || '');
    if (!key) continue;
    if (!map.has(key)) {
      map.set(key, { id: o.customerId, name: o.customerName || '—', phone: '', orderCount: 0, totalSpent: 0, debtAmount: 0, orders: [] });
    }
    const c = map.get(key);
    c.orderCount++;
    const amt = o.totalAmount ?? o.finalAmount ?? 0;
    if (o.status !== 'Cancelled' && o.status !== 'Canceled') c.totalSpent += amt;
    if (o.status !== 'Completed' && o.status !== 'Paid' && o.status !== 'Cancelled' && o.status !== 'Canceled') c.debtAmount += amt;
    c.orders.push(o);
  }
  for (const c of customers.value) {
    const entry = map.get(String(c.id)) || map.get(c.fullName);
    if (entry && c.phone) entry.phone = c.phone;
  }
  return [...map.values()].sort((a, b) => b.totalSpent - a.totalSpent);
});

const filteredCustomerStats = computed(() => {
  if (!customerSearch.value.trim()) return customerStats.value;
  const q = customerSearch.value.toLowerCase();
  return customerStats.value.filter(c => c.name.toLowerCase().includes(q) || (c.phone || '').includes(q));
});

const subtotal = computed(() =>
  form.value.items.reduce((sum, i) => sum + (i.unitPrice || 0) * (i.quantity || 0), 0)
);


const notify = (text, color = 'success') => {
  snackbarText.value = text;
  snackbarColor.value = color;
  snackbar.value = true;
};

const translateStatus = (status) => STATUS_MAP[status]?.label ?? status ?? 'Chờ xử lý';
const statusBadgeClass = (status) => {
  const base = 'inline-flex items-center text-xs font-bold px-2.5 py-0.5 rounded-full border ';
  return base + (STATUS_MAP[status]?.badge ?? 'bg-slate-50 text-slate-700 border-slate-200');
};

const formatPrice = (price) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price || 0);

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
};

// ── API calls ──────────────────────────────────────
const fetchOrders = async () => {
  loading.value = true;
  error.value = null;
  try {
    const res = await api.get('/api/Orders');
    const data = res.data;
    orders.value = Array.isArray(data) ? data : (data?.data ?? []);
    currentPage.value = 1;
  } catch {
    error.value = 'Không thể tải danh sách đơn hàng. Kiểm tra kết nối gateway (port 5000).';
  } finally {
    loading.value = false;
  }
};

const fetchCustomers = async () => {
  loadingCustomers.value = true;
  try {
    const [custRes, userRes] = await Promise.allSettled([
      api.get('/api/Customers'),
      api.get('/api/users'),
    ]);

    const custList = custRes.status === 'fulfilled'
      ? (Array.isArray(custRes.value.data) ? custRes.value.data : [])
      : [];

    const userList = userRes.status === 'fulfilled'
      ? (Array.isArray(userRes.value.data) ? userRes.value.data : [])
      : [];

    const mappedUsers = userList
      .filter(u => u.role !== 'Admin')
      .map(u => ({
        id: u.id,
        fullName: u.displayName || u.fullName || u.userName || u.email || `User #${u.id}`,
        phone: u.phone || '',
        _source: 'user',
      }));

    const existingIds = new Set(custList.map(c => String(c.id)));
    customers.value = [...custList, ...mappedUsers.filter(u => !existingIds.has(String(u.id)))];
  } catch {
    customers.value = [];
  } finally {
    loadingCustomers.value = false;
  }
};

const fetchProducts = async () => {
  loadingProducts.value = true;
  try {
    const res = await api.get('/api/products', { params: { pageSize: 200 } });
    productCatalog.value = res.data?.data ?? (Array.isArray(res.data) ? res.data : []);
  } catch {
    productCatalog.value = [];
    notify('Không thể tải sản phẩm từ Team 5. Vui lòng nhập tên và giá thủ công.', 'warning');
  } finally {
    loadingProducts.value = false;
  }
};

// Upsert customer: nếu là user hệ thống (Team 6), tạo mới trong Team 4 customer table
const resolveCustomerId = async () => {
  const selected = customers.value.find(c => String(c.id) === String(form.value.customerId));
  if (!selected || selected._source !== 'user') return Number(form.value.customerId);

  try {
    const listRes = await api.get('/api/Customers');
    const existing = (listRes.data || []).find(
      c => c.fullName?.trim().toLowerCase() === selected.fullName?.trim().toLowerCase()
    );
    if (existing) return existing.id;
  } catch { /* ignore */ }

  const createRes = await api.post('/api/Customers', {
    fullName: selected.fullName,
    phone: selected.phone || '0000000000',
    email: selected.email || '',
    customerCode: 'KH' + Date.now().toString().slice(-6),
  });
  return createRes.data?.id ?? createRes.data;
};

// Fire-and-forget: giảm tồn kho Team 5 qua /api/internal/stock/deduct
const fireDecreaseStock = (orderId, items) => {
  const deductItems = items.filter(i => i.productId).map(i => ({ productId: i.productId, quantity: i.quantity }));
  if (deductItems.length === 0) return;
  api.post('/api/internal/stock/deduct', { orderId, items: deductItems }).catch(() => {});
};

// Khi đơn → Completed: fetch items nếu cần, trừ kho Team 5 + webhook Team 6
const onOrderCompleted = async (order, knownItems) => {
  let items = knownItems && knownItems.length > 0
    ? knownItems
    : (order.items ?? order.orderItems ?? []);
  if (items.length === 0) {
    try {
      const detail = await api.get(`/api/Orders/${order.id}`);
      items = detail.data?.items ?? detail.data?.orderItems ?? [];
    } catch { /* ignore */ }
  }
  fireDecreaseStock(order.id, items);
  api.post('/api/events/order-created', {
    orderId: order.id,
    customerId: order.customerId,
    customerName: order.customerName ?? '',
    totalAmount: order.totalAmount ?? 0,
    status: 'Completed',
    createdAt: order.orderDate ?? order.createdAt ?? new Date().toISOString(),
    items: items.map(i => ({
      productId: i.productId,
      productName: i.productName,
      quantity: i.quantity,
      unitPrice: i.unitPrice,
    })),
  }).catch(() => {});
};

// ── Dialog handlers ────────────────────────────────
const openCreateDialog = async () => {
  form.value = defaultForm();
  createDialog.value = true;
  if (customers.value.length === 0) fetchCustomers();
  if (productCatalog.value.length === 0) fetchProducts();
};

const closeCreateDialog = () => {
  createDialog.value = false;
  form.value = defaultForm();
};

const addItem = () => {
  form.value.items.push({ productId: null, productName: '', unitPrice: 0, quantity: 1, stockQuantity: null });
};

const removeItem = (idx) => form.value.items.splice(idx, 1);

const onProductSelect = (productId, idx) => {
  const p = productCatalog.value.find(p => p.id === productId);
  if (p) {
    form.value.items[idx].productName = p.name;
    form.value.items[idx].unitPrice = p.salePrice || p.price || 0;
    form.value.items[idx].stockQuantity = p.quantity ?? p.stockQuantity ?? p.stock ?? null;
  }
};

const openCustomerHistory = (cust) => {
  selectedCustomerHistory.value = cust;
  customerHistoryDialog.value = true;
};

const submitOrder = async () => {
  const { valid } = await formRef.value.validate();
  if (!valid || form.value.items.length === 0) return;

  submitting.value = true;
  const orderedItems = [...form.value.items];
  try {
    const resolvedCustomerId = await resolveCustomerId();
    const orderRes = await api.post('/api/Orders', {
      customerId: resolvedCustomerId,
      discountAmount: form.value.discountAmount || 0,
      isPaid: form.value.isPaid,
      paymentMethod: form.value.paymentMethod,
      note: form.value.note,
      items: orderedItems.map(i => ({
        productId: i.productId,
        productName: i.productName,
        unitPrice: i.unitPrice,
        quantity: i.quantity,
      })),
    });

    const created = orderRes.data || {};
    closeCreateDialog();
    await fetchOrders();
    notify(`Tạo đơn ${created.orderCode ?? ''} thành công!`);

    // Nếu khách TT ngay → coi là Completed: trừ kho + webhook
    if (form.value.isPaid) {
      onOrderCompleted({ ...created, customerName: created.customerName ?? '' }, orderedItems);
    }
  } catch (e) {
    error.value = e.response?.data?.message || e.response?.data || 'Tạo đơn hàng thất bại.';
  } finally {
    submitting.value = false;
  }
};

const viewOrder = (order) => {
  selectedOrder.value = order;
  detailDialog.value = true;
};

const openEditDialog = (order) => {
  orderForEdit.value = order;
  editForm.value = {
    status: order.status || 'Pending',
    isPaid: isEffectivelyPaid(order),
    note: order.note || '',
  };
  editDialog.value = true;
};

const submitEdit = async () => {
  if (!orderForEdit.value) return;
  savingEdit.value = true;
  const prevStatus = orderForEdit.value.status;
  try {
    const newIsPaid = editForm.value.status === 'Completed' || editForm.value.status === 'Paid';
    await api.put(`/api/Orders/${orderForEdit.value.id}/status`, {
      status: editForm.value.status,
      isPaid: newIsPaid,
      note: editForm.value.note,
    });
    const idx = orders.value.findIndex(o => o.id === orderForEdit.value.id);
    if (idx !== -1) {
      orders.value[idx] = {
        ...orders.value[idx],
        status: editForm.value.status,
        isPaid: newIsPaid,
        note: editForm.value.note,
      };
    }
    editDialog.value = false;
    notify(`Cập nhật đơn ${orderForEdit.value.orderCode ?? ''} thành công!`);

    // Chuyển sang Completed: trừ kho + webhook (items sẽ được fetch nếu rỗng)
    if (editForm.value.status === 'Completed' && prevStatus !== 'Completed') {
      const order = orders.value[idx] ?? orderForEdit.value;
      onOrderCompleted(order, []);
    }
  } catch (e) {
    notify(e.response?.data?.message || 'Cập nhật thất bại.', 'error');
  } finally {
    savingEdit.value = false;
  }
};

const markAsPaid = async (order) => {
  try {
    await api.put(`/api/Orders/${order.id}/status`, { status: 'Completed', isPaid: true });
    const idx = orders.value.findIndex(o => o.id === order.id);
    if (idx !== -1) orders.value[idx] = { ...orders.value[idx], status: 'Completed', isPaid: true };
    notify('Đã thu tiền thành công!');
    onOrderCompleted({ ...order, status: 'Completed' }, order.items ?? order.orderItems ?? []);
  } catch {
    notify('Cập nhật thanh toán thất bại.', 'error');
  }
};

const confirmDelete = (order) => {
  orderToDelete.value = order;
  deleteDialog.value = true;
};

const deleteOrder = async () => {
  deleting.value = true;
  try {
    await api.delete(`/api/Orders/${orderToDelete.value.id}`);
    orders.value = orders.value.filter(o => o.id !== orderToDelete.value.id);
    deleteDialog.value = false;
    notify('Xóa đơn hàng thành công!');
  } catch {
    notify('Xóa đơn hàng thất bại.', 'error');
    deleteDialog.value = false;
  } finally {
    deleting.value = false;
  }
};

// ── Supplier CRUD ──────────────────────────────────
const fetchSuppliers = async () => {
  loadingSuppliers.value = true;
  try {
    const res = await api.get('/api/Suppliers');
    suppliers.value = Array.isArray(res.data) ? res.data : (res.data?.data ?? []);
  } catch {
    suppliers.value = [];
  } finally {
    loadingSuppliers.value = false;
  }
};

const filteredSuppliers = computed(() => {
  if (!supplierSearch.value.trim()) return suppliers.value;
  const q = supplierSearch.value.toLowerCase();
  return suppliers.value.filter(s =>
    (s.name || '').toLowerCase().includes(q) ||
    (s.phone || '').includes(q) ||
    (s.contactPerson || '').toLowerCase().includes(q)
  );
});

const openSupplierCreate = () => {
  supplierForm.value = defaultSupplierForm();
  supplierEditMode.value = false;
  supplierDialog.value = true;
};

const openSupplierEdit = (s) => {
  supplierForm.value = { id: s.id, name: s.name || '', phone: s.phone || '', email: s.email || '', address: s.address || '', contactPerson: s.contactPerson || '', note: s.note || '' };
  supplierEditMode.value = true;
  supplierDialog.value = true;
};

const saveSupplier = async () => {
  savingSupplier.value = true;
  try {
    if (supplierEditMode.value) {
      await api.put(`/api/Suppliers/${supplierForm.value.id}`, supplierForm.value);
      const idx = suppliers.value.findIndex(s => s.id === supplierForm.value.id);
      if (idx !== -1) suppliers.value[idx] = { ...suppliers.value[idx], ...supplierForm.value };
      notify('Cập nhật nhà cung cấp thành công!');
    } else {
      const res = await api.post('/api/Suppliers', supplierForm.value);
      suppliers.value.unshift(res.data || supplierForm.value);
      notify('Thêm nhà cung cấp thành công!');
    }
    supplierDialog.value = false;
  } catch (e) {
    notify(e.response?.data?.message || 'Lưu thất bại.', 'error');
  } finally {
    savingSupplier.value = false;
  }
};

const confirmDeleteSupplier = (s) => {
  supplierToDelete.value = s;
  supplierDeleteDialog.value = true;
};

const deleteSupplier = async () => {
  deletingSupplier.value = true;
  try {
    await api.delete(`/api/Suppliers/${supplierToDelete.value.id}`);
    suppliers.value = suppliers.value.filter(s => s.id !== supplierToDelete.value.id);
    supplierDeleteDialog.value = false;
    notify('Đã xóa nhà cung cấp!');
  } catch {
    notify('Xóa thất bại.', 'error');
    supplierDeleteDialog.value = false;
  } finally {
    deletingSupplier.value = false;
  }
};

// ── Init ───────────────────────────────────────────
onMounted(() => {
  fetchOrders();
  fetchCustomers();
  fetchSuppliers();
});
</script>

<style scoped>
.glass-card {
  background: #ffffff !important;
  border: 1px solid #e2e8f0 !important;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05) !important;
}
.stat-chip { transition: box-shadow 0.15s; }
.stat-chip:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.08) !important; }
.search-input :deep(.v-field) {
  border-radius: 9999px !important;
  background-color: #f8fafc !important;
}
.field-label {
  display: block;
  font-size: 12px;
  font-weight: 600;
  color: #475569;
  margin-bottom: 6px;
}
.item-row { transition: box-shadow 0.15s; }
.item-row:hover { box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
.gap-4 { gap: 16px; }
.gap-3 { gap: 12px; }
.gap-2 { gap: 8px; }
.gap-1 { gap: 4px; }
.space-y-1 > * + * { margin-top: 4px; }
</style>
