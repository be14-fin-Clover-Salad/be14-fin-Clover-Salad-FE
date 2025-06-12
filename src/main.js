import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import '@vueup/vue-quill/dist/vue-quill.snow.css';
import api from '@/api/auth'

const app = createApp(App)
app.use(createPinia())
app.use(router)

const auth = useAuthStore()

// localStorage에서 토큰 복구
if (!auth.accessToken && localStorage.getItem('access_token')) {
  auth.setAccessToken(localStorage.getItem('access_token'))
}

const tryRefreshAndLoadUser = async () => {
  if (window.location.pathname === '/login' || window.location.pathname === '/reset-password') {
    return
  }
  if (auth.accessToken && !auth.userInfo) {
    // accessToken은 있으나 userInfo가 없는 경우 → 마이페이지 호출
    try {
      const res = await api.get('/employee/mypage', {
        headers: {
          Authorization: `Bearer ${auth.accessToken}`
        },
        withCredentials: true
      })
      
      auth.setUserInfo(res.data)
    } catch (err) {
      console.error('[userInfo 복구 실패]', err)
      auth.clearToken()
    }
  } else if (!auth.accessToken) {
    // accessToken도 없는 경우 → refreshToken으로 재발급
    try {
      const res = await api.post('/auth/refresh-token', null, {
        withCredentials: true
      })
      const newToken = res.headers['authorization']?.split(' ')[1]

      if (newToken) {
        auth.setAccessToken(newToken)

        const userRes = await api.get('/employee/mypage', {
          headers: {
            Authorization: `Bearer ${newToken}`
          },
          withCredentials: true
        })
        auth.setUserInfo(userRes.data)
      }
    } catch (err) {
      console.warn('[refresh-token 재발급 실패]', err)
      auth.clearToken()
      window.location.href = '/login'
    }
  }
}

app.mount('#app')

tryRefreshAndLoadUser()