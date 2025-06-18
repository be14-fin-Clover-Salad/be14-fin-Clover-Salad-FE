import { defineStore } from 'pinia'
import api from '@/api/auth'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    accessToken: localStorage.getItem('access_token') || null,
    userInfo: null
  }),
  actions: {
    setAccessToken(token) {
      const pureToken = token.startsWith('Bearer ') ? token.split(' ')[1] : token
      this.accessToken = pureToken
      localStorage.setItem('access_token', pureToken)
    },
    setUserInfo(info) {
      this.userInfo = info
    },
    updateProfileImage(profilePath) {
      if (this.userInfo) {
        this.userInfo.profilePath = profilePath
      }
    },
    updateUserName(name) {
      if (this.userInfo) {
        this.userInfo.name = name
      }
    },
    clearToken() {
      this.accessToken = null
      this.userInfo = null
      localStorage.removeItem('access_token')
    },
    async fetchUserInfo() {
      try {
        const response = await api.get('/employee/header', {
          headers: {
            Authorization: `Bearer ${this.accessToken}`
          },
          withCredentials: true
        })
        this.setUserInfo(response.data)
        return response.data
      } catch (error) {
        console.error('사용자 정보를 가져오는데 실패했습니다:', error)
        this.clearToken()
        throw error
      }
    }
  }
})