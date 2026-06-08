<template>
  <div>
    <v-row class="mb-6">
      <v-col cols="12" class="d-flex justify-space-between align-center flex-wrap gap-4">
        <div>
          <h1 class="text-h4 font-weight-black text-white">Tài khoản & Phân quyền</h1>
          <p class="text-subtitle-1 text-medium-emphasis">Quản lý nhân viên, phân quyền truy cập hệ thống và cấp phát JWT token (Phân hệ Nhóm 6)</p>
        </div>
        <v-btn color="info" prepend-icon="mdi-account-plus" rounded="lg">Thêm tài khoản mới</v-btn>
      </v-col>
    </v-row>

    <!-- Content Card -->
    <v-card class="glass-card pa-6" rounded="xl">
      <v-row class="mb-4">
        <v-col cols="12" sm="6" md="4">
          <v-text-field
            v-model="search"
            prepend-inner-icon="mdi-magnify"
            label="Tìm kiếm tên hoặc mã nhân viên..."
            variant="outlined"
            density="compact"
            hide-details
            color="info"
            rounded="lg"
          ></v-text-field>
        </v-col>
      </v-row>

      <v-table theme="dark" class="bg-transparent text-white">
        <thead>
          <tr>
            <th class="text-left font-weight-bold">ID</th>
            <th class="text-left font-weight-bold">Tên đăng nhập</th>
            <th class="text-left font-weight-bold">Tên hiển thị</th>
            <th class="text-left font-weight-bold">Quyền (Role)</th>
            <th class="text-left font-weight-bold">Trạng thái</th>
            <th class="text-left font-weight-bold">Hành động</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in users" :key="user.id">
            <td>{{ user.id }}</td>
            <td class="font-weight-bold text-info">{{ user.username }}</td>
            <td>{{ user.displayName }}</td>
            <td>
              <v-chip :color="getRoleColor(user.role)" size="small" class="text-white font-weight-bold">
                {{ user.role }}
              </v-chip>
            </td>
            <td>
              <v-chip :color="user.isActive ? 'success' : 'error'" size="x-small" variant="flat">
                {{ user.isActive ? 'Đang hoạt động' : 'Khóa' }}
              </v-chip>
            </td>
            <td>
              <v-btn icon size="x-small" color="info" variant="text" class="me-2"><v-icon>mdi-pencil-outline</v-icon></v-btn>
              <v-btn icon size="x-small" color="error" variant="text"><v-icon>mdi-lock-outline</v-icon></v-btn>
            </td>
          </tr>
        </tbody>
      </v-table>
    </v-card>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const search = ref('');

const getRoleColor = (role) => {
  switch (role) {
    case 'Admin': return 'primary';
    case 'Sales': return 'success';
    case 'Warehouse': return 'warning';
    default: return 'medium-emphasis';
  }
};

const users = ref([
  { id: 1, username: 'admin', displayName: 'Quản trị viên Hệ thống', role: 'Admin', isActive: true },
  { id: 2, username: 'sales_user1', displayName: 'Nguyễn Văn Thu ngân', role: 'Sales', isActive: true },
  { id: 3, username: 'warehouse_mgr', displayName: 'Trần Văn Thủ kho', role: 'Warehouse', isActive: true },
  { id: 4, username: 'disabled_user', displayName: 'Cựu Nhân viên', role: 'Sales', isActive: false },
]);
</script>

<style scoped>
.glass-card {
  background: rgba(30, 41, 59, 0.6) !important;
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.08);
}
.gap-4 {
  gap: 16px;
}
</style>
