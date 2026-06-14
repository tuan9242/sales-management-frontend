<template>
  <div class="flex-grow flex overflow-hidden h-full">
    <!-- Table Section -->
    <div class="flex-grow flex flex-col p-lg gap-lg overflow-y-auto bg-background pb-8">
      
      <!-- Nút đóng mở bộ lọc và các nút khác nếu cần ở phần đầu trang (nếu có thì thêm) -->
      <div class="flex justify-between items-start">
        <div class="flex flex-col gap-sm">
          <h1 class="font-headline-md text-headline-md text-primary font-bold">Quản lý Người dùng & Phân quyền</h1>
          <p class="font-body-sm text-body-sm text-on-surface-variant">Kiểm soát truy cập và quản lý các tài khoản nhân sự trong hệ thống ERP.</p>
        </div>
        <button @click="openAddModal" class="bg-primary text-on-primary px-4 py-2 rounded-lg font-label-md text-label-md flex items-center gap-2 shadow-sm hover:bg-primary-container transition-all">
          <span class="material-symbols-outlined text-[18px]" data-icon="person_add">person_add</span>
          Thêm người dùng mới
        </button>
      </div>

      <!-- Bento Style Stats Grid (Mini) -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-md">
        <div class="bg-surface-container-lowest p-md rounded-xl border border-outline-variant flex flex-col gap-xs">
          <span class="text-label-sm text-on-surface-variant uppercase tracking-wider">Tổng số User</span>
          <div class="flex items-end gap-sm">
            <span class="text-headline-sm font-bold text-primary">{{ totalUsers }}</span>
            <span class="text-label-sm text-green-600 mb-1">Toàn hệ thống</span>
          </div>
        </div>
        <div class="bg-surface-container-lowest p-md rounded-xl border border-outline-variant flex flex-col gap-xs">
          <span class="text-label-sm text-on-surface-variant uppercase tracking-wider">Đang hoạt động</span>
          <div class="flex items-end gap-sm">
            <span class="text-headline-sm font-bold text-primary">{{ activeUsers }}</span>
            <span class="text-label-sm text-outline mb-1">{{ activePercent }}%</span>
          </div>
        </div>
        <div class="bg-surface-container-lowest p-md rounded-xl border border-outline-variant flex flex-col gap-xs">
          <span class="text-label-sm text-on-surface-variant uppercase tracking-wider">Vai trò Admin</span>
          <div class="flex items-end gap-sm">
            <span class="text-headline-sm font-bold text-primary">{{ adminUsers }}</span>
            <span class="text-label-sm text-on-surface-variant mb-1">Quản trị viên</span>
          </div>
        </div>
        <div class="bg-surface-container-lowest p-md rounded-xl border border-outline-variant flex flex-col gap-xs">
          <span class="text-label-sm text-on-surface-variant uppercase tracking-wider">Bị khóa</span>
          <div class="flex items-end gap-sm">
            <span class="text-headline-sm font-bold text-error">{{ blockedUsers }}</span>
            <span class="text-label-sm text-error mb-1">Cần xác minh</span>
          </div>
        </div>
      </div>

      <!-- Data Table Card -->
      <div class="bg-surface-container-lowest rounded-xl border border-outline-variant overflow-hidden flex flex-col shadow-sm flex-grow">
        <div class="p-md border-b border-outline-variant bg-surface-container-low flex justify-between items-center">
          <div class="flex gap-md">
            <button @click="activeTab = 'All'" :class="activeTab === 'All' ? 'text-label-md font-bold text-primary border-b-2 border-primary pb-1' : 'text-label-md text-on-surface-variant hover:text-primary transition-colors'">Tất cả ({{ totalUsers }})</button>
            <button @click="activeTab = 'Admin'" :class="activeTab === 'Admin' ? 'text-label-md font-bold text-primary border-b-2 border-primary pb-1' : 'text-label-md text-on-surface-variant hover:text-primary transition-colors'">Quản trị viên</button>
            <button @click="activeTab = 'Sales'" :class="activeTab === 'Sales' ? 'text-label-md font-bold text-primary border-b-2 border-primary pb-1' : 'text-label-md text-on-surface-variant hover:text-primary transition-colors'">Bán hàng</button>
            <button @click="activeTab = 'Warehouse'" :class="activeTab === 'Warehouse' ? 'text-label-md font-bold text-primary border-b-2 border-primary pb-1' : 'text-label-md text-on-surface-variant hover:text-primary transition-colors'">Kho vận</button>
          </div>
          <div class="relative max-w-xs w-full">
            <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px]" data-icon="search">search</span>
            <input v-model="searchQuery" class="w-full bg-surface-container border border-outline-variant rounded-lg pl-10 pr-4 py-1.5 text-body-sm focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all" placeholder="Tìm kiếm người dùng..." type="text"/>
          </div>
        </div>
        
        <div class="overflow-x-auto">
          <!-- Loading state -->
          <div v-if="userStore.loading" class="p-8 text-center text-outline">
            <span class="material-symbols-outlined animate-spin text-4xl mb-2">refresh</span>
            <p>Đang tải dữ liệu...</p>
          </div>
          
          <table v-else class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-surface-container-low">
                <th class="px-md py-3 font-label-sm text-label-sm text-on-surface-variant uppercase">Họ tên & Email</th>
                <th class="px-md py-3 font-label-sm text-label-sm text-on-surface-variant uppercase">Vai trò</th>
                <th class="px-md py-3 font-label-sm text-label-sm text-on-surface-variant uppercase text-center">Xác thực</th>
                <th class="px-md py-3 font-label-sm text-label-sm text-on-surface-variant uppercase">Trạng thái</th>
                <th class="px-md py-3 font-label-sm text-label-sm text-on-surface-variant uppercase text-right">Hành động</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-outline-variant">
              <tr 
                v-for="user in filteredUsers" :key="user.id"
                class="hover:bg-surface-container-low transition-all duration-200 cursor-pointer group"
                :class="{ 'bg-primary-container/5': selectedUser?.id === user.id }"
                @click="toggleDetail(user)"
              >
                <td class="px-md py-3">
                  <div class="flex items-center gap-3">
                    <div :class="['shrink-0 h-10 w-10 rounded-full flex items-center justify-center font-bold text-label-md', getRoleBgColorClass(user.role), getRoleTextColorClass(user.role)]">
                      {{ getInitials(user.fullName) }}
                    </div>
                    <div class="flex flex-col">
                      <span class="font-label-md text-label-md text-on-surface font-semibold">{{ user.fullName }}</span>
                      <span class="font-data-mono text-data-mono text-on-surface-variant opacity-80">{{ user.email }}</span>
                    </div>
                  </div>
                </td>
                <td class="px-md py-3">
                  <span :class="['inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', getRoleBadgeClass(user.role)]">
                    {{ displayRole(user.role) }}
                  </span>
                </td>
                <td class="px-md py-3 text-center">
                  <span v-if="user.status !== 'Blocked' && user.status !== 2" class="material-symbols-outlined text-green-600 text-[20px]" data-icon="verified" title="Verified">verified</span>
                  <span v-else class="material-symbols-outlined text-error text-[20px]" data-icon="warning" title="Khóa">warning</span>
                </td>
                <td class="px-md py-3">
                  <div class="flex items-center gap-2">
                    <div :class="['h-2 w-2 rounded-full', getStatusIndicatorClass(user.status)]"></div>
                    <span class="text-label-sm text-on-surface-variant">{{ formatStatus(user.status) }}</span>
                  </div>
                </td>
                <td class="px-md py-3 text-right">
                  <button class="text-outline hover:text-primary p-1 rounded-full hover:bg-surface-container-high transition-colors" @click.stop="toggleDetail(user)">
                    <span class="material-symbols-outlined" data-icon="more_vert">more_vert</span>
                  </button>
                </td>
              </tr>
              
              <tr v-if="filteredUsers.length === 0">
                <td colspan="5" class="p-8 text-center text-outline">
                  Không tìm thấy người dùng nào.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <!-- Pagination -->
        <div class="p-md border-t border-outline-variant flex items-center justify-between bg-surface-container-low mt-auto">
          <span class="text-label-sm text-on-surface-variant">Hiển thị {{ filteredUsers.length }} người dùng</span>
          <div class="flex items-center gap-xs">
            <button class="p-1 hover:bg-surface-container-high rounded disabled:opacity-30" disabled>
              <span class="material-symbols-outlined text-[20px]" data-icon="chevron_left">chevron_left</span>
            </button>
            <button class="px-2 py-1 bg-primary text-on-primary rounded text-label-sm">1</button>
            <button class="p-1 hover:bg-surface-container-high rounded disabled:opacity-30" disabled>
              <span class="material-symbols-outlined text-[20px]" data-icon="chevron_right">chevron_right</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Detail Panel / Side Drawer -->
    <div 
      class="overflow-hidden transition-all duration-300 bg-surface-container-lowest border-l border-outline-variant flex flex-col z-10"
      :style="{ width: selectedUser ? '420px' : '0', minWidth: selectedUser ? '420px' : '0' }"
    >
      <div v-if="selectedUser" class="w-full h-full flex flex-col">
        <div class="p-lg border-b border-outline-variant flex justify-between items-center bg-surface-container-low">
          <h2 class="font-title-lg text-title-lg text-primary font-bold">Chi tiết Tài khoản</h2>
          <button class="text-outline hover:text-error p-1 rounded-full hover:bg-surface-container-high transition-colors" @click="closeDetail">
            <span class="material-symbols-outlined text-[20px]" data-icon="close">close</span>
          </button>
        </div>
        
        <div class="flex-grow overflow-y-auto p-lg custom-scrollbar">
          <!-- Profile Header -->
          <div class="flex items-center gap-md mb-xl">
            <div :class="['shrink-0 h-16 w-16 rounded-2xl flex items-center justify-center text-headline-md font-bold shadow-sm border', getRoleBgColorClass(selectedUser.role), getRoleTextColorClass(selectedUser.role)]">
              {{ getInitials(selectedUser.fullName) }}
            </div>
            <div class="overflow-hidden">
              <h3 class="font-headline-sm text-headline-sm text-on-surface font-semibold truncate">{{ selectedUser.fullName }}</h3>
              <div class="flex items-center gap-2">
                <span class="text-label-sm text-on-surface-variant truncate">{{ selectedUser.email }}</span>
                <span v-if="selectedUser.status !== 'Blocked' && selectedUser.status !== 2" class="shrink-0 material-symbols-outlined text-[16px] text-green-600" data-icon="verified">verified</span>
              </div>
            </div>
          </div>

          <!-- Permissions Grid -->
          <div class="space-y-lg">
            <div>
              <h4 class="text-label-sm font-bold text-primary uppercase mb-sm border-b border-primary/20 pb-1">Thông tin chung</h4>
              <div class="space-y-2 mt-3">
                <div class="flex justify-between items-center">
                  <span class="text-body-sm text-on-surface-variant">Vai trò:</span>
                  <span :class="['inline-flex items-center px-2 py-0.5 rounded text-xs font-bold', getRoleBadgeClass(selectedUser.role)]">
                    {{ displayRole(selectedUser.role) }}
                  </span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-body-sm text-on-surface-variant">Trạng thái:</span>
                  <span class="text-body-sm font-semibold" :class="selectedUser.status === 'Blocked' || selectedUser.status === 2 ? 'text-error' : 'text-green-600'">
                    {{ formatStatus(selectedUser.status) }}
                  </span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-body-sm text-on-surface-variant">Số điện thoại:</span>
                  <span class="text-body-sm text-on-surface font-medium">{{ selectedUser.phone || 'Chưa cập nhật' }}</span>
                </div>
              </div>
            </div>

            <!-- Quyền mô phỏng -->
            <div>
              <h4 class="text-label-sm font-bold text-primary uppercase mb-sm border-b border-primary/20 pb-1">Phân quyền Hệ thống</h4>
              <div class="space-y-sm mt-3">
                <div class="flex justify-between items-center py-1">
                  <span class="text-body-sm text-on-surface font-medium">Truy cập Quản trị (Admin)</span>
                  <label class="relative inline-flex items-center cursor-pointer">
                    <input :checked="formatRole(selectedUser.role) === 'Admin'" disabled class="sr-only permission-toggle" type="checkbox"/>
                    <div class="w-8 h-4 bg-outline-variant rounded-full transition-colors toggle-slider before:content-[''] before:absolute before:left-[2px] before:top-[2px] before:bg-white before:w-3 before:h-3 before:rounded-full before:transition-transform" :class="{'!bg-primary before:translate-x-[16px]': formatRole(selectedUser.role) === 'Admin'}"></div>
                  </label>
                </div>
                <div class="flex justify-between items-center py-1">
                  <span class="text-body-sm text-on-surface font-medium">Truy cập Kho (Warehouse)</span>
                  <label class="relative inline-flex items-center cursor-pointer">
                    <input :checked="['Admin', 'Warehouse'].includes(formatRole(selectedUser.role))" disabled class="sr-only permission-toggle" type="checkbox"/>
                    <div class="w-8 h-4 bg-outline-variant rounded-full transition-colors toggle-slider before:content-[''] before:absolute before:left-[2px] before:top-[2px] before:bg-white before:w-3 before:h-3 before:rounded-full before:transition-transform" :class="{'!bg-primary before:translate-x-[16px]': ['Admin', 'Warehouse'].includes(formatRole(selectedUser.role))}"></div>
                  </label>
                </div>
                <div class="flex justify-between items-center py-1">
                  <span class="text-body-sm text-on-surface font-medium">Bán hàng (Sales)</span>
                  <label class="relative inline-flex items-center cursor-pointer">
                    <input :checked="['Admin', 'Sales'].includes(formatRole(selectedUser.role))" disabled class="sr-only permission-toggle" type="checkbox"/>
                    <div class="w-8 h-4 bg-outline-variant rounded-full transition-colors toggle-slider before:content-[''] before:absolute before:left-[2px] before:top-[2px] before:bg-white before:w-3 before:h-3 before:rounded-full before:transition-transform" :class="{'!bg-primary before:translate-x-[16px]': ['Admin', 'Sales'].includes(formatRole(selectedUser.role))}"></div>
                  </label>
                </div>
              </div>
            </div>

            <!-- Security info -->
            <div class="bg-surface-container-low p-md rounded-lg border border-outline-variant/30">
              <h4 class="text-label-sm font-bold text-on-surface-variant uppercase mb-3">Thông tin bảo mật</h4>
              <div class="space-y-2">
                <div class="flex justify-between text-data-mono text-[12px]">
                  <span class="text-on-surface-variant">ID Hệ thống:</span>
                  <span class="text-on-surface truncate ml-2 max-w-[150px]" :title="selectedUser.id">{{ selectedUser.id }}</span>
                </div>
                <div class="flex justify-between text-data-mono text-[12px]">
                  <span class="text-on-surface-variant">Ngày tạo:</span>
                  <span class="text-on-surface">{{ formatDate(selectedUser.createdAt) }}</span>
                </div>
                <div class="flex justify-between text-data-mono text-[12px]">
                  <span class="text-on-surface-variant">Đăng nhập l.cuối:</span>
                  <span class="text-on-surface">{{ formatDate(selectedUser.lastLoginAt) || 'Chưa từng' }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="p-lg border-t border-outline-variant bg-surface-container-lowest flex gap-md shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
          <button 
            @click="handleBlockToggle"
            class="flex-grow py-2 rounded-lg font-label-md text-label-md transition-all font-semibold"
            :class="selectedUser.status === 'Blocked' || selectedUser.status === 2 ? 'bg-green-600 text-white hover:bg-green-700' : 'border border-outline-variant text-on-surface hover:bg-surface-container-high'"
          >
            {{ selectedUser.status === 'Blocked' || selectedUser.status === 2 ? 'Mở khóa Tài khoản' : 'Khóa Tài khoản' }}
          </button>
          <button 
            @click="handleDeleteUser"
            class="px-4 py-2 border border-error text-error rounded-lg font-label-md text-label-md hover:bg-error-container hover:text-on-error-container transition-all flex items-center gap-1 font-semibold"
            title="Xóa vĩnh viễn"
          >
            <span class="material-symbols-outlined text-[18px]" data-icon="delete">delete</span>
            Xóa
          </button>
        </div>
      </div>
    </div>

    <!-- Add User Modal -->
    <div v-if="showAddModal" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div class="bg-surface-container-lowest rounded-xl shadow-lg w-full max-w-md flex flex-col overflow-hidden">
        <div class="p-4 border-b border-outline-variant flex justify-between items-center bg-surface-container-low">
          <h2 class="font-title-lg text-title-lg text-primary font-bold">Thêm Người Dùng Mới</h2>
          <button class="text-outline hover:text-error p-1 rounded-full hover:bg-surface-container-high transition-colors" @click="showAddModal = false">
            <span class="material-symbols-outlined text-[20px]" data-icon="close">close</span>
          </button>
        </div>
        
        <form @submit.prevent="submitAddUser" class="p-6 flex flex-col gap-4">
          <div>
            <label class="block text-label-sm font-bold text-on-surface-variant mb-1">Email <span class="text-error">*</span></label>
            <input v-model="newUser.email" type="email" required class="w-full bg-surface-container border border-outline-variant rounded-lg px-3 py-2 text-body-sm focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="nguyen.van.a@shop.com" />
          </div>
          <div>
            <label class="block text-label-sm font-bold text-on-surface-variant mb-1">Họ Tên <span class="text-error">*</span></label>
            <input v-model="newUser.fullName" type="text" required class="w-full bg-surface-container border border-outline-variant rounded-lg px-3 py-2 text-body-sm focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="Nguyễn Văn A" />
          </div>
          <div>
            <label class="block text-label-sm font-bold text-on-surface-variant mb-1">Mật khẩu <span class="text-error">*</span></label>
            <input v-model="newUser.password" type="password" required class="w-full bg-surface-container border border-outline-variant rounded-lg px-3 py-2 text-body-sm focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="Ít nhất 8 ký tự, có hoa, thường, số, ký tự đặc biệt" />
          </div>
          <div>
            <label class="block text-label-sm font-bold text-on-surface-variant mb-1">Số điện thoại</label>
            <input v-model="newUser.phone" type="text" class="w-full bg-surface-container border border-outline-variant rounded-lg px-3 py-2 text-body-sm focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="0987654321" />
          </div>
          <div>
            <label class="block text-label-sm font-bold text-on-surface-variant mb-1">Vai trò</label>
            <select v-model="newUser.role" class="w-full bg-surface-container border border-outline-variant rounded-lg px-3 py-2 text-body-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
              <option :value="0">Quản trị viên (Admin)</option>
              <option :value="1">Nhân viên Bán hàng (Sales)</option>
              <option :value="2">Nhân viên Kho (Warehouse)</option>
            </select>
          </div>
          
          <!-- Lỗi hiển thị nếu có -->
          <div v-if="addError" class="text-error text-label-sm mt-2 bg-error-container/20 p-2 rounded whitespace-pre-line">
            {{ addError }}
          </div>
          
          <div class="mt-4 flex justify-end gap-3">
            <button type="button" class="px-4 py-2 border border-outline-variant text-on-surface rounded-lg font-label-md hover:bg-surface-container-high transition-colors" @click="showAddModal = false">Hủy</button>
            <button type="submit" class="px-4 py-2 bg-primary text-on-primary rounded-lg font-label-md hover:bg-primary-container transition-colors disabled:opacity-50" :disabled="isSubmitting">
              {{ isSubmitting ? 'Đang tạo...' : 'Tạo Tài Khoản' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useUserStore } from '@/stores/user';

const userStore = useUserStore();

const searchQuery = ref('');
const activeTab = ref('All');
const selectedUser = ref(null);

// Add User Modal State
const showAddModal = ref(false);
const isSubmitting = ref(false);
const addError = ref('');
const newUser = ref({
  email: '',
  fullName: '',
  password: '',
  phone: '',
  role: 1
});

onMounted(async () => {
  await userStore.fetchUsers();
});

// Thống kê
const totalUsers = computed(() => userStore.users.length);
const activeUsers = computed(() => userStore.users.filter(u => u.status === 'Active' || u.status === 0).length);
const adminUsers = computed(() => userStore.users.filter(u => formatRole(u.role) === 'Admin').length);
const blockedUsers = computed(() => userStore.users.filter(u => u.status === 'Blocked' || u.status === 2 || u.status === 'Inactive' || u.status === 1).length);
const activePercent = computed(() => totalUsers.value === 0 ? 0 : Math.round((activeUsers.value / totalUsers.value) * 100));

// Lọc người dùng
const filteredUsers = computed(() => {
  let result = userStore.users;
  
  // Lọc theo Tab (Role)
  if (activeTab.value !== 'All') {
    result = result.filter(u => formatRole(u.role) === activeTab.value);
  }

  // Lọc theo Search Query
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase();
    result = result.filter(u => 
      u.fullName?.toLowerCase().includes(q) || 
      u.email?.toLowerCase().includes(q)
    );
  }
  
  return result;
});

// Actions
const toggleDetail = (user) => {
  // Bấm vào người đang chọn thì đóng, bấm người khác thì đổi
  if (selectedUser.value && selectedUser.value.id === user.id) {
    selectedUser.value = null;
  } else {
    selectedUser.value = user;
  }
};

const closeDetail = () => {
  selectedUser.value = null;
};

const handleBlockToggle = async () => {
  if (!selectedUser.value) return;
  
  const isCurrentlyBlocked = selectedUser.value.status === 'Blocked' || selectedUser.value.status === 2;
  const newStatus = isCurrentlyBlocked ? 'Active' : 'Blocked';
  const statusInt = newStatus === 'Active' ? 0 : 2; 
  
  const success = await userStore.updateUserStatus(selectedUser.value.id, statusInt);
  if (success) {
    alert(`Đã ${newStatus === 'Active' ? 'mở khóa' : 'khóa'} tài khoản thành công!`);
    await userStore.fetchUsers();
    selectedUser.value = userStore.users.find(u => u.id === selectedUser.value.id);
  } else {
    alert('Có lỗi xảy ra khi cập nhật trạng thái.');
  }
};

const handleDeleteUser = async () => {
  if (!selectedUser.value) return;
  
  if (!window.confirm(`Bạn có chắc chắn muốn xóa vĩnh viễn tài khoản "${selectedUser.value.fullName}" không?\n\nHành động này không thể hoàn tác!`)) {
    return;
  }
  
  const success = await userStore.deleteUser(selectedUser.value.id);
  if (success) {
    alert('Đã xóa tài khoản thành công!');
    selectedUser.value = null; // Đóng side panel
  } else {
    alert('Có lỗi xảy ra khi xóa tài khoản. Vui lòng thử lại.');
  }
};

const openAddModal = () => {
  addError.value = '';
  newUser.value = {
    email: '',
    fullName: '',
    password: '',
    phone: '',
    role: 1
  };
  showAddModal.value = true;
};

const submitAddUser = async () => {
  isSubmitting.value = true;
  addError.value = '';
  
  const result = await userStore.createUser(newUser.value);
  if (result.success) {
    alert('Tạo người dùng thành công!');
    showAddModal.value = false;
  } else {
    if (result.errors && typeof result.errors === 'object') {
      const messages = Object.values(result.errors).flat();
      addError.value = messages.join('\n');
    } else {
      addError.value = result.message || 'Lỗi không xác định.';
    }
  }
  isSubmitting.value = false;
};

// Role Formatting
const formatRole = (role) => {
  if (role === 0 || role === 'Admin') return 'Admin';
  if (role === 1 || role === 'Sales') return 'Sales';
  if (role === 2 || role === 'Warehouse') return 'Warehouse';
  if (role === 3 || role === 'Customer') return 'Customer';
  return role;
};

const displayRole = (role) => {
  const r = formatRole(role);
  if (r === 'Admin') return 'Quản trị viên';
  if (r === 'Sales') return 'Bán hàng';
  if (r === 'Warehouse') return 'Kho vận';
  if (r === 'Customer') return 'Khách hàng';
  return r;
};

// Utilities (Design Helpers)
const getInitials = (name) => {
  if (!name || typeof name !== 'string') return '??';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0 || parts[0] === '') return '??';
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return parts[0].substring(0, 2).toUpperCase();
};

const formatStatus = (status) => {
  if (status === 'Active' || status === 0) return 'Đang hoạt động';
  if (status === 'Blocked' || status === 2) return 'Bị khóa';
  if (status === 'Inactive' || status === 1) return 'Chưa kích hoạt';
  return 'Ngoại tuyến';
};

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleString('vi-VN');
};

const getRoleBadgeClass = (role) => {
  const r = formatRole(role);
  if (r === 'Admin') return 'bg-blue-50 text-blue-700 border border-blue-200';
  if (r === 'Sales') return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
  if (r === 'Warehouse') return 'bg-amber-50 text-amber-700 border border-amber-200';
  return 'bg-slate-50 text-slate-700 border border-slate-200';
};

const getRoleBgColorClass = (role) => {
  const r = formatRole(role);
  if (r === 'Admin') return 'bg-blue-50';
  if (r === 'Sales') return 'bg-emerald-50';
  if (r === 'Warehouse') return 'bg-amber-50';
  return 'bg-slate-50';
};

const getRoleTextColorClass = (role) => {
  const r = formatRole(role);
  if (r === 'Admin') return 'text-blue-600';
  if (r === 'Sales') return 'text-emerald-600';
  if (r === 'Warehouse') return 'text-amber-600';
  return 'text-slate-650';
};

const getStatusIndicatorClass = (status) => {
  if (status === 'Active' || status === 0) return 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]';
  if (status === 'Blocked' || status === 2) return 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.3)]';
  return 'bg-slate-350';
};
</script>

<style scoped>
/* Scoped styles cho tính năng UI nội bộ */
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 10px;
}
.permission-toggle:checked + .toggle-slider {
  background-color: #2563eb;
}
.permission-toggle:checked + .toggle-slider::before {
  transform: translateX(16px);
}
</style>
