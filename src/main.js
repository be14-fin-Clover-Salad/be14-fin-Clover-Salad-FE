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

const tryRefreshAndLoadUser = async () => {

  if (window.location.pathname === '/login' || window.location.pathname === '/reset-password') {
    return
  } 

  if (auth.accessToken && !auth.userInfo) {
    try {
      await auth.recoverUserInfo()
    } catch (err) {
      console.error('[main.js] 사용자 정보 복구 실패:', err)
      auth.clearToken()
    }
  } else if (!auth.accessToken) {
    try {
      await auth.refreshToken()
      await auth.recoverUserInfo()
    } catch (err) {
      console.warn('[main.js] 토큰 재발급 및 사용자 정보 복구 실패:', err)
      auth.clearToken()
      window.location.href = '/login'
    }
  }
}


// 알림 발생 시점을 명확히 하기위해
async function bootstrap() {
  await tryRefreshAndLoadUser()

  if (auth.userInfo) {
    const notificationStore = useNotificationStore()
    try {
      await notificationStore.setupSse()
    } catch (e) {
      console.warn('[SSE] 연결 실패:', e)
    }
  }

  app.mount('#app')
}

bootstrap()
  