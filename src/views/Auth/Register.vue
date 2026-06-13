<template>
  <v-app class="bg-grey-lighten-4">
    <v-main class="d-flex align-center justify-center">
      <v-card class="pa-8" rounded="xl" elevation="2" max-width="440" width="100%">
        <div class="text-center mb-6">
          <v-icon color="primary" size="48">mdi-inventory</v-icon>
          <h2 class="text-h5 font-weight-bold mt-4">InventoryPro</h2>
          <p class="text-body-2 text-medium-emphasis mt-2">Đăng ký tài khoản mới</p>
        </div>

        <RegisterForm />

        <p class="text-center text-caption text-medium-emphasis mt-8">
          © 2026 InventoryPro Enterprise Solutions.
        </p>
      </v-card>
    </v-main>
  </v-app>
</template>

<script setup>
import RegisterForm from '@/components/Auth/RegisterForm.vue';
</script>

<style scoped>
</style>
