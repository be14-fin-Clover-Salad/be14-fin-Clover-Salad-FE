import { createRouter, createWebHistory } from "vue-router";
import CustomerView from "@/views/customer/CustomerView.vue";
// 필요 시 다른 페이지 import

const routes = [
  {
    path: "/customer",
    component: CustomerView,
    meta: { showTabs: true }, // ✅ showTabs 활성화
  },
  // 다른 경로도 필요 시 추가
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
