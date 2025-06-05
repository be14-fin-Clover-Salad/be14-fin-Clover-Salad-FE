import { createRouter, createWebHistory } from "vue-router";
import { menuList } from "@/config/menuConfig";
import LoginView from "@/views/user/LoginView.vue";
import HomeView from "@/views/HomeView.vue";
import { useAuthStore } from "@/stores/auth";

const routes = menuList.flatMap((group) =>
  group.items.map((item) => ({
    path: item.path,
    component: item.component,
    meta: {
      title: item.label,
      requiresAuth: true, // 인증 필요 여부. 필요 없으면 false
      basePath: item.path, // 상세 경로 포함 대비
    },
  }))
);

// 기본 홈 화면
routes.unshift({
  path: "/login",
  component: LoginView,
  meta: { layout: "none", title: "로그인" },
});

routes.unshift({
  path: "/",
  component: HomeView,
  meta: { title: "홈", requiresAuth: true },
});

routes.push({
  path: "/:pathMatch(.*)*",
  redirect: "/",
});

// 공지사항 상세 화면
routes.push({
  path: "/support/notice/:id",
  component: () => import("@/views/support/notice/NoticeDetail.vue"),
  meta: {
    title: "공지 사항",
    basePath: "/support/notice", // 이 경로 기준으로 탭 유지
  },
});

// 공지사항 등록 화면 추가
routes.push({
  path: "/support/notice/create",
  component: () => import("@/views/support/notice/NoticeCreate.vue"),
  meta: {
    title: "공지 등록",
    basePath: "/support/notice",
  },
});

// 고객 상세 화면
routes.push({
  path: "/customer/:id",
  component: () => import("@/views/customer/CustomerDetail.vue"),
  meta: {
    title: "고객 상세",
    basePath: "/customer",
  },
});

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();

  // 개발 시 로그인 로직 하고 싶지 않으면 아래 부분 주석
  // if (!authStore.accessToken && localStorage.getItem('access_token')) {
  //   authStore.setAccessToken(localStorage.getItem('access_token'))
  // }

  // if (to.meta.requiresAuth) {
  //   if (!authStore.accessToken) {
  //     try {
  //       await authStore.refreshToken()
  //       next()
  //     } catch {
  //       next('/login')
  //     }
  //   } else {
  //     next()
  //   }
  // } else {
  //   if (to.path === '/login' && authStore.accessToken) {
  //     next('/')
  //   } else {
  //     next()
  //   }
  // }
  // 여기부터 남기면 개발 단계에서 로그인 로직 건너 뜀
  next();
});

export default router;
