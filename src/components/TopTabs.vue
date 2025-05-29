<template>
  <div class="top-tabs">
    <div
      v-for="(tab, index) in tabs"
      :key="tab.path"
      class="tab"
      :class="{ active: tab.path === route.path }"
      @click="switchTab(tab)"
    >
      {{ tab.title }}
      <span class="close" @click.stop="closeTab(tab)">×</span>
    </div>
  </div>
</template>

<script setup>
import { useRoute, useRouter } from "vue-router";
import { useTabStore } from "../stores/tabStore";
import { watch } from "vue";

const route = useRoute();
const router = useRouter();
const tabStore = useTabStore();
const tabs = tabStore.tabs;

watch(
  () => route.path,
  (newPath) => {
    if (!tabs.find((t) => t.path === newPath)) {
      tabStore.addTab({
        title: route.meta.title || "이름 없는 탭",
        path: newPath,
      });
    }
  },
  { immediate: true }
);

const switchTab = (tab) => {
  if (tab.path !== route.path) router.push(tab.path);
};

const closeTab = (tab) => {
  tabStore.removeTab(tab.path);
  if (tab.path === route.path) {
    const fallback = tabStore.tabs.at(-1);
    if (fallback) router.push(fallback.path);
  }
};
</script>

<style scoped>
.top-tabs {
  display: flex;
  padding: 0 16px;
  background-color: #e8f2c9;
  border-bottom: 1px solid #c8d6ae;
  height: 42px;
  align-items: flex-end;
}
.tab {
  padding: 8px 16px;
  margin-right: 4px;
  border-top-left-radius: 6px;
  border-top-right-radius: 6px;
  background-color: #f8f8f8;
  border: 1px solid #ddd;
  border-bottom: none;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  color: #333;
  position: relative;
  top: 1px;
}
.tab.active {
  background-color: white;
  border-color: #d5eb97 #d5eb97 white;
  z-index: 1;
}
.tab:hover {
  background-color: #f0f6ea;
}
.close {
  margin-left: 8px;
  font-weight: bold;
  cursor: pointer;
  font-size: 12px;
  color: #888;
}
.close:hover {
  color: #444;
}
</style>
