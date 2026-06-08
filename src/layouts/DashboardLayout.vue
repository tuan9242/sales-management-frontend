<template>
  <v-app id="inspire">
    <!-- Sidebar Navigation -->
    <v-navigation-drawer v-model="drawer" class="border-end-0 border-opacity-10 glass-sidebar" elevation="2">
      <v-list-item class="py-6 px-4">
        <template v-slot:prepend>
          <v-icon color="primary" size="32" class="me-2">mdi-cube-outline</v-icon>
        </template>
        <v-list-item-title class="text-h6 font-weight-black tracking-wide text-gradient">
          SALES SYSTEM
        </v-list-item-title>
      </v-list-item>

      <v-divider class="mb-4 mx-4 opacity-10"></v-divider>

      <v-list nav>
        <v-list-item
          v-for="item in menuItems"
          :key="item.title"
          :to="item.to"
          :prepend-icon="item.icon"
          :title="item.title"
          color="primary"
          rounded="lg"
          class="mb-1"
          active-class="active-nav-item"
        >
          <template v-slot:append v-if="item.group">
            <v-chip size="x-small" :color="item.groupColor" variant="flat" class="text-white">
              N{{ item.group }}
            </v-chip>
          </template>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <!-- App Bar -->
    <v-app-bar class="px-3 border-bottom-0 glass-appbar" flat elevation="1">
      <v-app-bar-nav-icon @click="drawer = !drawer" color="text-medium-emphasis"></v-app-bar-nav-icon>

      <v-spacer></v-spacer>

      <!-- Theme Switcher -->
      <v-btn icon class="me-2" @click="toggleTheme">
        <v-icon>{{ theme.global.current.value.dark ? 'mdi-weather-sunny' : 'mdi-weather-night' }}</v-icon>
      </v-btn>

      <!-- User Profile Menu -->
      <v-menu min-width="200px" rounded="xl" transition="slide-y-transition">
        <template v-slot:activator="{ props }">
          <v-btn icon v-bind="props">
            <v-avatar color="primary" size="36">
              <span class="text-body-1 font-weight-bold text-white">{{ userInitial }}</span>
            </v-avatar>
          </v-btn>
        </template>
        <v-card class="pa-4 glass-card mt-2">
          <div class="text-center">
            <v-avatar color="primary" size="48" class="mb-2">
              <span class="text-h5 font-weight-bold text-white">{{ userInitial }}</span>
            </v-avatar>
            <h3 class="text-subtitle-1 font-weight-bold">{{ authStore.user?.displayName }}</h3>
            <p class="text-caption text-medium-emphasis mt-1">{{ authStore.user?.username }}</p>
            <v-chip size="small" color="primary" variant="flat" class="mt-2 text-white">
              Quyền: {{ authStore.userRole }}
            </v-chip>
            <v-divider class="my-4"></v-divider>
            <v-btn color="error" block variant="tonal" rounded="lg" prepend-icon="mdi-logout" @click="handleLogout">
              Đăng xuất
            </v-btn>
          </div>
        </v-card>
      </v-menu>
    </v-app-bar>

    <!-- Main Content -->
    <v-main class="bg-content-gradient">
      <v-container class="pa-6 pa-md-8" fluid>
        <router-view></router-view>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useTheme } from 'vuetify';
import { useAuthStore } from '../stores/auth';

const theme = useTheme();
const authStore = useAuthStore();
const drawer = ref(true);

const userInitial = computed(() => {
  return authStore.user?.displayName?.charAt(0) || 'U';
});

const toggleTheme = () => {
  theme.global.name.value = theme.global.current.value.dark ? 'light' : 'dark';
};

const handleLogout = () => {
  authStore.logout();
};

const menuItems = computed(() => {
  const allItems = [
    { title: 'Tổng quan Dashboard', icon: 'mdi-view-dashboard-outline', to: '/', group: 6, groupColor: 'info' },
    { title: 'Sản phẩm & Tồn kho', icon: 'mdi-package-variant-closed', to: '/products', group: 5, groupColor: 'primary' },
    { title: 'Đơn hàng & Bán lẻ', icon: 'mdi-cart-outline', to: '/orders', group: 4, groupColor: 'success' },
    { title: 'Tài khoản & Phân quyền', icon: 'mdi-account-group-outline', to: '/users', group: 6, groupColor: 'info' },
  ];
  return allItems;
});
</script>

<style scoped>
.glass-sidebar {
  background: rgba(30, 41, 59, 0.4) !important;
  backdrop-filter: blur(20px);
}
.glass-appbar {
  background: rgba(30, 41, 59, 0.4) !important;
  backdrop-filter: blur(20px);
}
.glass-card {
  background: rgba(30, 41, 59, 0.8) !important;
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.08);
}
.bg-content-gradient {
  background: radial-gradient(circle at 50% 50%, rgb(15, 23, 42) 0%, rgb(30, 41, 59) 100%);
  min-height: 100vh;
}
.text-gradient {
  background: linear-gradient(135deg, var(--v-theme-primary) 0%, var(--v-theme-secondary) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
.active-nav-item {
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(34, 211, 238, 0.15) 100%) !important;
  border-left: 4px solid var(--v-theme-primary);
}
</style>
