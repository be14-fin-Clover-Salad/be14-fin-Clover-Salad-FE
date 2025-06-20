<template>
  <div class="top-tabs">
    <div
      v-for="(tab, index) in tabs"
      :key="tab.path"
      class="tab"
      :class="{ active: isActive(tab) }"
      @click="switchTab(tab)"
    >
      <span class="tab-title">{{ tab.title }}</span>
      <span class="close" @click.stop="closeTab(tab)">×</span>
    </div>
  </div>
</template>

<script setup>
import { useRoute, useRouter } from "vue-router";
import { useTabStore } from "@/stores/tabStore";
import { computed, watch } from "vue";
import { menuList, tabOnlyMenuItems } from "@/config/menuConfig";

const route = useRoute();
const router = useRouter();
const tabStore = useTabStore();
const tabs = computed(() => tabStore.tabs);

// 현재 route 기준 탭이 활성화됐는지 확인
const isActive = (tab) => {
  const current = route.meta.basePath || route.path;
  return tab.path === current;
};

// 현재 route 기준으로 basePath 구함
const getBasePath = () => {
  return route.meta.basePath || route.path;
};

watch(
  () => route.path,
  (newPath) => {
    if (newPath === "/") return;

    const allItems = [...menuList.flatMap((group) => group.items), ...tabOnlyMenuItems];
    const basePath = route.meta.basePath || newPath;
    const match = allItems.find((item) => item.path === basePath);

    if (match && !tabs.value.find((t) => t.path === basePath)) {
      tabStore.addTab({
        title: match.label,
        path: basePath,
      });
    }
  },
  { immediate: true }
);

const switchTab = (tab) => {
  if (!isActive(tab)) {
    router.push(tab.path);
  }
};

const closeTab = (tab) => {
  tabStore.removeTab(tab.path);
  if (isActive(tab)) {
    const fallback = tabStore.tabs.at(-1);
    router.push(fallback ? fallback.path : "/");
  }
};
</script>

<style scoped>
.top-tabs {
  display: flex;
  padding: 0 16px 0 5px;
  background-color: #F9F9F9;
  border-bottom: 1px solid #c8d6ae;
  height: 42px;
  align-items: flex-end;
  position: relative;
}
.tab {
  padding: 8px 2px 8px 16px;
  border: 1px solid #c8d6ae;
  border-bottom: none;
  border-top-left-radius: 10px;
  border-top-right-radius: 10px;
  background-color: #eeeeee;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  color: #333;
  position: relative;
  bottom: -1px;
  min-width: 0;
  max-width: 200px;
}
.tab.active {
  background-color: white;
  z-index: 2;
  border-bottom-color: white;
  font-weight: 600;
}

.tab.active::before,
.tab.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  width: 18px;
  height: 18px;
}

.tab.active::before {
  left: -18px;
  border-bottom-right-radius: 10px;
  box-shadow: 6px 6px 0 0 white;
}

.tab.active::after {
  right: -18px;
  border-bottom-left-radius: 10px;
  box-shadow: -6px 6px 0 0 white;
}

.tab:hover:not(.active) {
  background-color: #e0e0e0;
}

.close {
  font-weight: normal;
  cursor: pointer;
  font-size: 16px;
  color: #888;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: background-color 0.2s;
  line-height: 1;
  position: relative;
  top: 1px;
}

.tab-title {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
