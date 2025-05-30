<template>
  <aside class="sidebar">
    <div class="logo-wrap">
      <img src="/public/logo.png" alt="logo" class="logo-img" />
    </div>
    <nav>
      <ul>
        <li v-for="group in menuList" :key="group.group">
          <div
            @click="toggle(group.group)"
            :class="['menu-title', openMenu === group.group && 'active']"
          >
            <span class="menu-label">{{ group.group }}</span>
          </div>
          <ul class="submenu" v-show="openMenu === group.group">
            <li
              v-for="item in group.items"
              :key="item.path"
              @click="navigate(item.label, item.path)"
            >
              {{ item.label }}
            </li>
          </ul>
        </li>
      </ul>
    </nav>
  </aside>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { menuList } from "@/config/menuConfig";
import { useTabStore } from "@/stores/tabStore";

const openMenu = ref(null);
const router = useRouter();
const tabStore = useTabStore();

const toggle = (menu) => {
  openMenu.value = openMenu.value === menu ? null : menu;
};

const navigate = (label, path) => {
  tabStore.addTab({ title: label, path });
  router.push(path);
};
</script>

<style scoped>
.sidebar {
  width: 240px;
  background-color: #f9f9f9;
  padding: 24px 20px;
  border-right: 1px solid #e0e0e0;
  height: 100%;
  overflow-y: auto;
  position: relative;
}
ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.logo-wrap {
  width: 100%;
  height: 100px; /* 고정 높이 */
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 24px;
}

.logo-img {
  width: 100px;
  height: 100px;
  object-fit: contain;
}

.menu-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 15px;
  font-weight: 600;
  padding: 10px 14px;
  margin-top: 14px;
  color: #1f1f1f;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s;
  user-select: none;
}
.menu-title:hover {
  background-color: #f2f2f2;
}
.menu-title.active {
  background-color: #d5eb97;
  color: #1c1c1c;
}
.submenu {
  margin-top: 6px;
  padding-left: 18px;
  border-left: 2px solid #d5eb97;
  margin-bottom: 12px;
  cursor: pointer;
  user-select: none;
}
.submenu li {
  font-size: 14px;
  font-weight: 400;
  padding: 8px 12px;
  color: #333;
  border-radius: 4px;
  transition: background-color 0.2s;
}
.submenu li:hover {
  background-color: #f0f6ea;
}
</style>
