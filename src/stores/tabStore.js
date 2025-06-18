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
  },
});
