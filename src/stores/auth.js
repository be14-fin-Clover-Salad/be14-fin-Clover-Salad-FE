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
    updateProfileImage(profilePath) {
      if (this.userInfo) {
        this.userInfo.profilePath = profilePath
        localStorage.setItem('userInfo', JSON.stringify(this.userInfo))
      }
    },
    updateUserName(name) {
      if (this.userInfo) {
        this.userInfo.name = name
        localStorage.setItem('userInfo', JSON.stringify(this.userInfo))
      }
    },
    clearToken() {
      this.accessToken = null
      this.userInfo = null
      localStorage.removeItem('access_token')
      localStorage.removeItem('userInfo')
    }
  }
})