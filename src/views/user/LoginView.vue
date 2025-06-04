<template>
  <div class="login-wrapper">
    <div class="left-section">
      <div class="text-container">
        <h1>SALAD</h1>
        <h2>SELLERED</h2>
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
          <button type="button" class="reset-btn">Reset Password</button>
          <button type="submit" class="login-btn">Login</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import api from '@/api/auth'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

const code = ref('')
const password = ref('')
const router = useRouter()
const auth = useAuthStore()

const login = async () => {
  try {

    const res = await api.post('/login', {
      code: code.value,
      password: password.value
    })

    const token = res.headers['authorization']?.split(' ')[1]
    if (!token) {
      console.warn('⚠️ accessToken이 응답에 포함되지 않았습니다.')
      return
    }

    auth.setAccessToken(token)

    router.push('/')
  } catch (e) {
    console.warn('🚨 로그인 실패:', e)
    console.warn('🚨 에러 메시지:', e.message)
    console.warn('🚨 응답 데이터:', e.response?.data)
    alert('로그인에 실패했습니다. 다시 시도해주세요.')
  }
}
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
  color: white;
}
</style>