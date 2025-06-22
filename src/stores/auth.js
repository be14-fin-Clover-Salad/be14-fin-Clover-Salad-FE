import { defineStore } from 'pinia'
import api from '@/api/auth'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    accessToken: null,
    userInfo: null
  }),
  getters: {
    // 사용자 정보가 유실되었는지 확인
    isUserInfoLost: (state) => {
      return state.accessToken && !state.userInfo
    },
    // 로그인 상태 확인
    isLoggedIn: (state) => {
      return !!state.accessToken && !!state.userInfo
    },
    // 사용자 ID (기존 authStore.userId와 동일한 용도)
    userId: (state) => {
      return state.userInfo?.id || null
    },
    // 사용자 코드 (사번)
    userCode: (state) => {
      return state.userInfo?.code || null
    },
    // 사용자 이름
    userName: (state) => {
      return state.userInfo?.name || null
    },
    // 사용자 부서명
    userDepartment: (state) => {
      return state.userInfo?.departmentName || null
    },
    // 사용자 레벨
    userLevel: (state) => {
      return state.userInfo?.levelLabel || null
    }
  },
  actions: {
    setAccessToken(token) {
      const pureToken = token.startsWith('Bearer ') ? token.split(' ')[1] : token
      this.accessToken = pureToken
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
    },
    async refreshToken() {
      try {
        const response = await api.post('/auth/refresh-token', null, {
          withCredentials: true
        })
        const newToken = response.headers['authorization']?.split(' ')[1]
        
        if (newToken) {
          this.setAccessToken(newToken)
          return newToken
        } else {
          throw new Error('새로운 액세스 토큰을 받지 못했습니다.')
        }
      } catch (error) {
        this.clearToken()
        throw error
      }
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
        this.clearToken()
        throw error
      }
    },
    // 사용자 정보 유실 시 복구 시도
    async recoverUserInfo() {
      if (!this.accessToken) {
        throw new Error('액세스 토큰이 없습니다.')
      }
      
      if (this.userInfo) {
        return this.userInfo // 이미 있으면 그대로 반환
      }
      
      try {
        const userInfo = await this.fetchUserInfo()
        return userInfo
      } catch (error) {
        throw error
      }
    },
    
    // 개발/테스트용: 사용자 정보만 의도적으로 유실 (토큰은 유지)
    simulateUserInfoLoss() {
      this.userInfo = null
    }
  }
})