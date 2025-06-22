<template>
  <aside class="sidebar">
    <div class="sidebar-content">
      <div class="search-wrap">
        <div class="search-input-container">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="메뉴 검색..."
            class="search-input"
            @input="handleSearch"
          />
          <span class="search-icon">
            <img src="/public/search.svg" alt="search" />
          </span>
          
          <!-- 검색 결과 드롭다운 -->
          <div v-if="searchQuery && filteredMenuList.length > 0" class="search-dropdown">
            <ul class="search-results-list">
              <li
                v-for="result in filteredMenuList"
                :key="`${result.group}-${result.item.path}`"
                @click="navigate(result.item.label, result.item.path)"
                class="search-result-item"
              >
                <div class="result-group">{{ result.group }}</div>
                <div class="result-item">{{ result.item.label }}</div>
              </li>
            </ul>
          </div>
        </div>
      </div>
      
      <!-- 일반 메뉴 (항상 표시) -->
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
    </div>
    
    <!-- 버전 정보 -->
    <div class="version-info">
      <span class="version-text">v1.0.0</span>
    </div>
  </aside>
</template>

<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { menuList } from "@/config/menuConfig";
import { useTabStore } from "@/stores/tabStore";

const openMenu = ref(null);
const searchQuery = ref("");
const router = useRouter();
const tabStore = useTabStore();

const toggle = (menu) => {
  openMenu.value = openMenu.value === menu ? null : menu;
};

const navigate = (label, path) => {
  // 해당 메뉴가 속한 그룹을 찾아서 사이드바에서 열기
  const targetGroup = menuList.find(group => 
    group.items.some(item => item.path === path)
  );
  
  if (targetGroup) {
    openMenu.value = targetGroup.group;
  }
  
  if (tabStore.hasTab(path)) {
    router.push(path);
  } else {
    tabStore.addTab({ title: label, path });
    router.push(path);
  }
  // 검색 후 검색창 초기화
  searchQuery.value = "";
};

const handleSearch = () => {
  // 검색 로직은 computed에서 처리
};

const filteredMenuList = computed(() => {
  if (!searchQuery.value.trim()) return [];
  
  const query = searchQuery.value.toLowerCase();
  const results = [];
  
  menuList.forEach(group => {
    // 그룹명에서 검색
    if (group.group.toLowerCase().includes(query)) {
      group.items.forEach(item => {
        results.push({
          group: group.group,
          item: item
        });
      });
    } else {
      // 메뉴 아이템에서 검색
      const matchingItems = group.items.filter(item => 
        item.label.toLowerCase().includes(query)
      );
      
      matchingItems.forEach(item => {
        results.push({
          group: group.group,
          item: item
        });
      });
    }
  });
  
  return results;
});
</script>

<style scoped>
.sidebar {
  width: 240px;
  flex-shrink: 0;
  background-color: #f9f9f9;
  border-right: 1px solid #e0e0e0;
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
}

.sidebar-content {
  flex: 1;
  padding: 24px 20px;
  overflow-y: auto;
}

ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.search-wrap {
  margin-bottom: 24px;
}

.search-input-container {
  position: relative;
  width: 100%;
}

.search-input {
  width: 100%;
  padding: 10px 12px 10px 36px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 14px;
  background-color: white;
  outline: none;
  transition: border-color 0.2s;
  box-sizing: border-box;
}

.search-input:focus {
  border-color: #d5eb97;
  box-shadow: 0 0 0 2px rgba(213, 235, 151, 0.2);
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.search-icon img {
  width: 14px;
  height: 14px;
  opacity: 0.6;
}

.search-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background-color: white;
  border-radius: 6px;
  border: 1px solid #e0e0e0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  z-index: 1000;
  margin-top: 4px;
}

.search-results-list {
  max-height: 200px;
  overflow-y: auto;
}

.search-result-item {
  padding: 8px 12px;
  cursor: pointer;
  transition: background-color 0.2s;
  border-bottom: 1px solid #f0f0f0;
}

.search-result-item:last-child {
  border-bottom: none;
}

.search-result-item:hover {
  background-color: #f0f6ea;
}

.result-group {
  font-size: 11px;
  color: #666;
  margin-bottom: 2px;
  font-weight: 500;
}

.result-item {
  font-size: 13px;
  color: #333;
  font-weight: 500;
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

.version-info {
  padding: 12px 20px;
  background-color: #f9f9f9;
  border-top: 1px solid #e0e0e0;
  flex-shrink: 0;
}

.version-text {
  font-size: 12px;
  color: #666;
  text-align: left;
  display: block;
}
</style>