import { createRouter, createWebHistory } from "vue-router";
import { menuList } from "@/config/menuConfig";
import HomeView from "@/views/HomeView.vue";

const routes = menuList.flatMap((group) =>
  group.items.map((item) => ({
    path: item.path,
    component: item.component,
    meta: { title: item.label },
  }))
);

routes.unshift({
  path: "/",
  component: HomeView,
});

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
