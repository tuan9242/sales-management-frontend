<template>
  <v-app class="bg-gradient-to-tr from-blue-50 via-slate-50 to-indigo-50">
    <v-main class="d-flex align-center justify-center">
      <v-card class="pa-8 border border-slate-200/60 shadow-xl" rounded="2xl" max-width="440" width="100%" bg-color="white">
        <div class="text-center mb-6">
          <v-icon color="primary" size="48">mdi-cube-outline</v-icon>
          <h2 class="text-h5 font-weight-black mt-4 text-slate-900">InventoryPro</h2>
          <p class="text-body-2 text-slate-500 mt-1">Đăng nhập vào hệ thống quản trị</p>
        </div>

        <LoginForm />

        <p class="text-center text-caption text-slate-400 mt-8">
          © 2026 InventoryPro Enterprise Solutions.
        </p>
      </v-card>
    </v-main>
  </v-app>
</template>

<script setup>
import LoginForm from '@/components/Auth/LoginForm.vue';
</script>

<style scoped>
</style>
