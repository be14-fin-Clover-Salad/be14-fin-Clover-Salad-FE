import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    accessToken: localStorage.getItem('access_token') || null
  }),
  actions: {
    setAccessToken(token) {
      const pureToken = token.startsWith('Bearer ') ? token.split(' ')[1] : token
      this.accessToken = pureToken
      localStorage.setItem('access_token', pureToken)
    },
    clearToken() {
      this.accessToken = null
      localStorage.removeItem('access_token')
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
        this.clearToken()
        window.location.href = '/login'
        throw e
      }
    }
  }
})