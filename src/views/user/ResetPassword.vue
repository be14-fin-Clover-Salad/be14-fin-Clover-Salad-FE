<template>
  <div class="reset-password-container">
    <div class="reset-password-box">
      <img src="/logo_text.svg" alt="logo" class="logo" />
      <h1>비밀번호 재설정</h1>
      <p class="description">새로운 비밀번호를 입력해주세요.</p>

      <form @submit.prevent="handleSubmit" class="form">
        <div class="input-group">
          <label for="password">새 비밀번호</label>
          <input
            type="password"
            id="password"
            v-model="password"
            placeholder="새 비밀번호를 입력하세요"
            required
          />
        </div>

        <div class="input-group">
          <label for="confirmPassword">새 비밀번호 확인</label>
          <input
            type="password"
            id="confirmPassword"
            v-model="confirmPassword"
            placeholder="새 비밀번호를 다시 입력하세요"
            required
          />
          <p v-if="passwordError" class="error-message">{{ passwordError }}</p>
        </div>

        <button type="submit" :disabled="!isFormValid" class="submit-button">
          비밀번호 재설정
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from '@/api/auth';

const route = useRoute();
const router = useRouter();

const password = ref('');
const confirmPassword = ref('');
const passwordError = ref('');

const isFormValid = computed(() => {
  return password.value && confirmPassword.value && !passwordError.value;
});

const validatePassword = () => {
  if (password.value !== confirmPassword.value) {
    passwordError.value = '비밀번호가 일치하지 않습니다.';
    return false;
  }
  if (password.value.length < 8) {
    passwordError.value = '비밀번호는 8자 이상이어야 합니다.';
    return false;
  }
  passwordError.value = '';
  return true;
};

const handleSubmit = async () => {
  if (!validatePassword()) return;

  try {
    // URL에서 토큰 파싱
    const token = route.query.token;
    if (!token) {
      alert('유효하지 않은 비밀번호 재설정 링크입니다.');
      return;
    }

    await axios.post('/employee/password-resets/confirm', {
      token,
      newPassword: password.value
    });
    
    alert('비밀번호가 성공적으로 변경되었습니다.');
    router.push('/login');
  } catch (error) {
    alert('비밀번호 재설정에 실패했습니다. 다시 시도해주세요.');
    console.error('비밀번호 재설정 오류:', error);
  }
};

// 비밀번호 입력 시마다 유효성 검사
watch([password, confirmPassword], () => {
  if (confirmPassword.value) {
    validatePassword();
  }
});
</script>

<style scoped>
.reset-password-container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f5f5f5;
}

.reset-password-box {
  background: white;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
  text-align: center;
}

.logo {
  height: 60px;
  margin-bottom: 24px;
}

h1 {
  font-size: 24px;
  color: #333;
  margin-bottom: 8px;
}

.description {
  color: #666;
  margin-bottom: 32px;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  text-align: left;
}

label {
  font-size: 14px;
  color: #333;
  font-weight: 500;
}

input {
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.2s;
}

input:focus {
  outline: none;
  border-color: #d5eb97;
}

.error-message {
  color: #d32f2f;
  font-size: 12px;
  margin-top: 4px;
}

.submit-button {
  background-color: #d5eb97;
  color: #333;
  padding: 12px;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.submit-button:hover:not(:disabled) {
  background-color: #c5db87;
}

.submit-button:disabled {
  background-color: #e0e0e0;
  cursor: not-allowed;
}
</style> 