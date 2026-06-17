<template>
  <div class="bg-background min-h-screen text-slate-900 relative overflow-x-hidden">
    <!-- Sidebar -->
    <nav class="fixed left-0 top-0 h-full flex flex-col z-50 bg-white text-slate-700 border-r border-slate-200 w-60 docked h-screen shadow-sm">
      <div class="p-md flex items-center gap-3 border-b border-slate-100 py-5">
        <svg class="w-9 h-9" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="24" height="24" fill="transparent"/>
          <path d="M3 9L12 4L21 9V15L12 20L3 15V9Z" stroke="#2563eb" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M12 4V20" stroke="#2563eb" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M3 9L12 14L21 9" stroke="#2563eb" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M7 11.5V14.5" stroke="#3b82f6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M10.5 10V15" stroke="#3b82f6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M14 12V15" stroke="#3b82f6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <div>
          <h1 class="text-headline-md font-headline-md font-bold text-slate-900 leading-tight tracking-wide">InventoryPro</h1>
          <p class="text-label-sm text-blue-600/80 font-medium">Enterprise ERP</p>
        </div>
      </div>
      <div class="mt-md flex-1 overflow-y-auto hide-scrollbar">
        <!-- Dashboard -->
        <router-link to="/" custom v-slot="{ href, navigate, isActive }">
          <a :href="href" @click="navigate" :class="isActive ? 'text-blue-600 border-l-4 border-blue-600 bg-blue-50/50 py-3 px-5 flex items-center gap-3 transition-all font-semibold text-label-md' : 'text-slate-600 hover:text-blue-600 hover:bg-slate-50 py-3 px-5 flex items-center gap-3 transition-all font-medium text-label-md'">
            <span class="material-symbols-outlined text-blue-500" data-icon="dashboard">dashboard</span>
            <span>Dashboard</span>
          </a>
        </router-link>
        
        <router-link v-if="authStore.hasRole('Admin')" to="/users" custom v-slot="{ href, navigate, isActive }">
          <a :href="href" @click="navigate" :class="isActive ? 'text-blue-600 border-l-4 border-blue-600 bg-blue-50/50 py-3 px-5 flex items-center gap-3 transition-all font-semibold text-label-md' : 'text-slate-600 hover:text-blue-600 hover:bg-slate-50 py-3 px-5 flex items-center gap-3 transition-all font-medium text-label-md'">
            <span class="material-symbols-outlined text-blue-500" data-icon="group">group</span>
            <span>User Management</span>
          </a>
        </router-link>

        <router-link v-if="authStore.hasRole('Admin')" to="/reports" custom v-slot="{ href, navigate, isActive }">
          <a :href="href" @click="navigate" :class="isActive ? 'text-blue-600 border-l-4 border-blue-600 bg-blue-50/50 py-3 px-5 flex items-center gap-3 transition-all font-semibold text-label-md' : 'text-slate-600 hover:text-blue-600 hover:bg-slate-50 py-3 px-5 flex items-center gap-3 transition-all font-medium text-label-md'">
            <span class="material-symbols-outlined text-blue-500" data-icon="analytics">analytics</span>
            <span>Reports</span>
          </a>
        </router-link>

        <router-link to="/products" custom v-slot="{ href, navigate, isActive }">
          <a :href="href" @click="navigate" :class="isActive ? 'text-blue-600 border-l-4 border-blue-600 bg-blue-50/50 py-3 px-5 flex items-center gap-3 transition-all font-semibold text-label-md' : 'text-slate-600 hover:text-blue-600 hover:bg-slate-50 py-3 px-5 flex items-center gap-3 transition-all font-medium text-label-md'">
            <span class="material-symbols-outlined text-blue-500" data-icon="inventory_2">inventory_2</span>
            <span>Inventory</span>
          </a>
        </router-link>
        
        <router-link v-if="authStore.hasRole(['Admin', 'Sales'])" to="/orders" custom v-slot="{ href, navigate, isActive }">
          <a :href="href" @click="navigate" :class="isActive ? 'text-blue-600 border-l-4 border-blue-600 bg-blue-50/50 py-3 px-5 flex items-center gap-3 transition-all font-semibold text-label-md' : 'text-slate-600 hover:text-blue-600 hover:bg-slate-50 py-3 px-5 flex items-center gap-3 transition-all font-medium text-label-md'">
            <span class="material-symbols-outlined text-blue-500" data-icon="shopping_cart">shopping_cart</span>
            <span>Orders</span>
          </a>
        </router-link>

        <a class="text-slate-600 hover:text-blue-600 hover:bg-slate-50 py-3 px-5 flex items-center gap-3 transition-all font-medium text-label-md" href="#">
          <span class="material-symbols-outlined text-blue-500" data-icon="settings">settings</span>
          <span>Settings</span>
        </a>
      </div>
      <div class="pb-md border-t border-slate-100 pt-2">
        <a class="text-slate-600 hover:text-blue-600 hover:bg-slate-50 py-3 px-5 flex items-center gap-3 transition-all font-medium text-label-md" href="#">
          <span class="material-symbols-outlined text-blue-500" data-icon="account_circle">account_circle</span>
          <span>User Profile</span>
        </a>
        <a class="text-slate-600 hover:text-blue-600 hover:bg-slate-50 py-3 px-5 flex items-center gap-3 transition-all font-medium text-label-md" href="#" @click.prevent="handleLogout">
          <span class="material-symbols-outlined text-blue-500" data-icon="logout">logout</span>
          <span>Logout</span>
        </a>
      </div>
    </nav>

    <!-- Top Bar -->
    <header class="flex items-center justify-between w-full h-16 px-md ml-60 max-w-[calc(100%-240px)] fixed top-0 bg-white/80 backdrop-blur-md border-b border-slate-200 z-40 shadow-sm">
      <div class="flex items-center gap-4 flex-1">
        <div class="relative w-full max-w-md">
          <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" data-icon="search">search</span>
          <input class="w-full bg-slate-50 border border-slate-200 rounded-full py-1.5 pl-10 pr-4 text-body-sm text-slate-700 placeholder-slate-400 focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500/50 focus:bg-white transition-all outline-none" placeholder="Tìm kiếm dữ liệu..." type="text"/>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <button class="hover:bg-slate-100 rounded-full p-2 transition-all duration-150">
          <span class="material-symbols-outlined text-blue-500" data-icon="notifications">notifications</span>
        </button>
        <div v-if="authStore.user" class="text-right hidden sm:block ml-2 mr-1">
          <div class="flex items-center justify-end gap-1 mb-1">
            <p class="text-body-sm font-bold text-slate-800 tracking-tight">{{ authStore.user.fullName || authStore.user.email }}</p>
            <span class="material-symbols-outlined text-blue-500 text-[16px]" data-icon="verified">verified</span>
          </div>
          <div class="inline-flex items-center justify-end gap-1.5 px-2 py-0.5 rounded-full bg-blue-50/80 border border-blue-100/50 shadow-sm">
            <span class="relative flex h-2 w-2">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span class="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            <p class="text-[10px] font-extrabold text-blue-700 uppercase tracking-widest">{{ authStore.userRole }}</p>
          </div>
        </div>

      </div>
    </header>

    <!-- Main Content Canvas -->
    <main class="ml-60 pt-20 p-md min-h-screen bg-transparent">
      <router-view></router-view>
    </main>
  </div>
</template>

<script setup>
import { useAuthStore } from '../stores/auth';

const authStore = useAuthStore();

const handleLogout = () => {
  authStore.logout();
};
</script>

<style scoped>
</style>
