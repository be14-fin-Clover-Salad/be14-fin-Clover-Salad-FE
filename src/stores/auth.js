import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    accessToken: localStorage.getItem('access_token') || null,
    userInfo: JSON.parse(localStorage.getItem('userInfo')) || null
  }),
  actions: {
    setAccessToken(token) {
      const pureToken = token.startsWith('Bearer ') ? token.split(' ')[1] : token
      this.accessToken = pureToken
      localStorage.setItem('access_token', pureToken)
    },
    setUserInfo(info) {
      this.userInfo = info
      localStorage.setItem('userInfo', JSON.stringify(info))
    },
    clearToken() {
      this.accessToken = null
      this.userInfo = null
      localStorage.removeItem('access_token')
      localStorage.removeItem('userInfo')
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