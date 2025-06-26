<template>
  <div class="login-wrapper">
    <div class="left-section">
      <div class="text-container">
        <h1>BY SALAD</h1>
        <h2>BE SELLERED</h2>
      </div>
    </div>

    <div class="right-section">
      <img src="/logo_text.svg" alt="logo" class="logo" />
      <form class="login-form" @submit.prevent="login">
        <div class="form-row">
          <input v-model="code" placeholder="사번" />
        </div>
        <div class="form-row">
          <input v-model="password" type="password" placeholder="비밀번호" />
        </div>
        <div class="button-group">
          <button type="button" class="reset-btn" @click="showResetModal = true">Reset Password</button>
          <button type="submit" class="login-btn">Login</button>
        </div>
      </form>
    </div>

    <!-- Reset Password Modal -->
    <div v-if="showResetModal" class="modal-overlay" @click="showResetModal = false">
      <div class="modal-content" @click.stop>
        <h2>비밀번호 재설정</h2>
        <form @submit.prevent="handleResetPassword">
          <div class="form-row">
            <input v-model="resetCode" placeholder="사번" />
          </div>
          <div class="form-row">
            <input v-model="resetEmail" type="email" placeholder="이메일" />
          </div>
          <div class="modal-buttons">
            <button type="submit" class="send-btn">Send E-mail</button>
            <button type="button" class="cancel-btn" @click="showResetModal = false">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import api from '@/api/auth'
import { useAuthStore } from '@/stores/auth'
import { useNotificationStore } from '@/stores/notification'
import { useRouter } from 'vue-router'

const code = ref('')
const password = ref('')
const router = useRouter()
const auth = useAuthStore()
const notificationStore = useNotificationStore()

// Reset Password 관련 상태
const showResetModal = ref(false)
const resetCode = ref('')
const resetEmail = ref('')

const handleResetPassword = async () => {
  console.log('handleResetPassword 함수 호출됨');
  try {
    const response = await api.post('/employee/password-reset', {
      code: resetCode.value,
      email: resetEmail.value
    });

    console.log('서버 응답:', response);
    alert(response.data);
    
    showResetModal.value = false;
    resetCode.value = '';
    resetEmail.value = '';
  } catch (error) {
    console.log('서버 응답:', error.response);
    alert(error.response.data);
  }
};

const login = async () => {
  try {
    const res = await api.post('/auth/login', {
      code: code.value,
      password: password.value
    });

    const token = res.headers['authorization']?.split(' ')[1];
    if (!token) {
      console.warn('accessToken이 응답에 포함되지 않았습니다.');
      return;
    }

    auth.setAccessToken(token);
    localStorage.setItem('accessToken', token);
    auth.setUserInfo(res.data);

    try {
      await notificationStore.setupSse()
    } catch (err) {
      console.warn('SSE 설정 중 오류 발생 (무시):', err)
    }

    router.push('/');
  } catch (e) {
    const msg = e.response?.data?.message || '로그인 요청에 실패하였습니다.';
    alert(msg);
  }
};
</script>

<style scoped>
.login-wrapper {
  display: flex;
  height: 100vh;
  background-color: #fef5e4;
}

.left-section {
  width: 40%;
  background-color: #d5eb97;
  color: white;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  font-family: 'Inter', sans-serif;
  font-weight: bold;
  font-size: 48px;
  line-height: 1.5;
  padding-left: 60px;
  position: relative;
}

.text-container {
  position: absolute;
  bottom: 18%;
}

.left-section h1,
.left-section h2 {
  margin: 0;
  font-size: inherit;
  font-weight: inherit;
}

.left-section h2 {
  margin-top: 40px;
}

.right-section {
  width: 60%;
  background-color: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
}

.logo {
  height: 135px;
  width: auto;
  object-fit: contain;
  position: absolute;
  top: 30%;
  transform: translateY(-50%);
}

.login-form {
  display: flex;
  flex-direction: column;
  width: 300px;
  gap: 16px;
  position: absolute;
  top: calc(30% + 135px + 100px);
  transform: translateY(-50%);
}

.form-row {
  display: flex;
  align-items: center;
  gap: 22px;
}

.form-row input {
  flex: 1;
  padding: 8px 8px 8px 20px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 14px;
}

.form-row input::placeholder {
  color: #999;
}

.button-group {
  display: flex;
  justify-content: space-between;
  margin-top: 12px;
}

.reset-btn,
.login-btn {
  padding: 10px 16px;
  font-size: 14px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
}

.reset-btn {
  background-color: #e3f1b4;
  color: #474747;
}

.login-btn {
  background-color: #d5eb97;
  color: #474747;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  padding: 52px 32px 32px;
  border-radius: 8px;
  width: 400px;
}

.modal-content h2 {
  margin: 0 0 34px 0;
  color: #474747;
  font-size: 24px;
  text-align: center;
}

.modal-content .form-row input {
  width: calc(100% - 60px);
  margin: 0 30px;
}

.modal-content .form-row {
  margin-bottom: 10px;
}

.modal-buttons {
  display: flex;
  justify-content: center;
  gap: 30px;
  margin-top: 34px;
}

.cancel-btn,
.send-btn {
  padding: 10px 16px;
  font-size: 14px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
}

.cancel-btn {
  background-color: #f5f5f5;
  color: #474747;
}

.send-btn {
  background-color: #d5eb97;
  color: #474747;
}
</style>