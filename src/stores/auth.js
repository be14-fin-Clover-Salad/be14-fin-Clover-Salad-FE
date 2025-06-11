import { defineStore } from 'pinia'

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
    }
  }
})