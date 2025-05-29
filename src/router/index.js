import { createRouter, createWebHistory } from "vue-router";
import CustomerView from "../views/customer/CustomerView.vue";

const routes = [
  {
    path: "/customer",
    component: CustomerView,
    meta: { showTabs: true, title: "고객 관리" },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
