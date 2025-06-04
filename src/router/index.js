import { createRouter, createWebHistory } from "vue-router";
import { menuList } from "@/config/menuConfig";
import HomeView from "@/views/HomeView.vue";

const routes = menuList.flatMap((group) =>
  group.items.map((item) => ({
    path: item.path,
    component: item.component,
    meta: {
      title: item.label,
      basePath: item.path, // 상세 경로 포함 대비
    },
  }))
);

// 기본 홈 화면
routes.unshift({
  path: "/",
  component: HomeView,
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

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
