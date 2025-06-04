import { defineStore } from 'pinia'
import api from '@/api/auth'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    accessToken: null
  }),
  actions: {
    setAccessToken(token) {
      const pureToken = token.startsWith('Bearer ') ? token.split(' ')[1] : token
      this.accessToken = pureToken
    },
    clearToken() {
      this.accessToken = null
    },
    async refreshToken() {
      try {
        const res = await api.post('/employee/refresh-token')
        const newToken = res.headers['authorization']?.split(' ')[1]
        if (newToken) {
          this.setAccessToken(newToken)
          return newToken
        } else {
          throw new Error('No access token in response')
        }
      } catch (e) {
        console.warn('🔁 accessToken 갱신 실패:', e.message)
        this.clearToken()
        window.location.href = '/login'
        throw e
      }
    }
  }
})