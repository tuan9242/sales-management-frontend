<template>
  <v-form @submit.prevent="handleSubmit" class="login-form">
    <!-- Hiển thị Alert khi có lỗi từ Store -->
    <v-alert
      v-if="authStore.error"
      type="error"
      variant="tonal"
      density="compact"
      class="mb-4 text-body-sm"
      closable
      @click:close="authStore.error = null"
    >
      {{ authStore.error }}
    </v-alert>

    <!-- Ô nhập Email / Tên đăng nhập -->
    <div class="input-group">
      <label class="input-label">Email / Tên đăng nhập</label>
      <v-text-field
        v-model="email"
        placeholder="Nhập email hoặc username"
        prepend-inner-icon="mdi-account-outline"
        variant="outlined"
        density="comfortable"
        bg-color="#f2f3f9"
        color="#00236f"
        rounded="lg"
        hide-details="auto"
        class="custom-text-field"
        :rules="[v => !!v || 'Email không được để trống']"
      ></v-text-field>
    </div>

    <!-- Ô nhập Mật khẩu -->
    <div class="input-group">
      <label class="input-label">Mật khẩu</label>
      <v-text-field
        v-model="password"
        placeholder="••••••••"
        prepend-inner-icon="mdi-lock-outline"
        :type="showPassword ? 'text' : 'password'"
        :append-inner-icon="showPassword ? 'mdi-eye-off-outline' : 'mdi-eye-outline'"
        variant="outlined"
        density="comfortable"
        bg-color="#f2f3f9"
        color="#00236f"
        rounded="lg"
        hide-details="auto"
        class="custom-text-field"
        :rules="[v => !!v || 'Mật khẩu không được để trống']"
        @click:append-inner="showPassword = !showPassword"
      ></v-text-field>
    </div>

    <!-- Nhớ mật khẩu & Quên mật khẩu -->
    <div class="actions-row">
      <v-checkbox
        v-model="rememberMe"
        label="Ghi nhớ đăng nhập"
        color="#00236f"
        density="compact"
        hide-details
        class="remember-checkbox"
      ></v-checkbox>
      <a href="#" class="forgot-link">Forgot password?</a>
    </div>

    <!-- Nút Submit -->
    <v-btn
      type="button"
      @click.prevent="handleSubmit"
      block
      color="#00236f"
      height="48"
      rounded="lg"
      class="submit-btn text-white"
      :loading="authStore.loading"
      elevation="2"
    >
      <span class="btn-text">Đăng nhập ngay</span>
      <v-icon end size="18" class="ms-2">mdi-login</v-icon>
    </v-btn>

    <!-- Nút chuyển sang Đăng ký -->
    <div class="register-redirect">
      <span>Chưa có tài khoản? </span>
      <router-link to="/register" class="register-link">Đăng ký ngay</router-link>
    </div>
  </v-form>
</template>

<script setup>
import { ref } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();

const email = ref('');
const password = ref('');
const rememberMe = ref(false);
const showPassword = ref(false);

const handleSubmit = async () => {
  if (!email.value || !password.value) return;
  
  const success = await authStore.login(email.value, password.value);
  if (success) {
    router.push('/');
  }
};
</script>

<style scoped>
.login-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.input-label {
  font-family: 'Inter', sans-serif;
  font-size: 12px;
  font-weight: 600;
  color: #444651;
}

.custom-text-field :deep(.v-field) {
  border-radius: 8px;
}

.custom-text-field :deep(.v-field__outline) {
  --v-field-border-width: 1px;
  --v-field-border-opacity: 0.15;
  border-color: #c5c5d3 !important;
}

.custom-text-field :deep(.v-field--focused .v-field__outline) {
  --v-field-border-width: 2px;
  --v-field-border-opacity: 1;
  border-color: #00236f !important;
}

.custom-text-field :deep(.v-field__input) {
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  color: #191c20;
}

.custom-text-field :deep(.v-field__prepend-inner) {
  color: #757682;
}

.custom-text-field :deep(.v-field__append-inner) {
  color: #757682;
  cursor: pointer;
}

.actions-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 4px;
}

.remember-checkbox :deep(.v-label) {
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  color: #444651;
  opacity: 1;
}

.forgot-link {
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  font-weight: 500;
  color: #00236f;
  text-decoration: none;
}

.forgot-link:hover {
  text-decoration: underline;
}

.submit-btn {
  font-family: 'Inter', sans-serif;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  margin-top: 8px;
}

.register-redirect {
  text-align: center;
  margin-top: 16px;
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  color: #444651;
}

.register-link {
  color: #00236f;
  text-decoration: none;
  font-weight: 600;
}

.register-link:hover {
  text-decoration: underline;
}
</style>
