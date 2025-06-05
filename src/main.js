import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import '@vueup/vue-quill/dist/vue-quill.snow.css';

const app = createApp(App)
app.use(createPinia())
app.use(router)

const auth = useAuthStore()

// localStorage에서 토큰 복구
if (!auth.accessToken && localStorage.getItem('access_token')) {
  auth.setAccessToken(localStorage.getItem('access_token'))
}

app.mount('#app')