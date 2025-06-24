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

  // 로그인된 사용자가 있을 때만 SSE 설정
  // 중복 호출 방지를 위해 main.js에서는 제거하고 로그인 시에만 설정
  // if (auth.userInfo) {
  //   try {
  //     await notificationStore.setupSse()
  //   } catch (e) {
  //   }
  // }

  app.mount('#app')
}

bootstrap()
  