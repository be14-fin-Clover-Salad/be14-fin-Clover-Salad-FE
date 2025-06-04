// src/api/auth.js
import axios from 'axios'
import { useAuthStore } from '@/stores/auth'

// axios 인스턴스 생성
const api = axios.create({
  baseURL: 'http://localhost:8080',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 응답 인터셉터: accessToken 만료 시 자동 재발급
api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config

    // accessToken 만료로 인한 401이고, 재시도한 적 없다면
    if (error.response?.status === 401 && !originalRequest.__isRetry) {
      originalRequest.__isRetry = true

      const auth = useAuthStore()
      try {
        const refreshRes = await api.post('/employee/refresh-token')

        const newAccessToken = refreshRes.headers['authorization']?.split(' ')[1]
        if (newAccessToken) {
          auth.setAccessToken(newAccessToken)
          originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`
          return api(originalRequest) // 원래 요청 재시도
        }
      } catch (refreshError) {
        auth.clearToken()
        window.location.href = '/' // 로그인 페이지로 리다이렉트
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

export default api