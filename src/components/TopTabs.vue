<template>
  <div v-if="tabs.length" class="tabs">
    <div
      v-for="tab in tabs"
      :key="tab"
      :class="['tab', activeTab === tab && 'active']"
      @click="$emit('select-tab', tab)"
    >
      {{ tab }}
      <span class="close" @click.stop="$emit('close-tab', tab)">×</span>
    </div>
  </div>
</template>

<script setup>
defineProps({
  tabs: Array,
  activeTab: String,
});
defineEmits(["select-tab", "close-tab"]);
</script>

<style scoped>
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
  padding: 8px 16px 6px;
  border: 1px solid transparent;
  border-top-left-radius: 6px;
  border-top-right-radius: 6px;
  color: #666;
  background-color: transparent;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
}

.tab:hover {
  background-color: #f1f1f1;
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
  font-weight: bold;
  font-size: 12px;
  cursor: pointer;
  color: #888;
}
.close:hover {
  color: #111;
}
</style>
