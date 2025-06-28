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
const pinia = createPinia();
app.use(pinia);

app.component('v-chart', VueECharts)
app.provide('echarts', echarts)
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

    if(auth.userInfo) {
      await notificationStore.connectSse()
    }
  } catch (err) {
      auth.clearToken()
      window.location.href = '/login'
  }
}

async function bootstrap() {
  await tryRefreshAndLoadUser()

  if (auth.userInfo) {
    try {
      notificationStore.connectSse()
    } catch (e) {
    }
  }

  app.mount('#app')
}

bootstrap()
  