<template>
  <div>
    <!-- Sidebar -->
    <nav class="fixed left-0 top-0 h-full flex flex-col z-50 bg-primary shadow-md w-60 docked h-screen">
      <div class="p-md flex items-center gap-3">
        <svg class="w-10 h-10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="24" height="24" fill="transparent"/>
          <path d="M3 9L12 4L21 9V15L12 20L3 15V9Z" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M12 4V20" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M3 9L12 14L21 9" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M7 11.5V14.5" stroke="#89ceff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M10.5 10V15" stroke="#89ceff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M14 12V15" stroke="#89ceff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <div>
          <h1 class="text-headline-md font-headline-md font-bold text-surface-container-lowest leading-tight">InventoryPro</h1>
          <p class="text-label-sm text-tertiary-fixed-dim opacity-70">Enterprise ERP</p>
        </div>
      </div>
      <div class="mt-xl flex-1 overflow-y-auto hide-scrollbar">
        <!-- Dashboard -->
        <router-link to="/" custom v-slot="{ href, navigate, isActive }">
          <a :href="href" @click="navigate" :class="isActive ? 'text-on-tertiary-container border-l-4 border-tertiary-fixed-dim bg-primary-container/20 py-3 px-4 flex items-center gap-3 transition-colors font-label-md text-label-md' : 'text-outline-variant hover:text-surface-container-lowest py-3 px-4 flex items-center gap-3 transition-colors font-label-md text-label-md hover:bg-primary-container/10'">
            <span class="material-symbols-outlined" data-icon="dashboard">dashboard</span>
            <span>Dashboard</span>
          </a>
        </router-link>
        
        <router-link to="/users" custom v-slot="{ href, navigate, isActive }">
          <a :href="href" @click="navigate" :class="isActive ? 'text-on-tertiary-container border-l-4 border-tertiary-fixed-dim bg-primary-container/20 py-3 px-4 flex items-center gap-3 transition-colors font-label-md text-label-md' : 'text-outline-variant hover:text-surface-container-lowest py-3 px-4 flex items-center gap-3 transition-colors font-label-md text-label-md hover:bg-primary-container/10'">
            <span class="material-symbols-outlined" data-icon="group">group</span>
            <span>User Management</span>
          </a>
        </router-link>

        <router-link to="/reports" custom v-slot="{ href, navigate, isActive }">
          <a :href="href" @click="navigate" :class="isActive ? 'text-on-tertiary-container border-l-4 border-tertiary-fixed-dim bg-primary-container/20 py-3 px-4 flex items-center gap-3 transition-colors font-label-md text-label-md' : 'text-outline-variant hover:text-surface-container-lowest py-3 px-4 flex items-center gap-3 transition-colors font-label-md text-label-md hover:bg-primary-container/10'">
            <span class="material-symbols-outlined" data-icon="analytics">analytics</span>
            <span>Reports</span>
          </a>
        </router-link>

        <router-link to="/products" custom v-slot="{ href, navigate, isActive }">
          <a :href="href" @click="navigate" :class="isActive ? 'text-on-tertiary-container border-l-4 border-tertiary-fixed-dim bg-primary-container/20 py-3 px-4 flex items-center gap-3 transition-colors font-label-md text-label-md' : 'text-outline-variant hover:text-surface-container-lowest py-3 px-4 flex items-center gap-3 transition-colors font-label-md text-label-md hover:bg-primary-container/10'">
            <span class="material-symbols-outlined" data-icon="inventory_2">inventory_2</span>
            <span>Inventory</span>
          </a>
        </router-link>
        
        <router-link to="/orders" custom v-slot="{ href, navigate, isActive }">
          <a :href="href" @click="navigate" :class="isActive ? 'text-on-tertiary-container border-l-4 border-tertiary-fixed-dim bg-primary-container/20 py-3 px-4 flex items-center gap-3 transition-colors font-label-md text-label-md' : 'text-outline-variant hover:text-surface-container-lowest py-3 px-4 flex items-center gap-3 transition-colors font-label-md text-label-md hover:bg-primary-container/10'">
            <span class="material-symbols-outlined" data-icon="shopping_cart">shopping_cart</span>
            <span>Orders</span>
          </a>
        </router-link>

        <a class="text-outline-variant hover:text-surface-container-lowest py-3 px-4 flex items-center gap-3 transition-colors font-label-md text-label-md hover:bg-primary-container/10" href="#">
          <span class="material-symbols-outlined" data-icon="settings">settings</span>
          <span>Settings</span>
        </a>
      </div>
      <div class="pb-md border-t border-primary-fixed-dim/10">
        <a class="text-outline-variant hover:text-surface-container-lowest py-3 px-4 flex items-center gap-3 transition-colors font-label-md text-label-md hover:bg-primary-container/10" href="#">
          <span class="material-symbols-outlined" data-icon="account_circle">account_circle</span>
          <span>User Profile</span>
        </a>
        <a class="text-outline-variant hover:text-surface-container-lowest py-3 px-4 flex items-center gap-3 transition-colors font-label-md text-label-md hover:bg-primary-container/10" href="#" @click.prevent="handleLogout">
          <span class="material-symbols-outlined" data-icon="logout">logout</span>
          <span>Logout</span>
        </a>
      </div>
    </nav>

    <!-- Top Bar -->
    <header class="flex items-center justify-between w-full h-16 px-md ml-60 max-w-[calc(100%-240px)] fixed top-0 bg-surface-container-lowest border-b border-outline-variant z-40">
      <div class="flex items-center gap-4 flex-1">
        <div class="relative w-full max-w-md">
          <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline" data-icon="search">search</span>
          <input class="w-full bg-surface-container-low border-none rounded-full py-2 pl-10 pr-4 text-body-sm focus:ring-2 focus:ring-primary" placeholder="Tìm kiếm dữ liệu..." type="text"/>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <button class="hover:bg-surface-container-low rounded-full p-2 transition-all duration-150">
          <span class="material-symbols-outlined text-primary" data-icon="notifications">notifications</span>
        </button>
        <div class="h-8 w-8 rounded-full bg-secondary-container flex items-center justify-center overflow-hidden ml-2">
          <img alt="User Avatar" class="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA-9I53MkiFNfIUAc6_C6GoiCB1rxCp81REA4xGak9hlpUgx_MY1UIdc-IKZAHaKXgRGNntaTI4nBaQ3zPG-V5SZm2rR53mk6oR0LajIJwY3ytoEzo3ikuoqNj6FCAlvJU4sLM0mqk43HaT9mcYNBG_nLjMxwbjm9uZAztPd30a_BOgSO-ZXoRo1atq2Qotlo4mT2QvthCMfNz0sgkPb4cPoJBGNk47T_xAHM3uDPbFvqwYMqXhM5Cktj-JvfPn_kh5Gr9FG2wqhGY"/>
        </div>
      </div>
    </header>

    <!-- Main Content Canvas -->
    <main class="ml-60 pt-16 p-md min-h-screen">
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
