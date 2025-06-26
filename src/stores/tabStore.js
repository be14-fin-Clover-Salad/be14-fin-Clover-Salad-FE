import { defineStore } from "pinia";

export const useTabStore = defineStore("tab", {
  state: () => ({
    tabs: [],
  }),
  actions: {
    addTab(tab) {
      if (!this.tabs.find((t) => t.path === tab.path)) {
        this.tabs.push(tab);
      }
    },
    removeTab(path) {
      this.tabs = this.tabs.filter((t) => t.path !== path);
    },
    removeAllTabs() {
      this.tabs = []
    },
    // 탭이 이미 존재하는지 확인하는 getter
    hasTab(path) {
      return this.tabs.find((t) => t.path === path) !== undefined;
    },
    // 탭 전환을 위한 액션
    switchToTab(path) {
      return this.tabs.find((t) => t.path === path);
    },
   
  },
});
