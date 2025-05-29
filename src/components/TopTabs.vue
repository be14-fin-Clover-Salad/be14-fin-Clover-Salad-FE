<template>
  <div class="tabs">
    <div
      v-for="tab in tabs"
      :key="tab"
      :class="['tab', activeTab === tab && 'active']"
      @click="selectTab(tab)"
    >
      {{ tab }}
      <span class="close" @click.stop="closeTab(tab)">×</span>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from "vue";
const props = defineProps({
  tabs: Array,
  activeTab: String,
});
const emit = defineEmits(["select-tab", "close-tab"]);

const selectTab = (tab) => emit("select-tab", tab);
const closeTab = (tab) => emit("close-tab", tab);
</script>

<style scoped>
div {
  user-select: none;
}

.tabs {
  display: flex;
  gap: 2px;
  padding-left: 24px;
  height: 44px;
  align-items: flex-end;
  background-color: #f8f8f8;
  border-bottom: 1px solid #ddd;
}

.tab {
  font-size: 14px;
  padding: 8px 12px 6px 12px;
  border: 1px solid transparent;
  border-top-left-radius: 6px;
  border-top-right-radius: 6px;
  color: #666;
  background-color: transparent;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}

.tab.active {
  background-color: white;
  color: #222;
  font-weight: 500;
  border: 1px solid #ddd;
  border-bottom: 1px solid white;
  z-index: 1;
}

.close {
  margin-left: 8px;
  font-size: 12px;
  cursor: pointer;
  color: #999;
}
.close:hover {
  color: #333;
}
</style>
