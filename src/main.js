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
app.provide('echarts', echarts)
const pinia = createPinia()

app.use(pinia)
app.use(router)

const auth = useAuthStore()
const notificationStore = useNotificationStore()

async function tryRefreshAndLoadUser() {
  try {
    await auth.refreshToken()
  } catch (e) {
    // 토큰 갱신 실패 시 로그인 페이지로 리다이렉트
    if (router.currentRoute.value.path !== '/login') {
      router.push('/login')
    }
  }
}

async function bootstrap() {
  await tryRefreshAndLoadUser()

  // 로그인된 사용자가 있을 때 SSE 설정
  // 브라우저 새로고침이나 앱 재시작 시에도 연결 보장
  if (auth.userInfo && auth.accessToken) {
    try {
      await notificationStore.forceReconnectSse()
    } catch (e) {
      console.warn('앱 시작 시 SSE 설정 실패:', e)
    }
  }

  app.mount('#app')
}

bootstrap()
  