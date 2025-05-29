<template>
  <div class="layout">
    <Sidebar class="sidebar" @open-tab="handleOpenTab" />

    <div class="main">
      <Header class="header" />

      <TopTabs
        v-if="showTabs"
        :tabs="tabs"
        :activeTab="activeTab"
        @select-tab="handleSelectTab"
        @close-tab="handleCloseTab"
      />

      <main class="content">
        <component :is="tabComponentMap[activeTab]" v-if="activeTab" />
        <div v-else class="placeholder">메뉴를 선택해 주세요.</div>
      </main>
    </div>
  </div>
</template>

<script setup>
import Header from "@/components/Header.vue";
import Sidebar from "@/components/Sidebar.vue";
import TopTabs from "@/components/TopTabs.vue";
import CustomerView from "@/views/customer/CustomerView.vue";
// 필요 시 추가 import

import { ref, computed } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();
const tabs = ref([]);
const activeTab = ref("");

const showTabs = computed(() => route.meta.showTabs);

// 탭 이름에 해당하는 컴포넌트를 등록
const tabComponentMap = {
  "기존 고객": CustomerView,
  // "계약 등록": ContractView,
  // "상담 관리": ConsultationView,
};

const handleOpenTab = (tab) => {
  if (!tabs.value.includes(tab)) {
    tabs.value.push(tab);
  }
  activeTab.value = tab;
};

const handleSelectTab = (tab) => {
  activeTab.value = tab;
};

const handleCloseTab = (tab) => {
  tabs.value = tabs.value.filter((t) => t !== tab);
  if (activeTab.value === tab) {
    activeTab.value = tabs.value[tabs.value.length - 1] || "";
  }
};
</script>

<style scoped>
.layout {
  display: flex;
  height: 100vh;
  overflow: hidden;
  user-select: none;
}

.sidebar {
  width: 240px;
  flex-shrink: 0;
  z-index: 10;
  position: relative;
}

.main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.header {
  height: 64px;
  flex-shrink: 0;
}

.content {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
}

.placeholder {
  color: #888;
  padding: 40px;
  text-align: center;
}
</style>
