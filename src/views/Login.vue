<template>
  <v-container class="fill-height d-flex align-center justify-center bg-background-gradient" fluid>
    <v-card class="mx-auto pa-12 pb-8 glass-card" elevation="24" max-width="448" rounded="xl" width="100%">
      <div class="text-center mb-8">
        <v-icon color="primary" size="64" class="mb-4 animate-logo">mdi-cube-outline</v-icon>
        <div class="text-h4 font-weight-black text-gradient">SALES SYSTEM</div>
        <div class="text-subtitle-1 text-medium-emphasis mt-2">Đăng nhập tài khoản của bạn</div>
      </div>

      <v-form @submit.prevent="handleLogin" ref="form">
        <div class="text-subtitle-2 text-medium-emphasis mb-2">Tên đăng nhập</div>
        <v-text-field
          v-model="username"
          :rules="[v => !!v || 'Tên đăng nhập là bắt buộc']"
          density="compact"
          placeholder="Tên đăng nhập"
          prepend-inner-icon="mdi-account-outline"
          variant="outlined"
          color="primary"
          rounded="lg"
        ></v-text-field>

        <div class="text-subtitle-2 text-medium-emphasis d-flex align-center justify-space-between mb-2">
          Mật khẩu
        </div>
        <v-text-field
          v-model="password"
          :rules="[v => !!v || 'Mật khẩu là bắt buộc']"
          :append-inner-icon="visible ? 'mdi-eye-off' : 'mdi-eye'"
          :type="visible ? 'text' : 'password'"
          density="compact"
          placeholder="Nhập mật khẩu"
          prepend-inner-icon="mdi-lock-outline"
          variant="outlined"
          color="primary"
          rounded="lg"
          @click:append-inner="visible = !visible"
        ></v-text-field>

        <v-alert v-if="errorMsg" type="error" variant="tonal" class="mb-4" density="compact" closable>
          {{ errorMsg }}
        </v-alert>

        <v-btn
          :loading="loading"
          block
          class="mb-6 mt-4"
          color="primary"
          size="large"
          variant="elevated"
          type="submit"
          rounded="lg"
          elevation="4"
        >
          Đăng nhập
        </v-btn>
      </v-form>

      <v-divider class="my-4"></v-divider>

      <div class="text-center">
        <span class="text-caption text-medium-emphasis">Tài khoản thử nghiệm local (mật khẩu bất kỳ):</span>
        <div class="d-flex justify-center gap-2 mt-2">
          <v-chip size="small" color="primary" variant="outlined" @click="fillCredentials('admin')">admin (Admin)</v-chip>
          <v-chip size="small" color="secondary" variant="outlined" @click="fillCredentials('sales')">sales (Bán hàng)</v-chip>
          <v-chip size="small" color="success" variant="outlined" @click="fillCredentials('warehouse')">warehouse (Thủ kho)</v-chip>
        </div>
      </div>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const router = useRouter();
const authStore = useAuthStore();

const username = ref('');
const password = ref('');
const visible = ref(false);
const loading = ref(false);
const errorMsg = ref('');

const fillCredentials = (role) => {
  username.value = role;
  password.value = '123456';
};

const handleLogin = async () => {
  if (!username.value || !password.value) return;
  loading.value = true;
  errorMsg.value = '';
  
  const success = await authStore.login(username.value, password.value);
  loading.value = false;
  
  if (success) {
    router.push('/');
  } else {
    errorMsg.value = authStore.error;
  }
};
</script>

<style scoped>
.bg-background-gradient {
  background: radial-gradient(circle at 10% 20%, rgb(15, 23, 42) 0%, rgb(30, 41, 59) 90.1%);
}

.glass-card {
  background: rgba(30, 41, 59, 0.7) !important;
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.text-gradient {
  background: linear-gradient(135deg, var(--v-theme-primary) 0%, var(--v-theme-secondary) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.gap-2 {
  gap: 8px;
}

.animate-logo {
  animation: float 4s ease-in-out infinite;
}

@keyframes float {
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
}
</style>
