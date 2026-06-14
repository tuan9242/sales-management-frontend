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

    <!-- Ô nhập Họ và tên -->
    <div class="input-group">
      <label class="input-label">Họ và tên</label>
      <v-text-field
        v-model="displayName"
        placeholder="Nhập họ và tên"
        prepend-inner-icon="mdi-badge-account-outline"
        variant="outlined"
        density="comfortable"
        bg-color="#f8fafc"
        color="primary"
        rounded="lg"
        hide-details="auto"
        class="custom-text-field"
        :rules="[v => !!v || 'Họ và tên không được để trống']"
      ></v-text-field>
    </div>

    <!-- Ô nhập Email / Tên đăng nhập -->
    <div class="input-group">
      <label class="input-label">Email / Tên đăng nhập</label>
      <v-text-field
        v-model="email"
        placeholder="Nhập email hoặc username"
        prepend-inner-icon="mdi-account-outline"
        variant="outlined"
        density="comfortable"
        bg-color="#f8fafc"
        color="primary"
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
        bg-color="#f8fafc"
        color="primary"
        rounded="lg"
        hide-details="auto"
        class="custom-text-field"
        :rules="[v => !!v || 'Mật khẩu không được để trống']"
        @click:append-inner="showPassword = !showPassword"
      ></v-text-field>
    </div>

    <!-- Ô xác nhận Mật khẩu -->
    <div class="input-group">
      <label class="input-label">Xác nhận mật khẩu</label>
      <v-text-field
        v-model="confirmPassword"
        placeholder="••••••••"
        prepend-inner-icon="mdi-lock-check-outline"
        :type="showPassword ? 'text' : 'password'"
        variant="outlined"
        density="comfortable"
        bg-color="#f8fafc"
        color="primary"
        rounded="lg"
        hide-details="auto"
        class="custom-text-field"
        :rules="[
          v => !!v || 'Xác nhận mật khẩu không được để trống',
          v => v === password || 'Mật khẩu không khớp'
        ]"
      ></v-text-field>
    </div>

    <!-- Nút Submit -->
    <v-btn
      type="button"
      @click.prevent="handleSubmit"
      block
      color="primary"
      height="48"
      rounded="lg"
      class="submit-btn text-white shadow-md shadow-primary/20"
      :loading="authStore.loading"
      elevation="0"
    >
      <span class="btn-text">Đăng ký ngay</span>
      <v-icon end size="18" class="ms-2">mdi-account-plus</v-icon>
    </v-btn>

    <!-- Nút chuyển sang Đăng nhập -->
    <div class="register-redirect">
      <span>Đã có tài khoản? </span>
      <router-link to="/login" class="register-link">Đăng nhập</router-link>
    </div>
  </v-form>
</template>

<script setup>
import { ref } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();

const displayName = ref('');
const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const showPassword = ref(false);

const handleSubmit = async () => {
  if (!email.value || !password.value || password.value !== confirmPassword.value) return;
  
  // Fake registration for now
  const success = await authStore.register(email.value, password.value, displayName.value);
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
  border-color: #2563eb !important;
}

.custom-text-field :deep(.v-field__input) {
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  color: #0f172a;
}

.custom-text-field :deep(.v-field__prepend-inner) {
  color: #94a3b8;
}

.custom-text-field :deep(.v-field__append-inner) {
  color: #94a3b8;
  cursor: pointer;
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
  color: #475569;
}

.register-link {
  color: #2563eb;
  text-decoration: none;
  font-weight: 600;
}

.register-link:hover {
  text-decoration: underline;
}
</style>
