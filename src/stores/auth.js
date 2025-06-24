import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/api/auth'
import { useNotificationStore } from '@/stores/notification'

export const useAuthStore = defineStore('auth', () => {
  const accessToken = ref(localStorage.getItem('accessToken') || '')
  const userInfo = ref(JSON.parse(localStorage.getItem('userInfo') || 'null'))

  function setAccessToken(token) {
    accessToken.value = token
    localStorage.setItem('accessToken', token)
  }

  function setUserInfo(info) {
    userInfo.value = info
    localStorage.setItem('userInfo', JSON.stringify(info))
  }

  function clearToken() {
    accessToken.value = ''
    userInfo.value = null
    localStorage.removeItem('accessToken')
    localStorage.removeItem('userInfo')
    
    // 로그아웃 시 SSE 연결 해제
    const notificationStore = useNotificationStore()
    notificationStore.disconnectSse()
  }

  async function refreshToken() {
    try {
      const response = await api.post('/auth/refresh')
      const token = response.headers['authorization']?.split(' ')[1]
      if (token) {
        setAccessToken(token)
        return true
      }
      return false
    } catch (error) {
      clearToken()
      throw error
    }
  }

  async function recoverUserInfo() {
    try {
      const response = await api.get('/auth/me')
      setUserInfo(response.data)
      return response.data
    } catch (error) {
      clearToken()
      throw error
    }
  }

  return {
    accessToken,
    userInfo,
    setAccessToken,
    setUserInfo,
    clearToken,
    refreshToken,
    recoverUserInfo
  }
})