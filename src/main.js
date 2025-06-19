import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import { useNotificationStore } from '@/stores/notification'
import '@vueup/vue-quill/dist/vue-quill.snow.css';
import api from '@/api/auth'
import VueECharts from 'vue-echarts'
import * as echarts from 'echarts'

const app = createApp(App)
app.component('v-chart', VueECharts)
app.use(createPinia({
  devtools: false
}))
app.use(router)

const auth = useAuthStore()

if (!auth.accessToken && localStorage.getItem('access_token')) {
  auth.setAccessToken(localStorage.getItem('access_token'))
}

const tryRefreshAndLoadUser = async () => {

  if (window.location.pathname === '/login' || window.location.pathname === '/reset-password') {
    return
  } 

  if (auth.accessToken && !auth.userInfo) {
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


tryRefreshAndLoadUser().then(() => {
  if (auth.userInfo) {
    const notificationStore = useNotificationStore()
    notificationStore.setupSse()
  }
  app.mount('#app')
})
  