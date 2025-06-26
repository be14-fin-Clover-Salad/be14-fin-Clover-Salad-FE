<template>
  <div class="top-tabs">
    <!-- 왼쪽 화살표 탭 (탭 스타일 그대로) -->
    <div
      class="tab control-tab"
      :class="{ active: showMenu }"
      @click.stop="onToggleMenu"
    >
      <span class="control-btn">▾</span>
      <div v-if="showMenu" class="control-menu">
        <div class="control-item" @click.stop="onCloseOtherTabs">
          현재 탭 제외 닫기
        </div>
        <div class="control-item" @click.stop="onCloseAllTabs">
          전체 탭 닫기
        </div>
      </div>
    </div>

    <!-- 기존 탭들 -->
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
import { ref, computed, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useTabStore } from "@/stores/tabStore";
import { menuList, tabOnlyMenuItems } from "@/config/menuConfig";

const route = useRoute();
const router = useRouter();
const tabStore = useTabStore();
const tabs = computed(() => tabStore.tabs);

// 드롭다운 메뉴 표시 상태
const showMenu = ref(false);

function onToggleMenu() {
  try {
    showMenu.value = !showMenu.value;
  } catch (e) {
    console.error(e);
  }
}

// 전체 탭 닫기 → 홈으로 이동
function onCloseAllTabs() {
  try {
    tabStore.removeAllTabs();
    router.push("/");
    showMenu.value = false;
  } catch (e) {
    console.error(e);
  }
}

// 현재 탭 제외 닫기
function onCloseOtherTabs() {
  try {
    const current = route.meta.basePath || route.path;
    tabStore.tabs.forEach((t) => {
      if (t.path !== current) tabStore.removeTab(t.path);
    });
    showMenu.value = false;
  } catch (e) {
    console.error(e);
  }
}

// 탭이 활성 상태인지
function isActive(tab) {
  const current = route.meta.basePath || route.path;
  return tab.path === current;
}

// 라우트 변경 시 탭 추가
watch(
  () => route.path,
  (newPath) => {
    if (newPath === "/") return;

    const allItems = [
      ...menuList.flatMap((group) => group.items),
      ...tabOnlyMenuItems,
    ];
    const basePath = route.meta.basePath || newPath;
    const match = allItems.find((item) => item.path === basePath);
    if (match && !tabs.value.find((t) => t.path === basePath)) {
      tabStore.addTab({ title: match.label, path: basePath });
    }
  },
  { immediate: true }
);

// 탭 클릭 시 라우팅
function switchTab(tab) {
  if (!isActive(tab)) router.push(tab.path);
}

// 개별 탭 닫기
function closeTab(tab) {
  try {
    tabStore.removeTab(tab.path);
    if (isActive(tab)) {
      const fallback = tabStore.tabs.at(-1);
      router.push(fallback ? fallback.path : "/");
    }
  } catch (e) {
    console.error(e);
  }
}
</script>

<style scoped>
.top-tabs {
  display: flex;
  align-items: flex-end;
  padding: 0 16px 0 5px;
  background-color: #f9f9f9;
  border-bottom: 1px solid #c8d6ae;
  height: 42px;
  position: relative;
}

/* 모든 탭에 공통 적용 */
.tab {
  padding: 8px 16px;
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
  gap: 8px;
  color: #333333;
  position: relative;
  bottom: -1px;
  max-width: 200px;
  white-space: nowrap;
}

/* 활성 탭 */
.tab.active {
  background-color: #ffffff;
  z-index: 2;
  border-bottom-color: #ffffff;
  font-weight: 600;
}

.tab.active::before,
.tab.active::after {
  content: "";
  position: absolute;
  bottom: 0;
  width: 18px;
  height: 18px;
}

.tab.active::before {
  left: -18px;
  border-bottom-right-radius: 10px;
  box-shadow: 6px 6px 0 0 #ffffff;
}

.tab.active::after {
  right: -18px;
  border-bottom-left-radius: 10px;
  box-shadow: -6px 6px 0 0 #ffffff;
}

.tab:hover:not(.active) {
  background-color: #e0e0e0;
}

/* 닫기 버튼 */
.close {
  font-size: 16px;
  color: #888888;
}

/* 탭 제목 텍스트 처리 */
.tab-title {
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 화살표 탭 추가 스타일 */
.control-tab {
  /* .tab 기본 스타일 상속 */
  padding: 8px;
  width: 32px;
  justify-content: center;
}

/* 화살표 아이콘 크기 */
.control-btn {
  font-size: 18px;
  line-height: 1;
  user-select: none;
}

/* 드롭다운 메뉴 */
.control-menu {
  position: absolute;
  top: 100%;
  left: 0;
  background: #ffffff;
  border: 1px solid #c8d6ae;
  border-radius: 4px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  z-index: 10;
  margin-top: 4px;
}

/* 드롭다운 아이템 */
.control-item {
  padding: 8px 12px;
  cursor: pointer;
  white-space: nowrap;
}

.control-item:hover {
  background-color: #f0f0f0;
}
</style>
