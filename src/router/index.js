import { createRouter, createWebHistory } from 'vue-router'
import { menuList } from '@/config/menuConfig'
import LoginView from '@/views/user/LoginView.vue'
import HomeView from '@/views/HomeView.vue'
import { useAuthStore } from '@/stores/auth'

const routes = menuList.flatMap(group =>
  group.items.map(item => ({
    path: item.path,
    component: item.component,
    meta: {
      title: item.label,
      requiresAuth: true // 인증 필요 여부
    }
  }))
)

routes.unshift({
  path: '/login',
  component: LoginView,
  meta: { layout: 'none', title: '로그인' }
})

routes.unshift({
  path: '/',
  component: HomeView,
  meta: { title: '홈', requiresAuth: true }
})

routes.push({
  path: '/:pathMatch(.*)*',
  redirect: '/'
})

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  if (to.meta.requiresAuth) {
    if (!authStore.accessToken) {
      try {
        await authStore.refreshToken()
        next()
      } catch {
        next('/login')
      }
    } else {
      next()
    }
  } else {
    if (to.path === '/' && authStore.accessToken) {
      next('/home')
    } else {
      next()
    }
  }
})

export default router