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
const notificationStore = useNotificationStore()

const tryRefreshAndLoadUser = async () => {

  if (['/login', '/reset-password'].includes(window.location.pathname)) {
    return
  } 

  try {
    if (auth.accessToken && !auth.userInfo) {
      await auth.recoverUserInfo()
    } else if (!auth.accessToken) {
      await auth.refreshToken()
      await auth.recoverUserInfo()
    } 
  } catch (err) {
      console.error('[main.js] 사용자 정보 복구 실패:', err)
      auth.clearToken()
      window.location.href = '/login'
  }
}


// 알림 발생 시점을 명확히 하기위해
async function bootstrap() {
  await tryRefreshAndLoadUser()

  if (auth.userInfo) {
    try {
      await notificationStore.setupSse()
      console.log('[main.js] SSE 연결 성공')
    } catch (e) {
      console.warn('[SSE] 연결 실패:', e)
    }
  }

  app.mount('#app')
}

bootstrap()
  