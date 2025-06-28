<template>
  <aside class="sidebar">
    <div class="sidebar-content">
      <!-- 검색 -->
      <div class="search-wrap">
        <div class="search-input-container">
          <input v-model="searchQuery" type="text" placeholder="메뉴 검색..." class="search-input" @input="handleSearch" />
          <span class="search-icon">
            <img src="/public/search.svg" alt="search" />
          </span>

          <div v-if="searchQuery && filteredMenuList.length" class="search-dropdown">
            <ul class="search-results-list">
              <li v-for="result in filteredMenuList" :key="`${result.group}-${result.item.path}`"
                @click="navigate(result.item.label, result.item.path)" class="search-result-item">
                <div class="result-group">{{ result.group }}</div>
                <div class="result-item">{{ result.item.label }}</div>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- 메뉴 -->
      <nav>
        <ul>
          <li v-for="group in menuList" :key="group.group">
            <div @click="toggle(group.group)" :class="['menu-title', openMenu === group.group && 'active']">
              <span class="menu-label">{{ group.group }}</span>
            </div>
            <ul class="submenu" v-show="openMenu === group.group">
              <li v-for="item in visibleItems(group)" :key="item.path" class="submenu-item"
                @click="navigate(item.label, item.path)">
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
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { menuList } from '@/config/menuConfig'
import { useTabStore } from '@/stores/tabStore'
import { useAuthStore } from '@/stores/auth'

// reactive state
const openMenu = ref(null)
const searchQuery = ref('')
const router = useRouter()
const tabStore = useTabStore()
const authStore = useAuthStore()

// JWT payload parsing util
function parseJwt(token) {
  if (!token) return {}
  const base64Url = token.split('.')[1]?.replace(/-/g, '+').replace(/_/g, '/')
  if (!base64Url) return {}
  try {
    const json = decodeURIComponent(
      atob(base64Url)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
    return JSON.parse(json)
  } catch {
    return {}
  }
}

// 사용자 클레임
const claims = computed(() => parseJwt(authStore.accessToken))

// ADMIN 여부 판단
const isAdmin = computed(() => {
  const auth = claims.value.auth || claims.value.roles || ''
  if (typeof auth === 'string') {
    return auth.includes('ADMIN')
  }
  if (Array.isArray(auth)) {
    return auth.includes('ADMIN')
  }
  return false
})

// “로그 관리” 항목을 제외한 visibleItems 함수
function visibleItems(group) {
  const myRole =
    authStore.userInfo?.role ||
    claims.value.auth || // JWT auth 필드
    claims.value.roles;  // JWT roles 필드
  return group.items.filter(item => {
    // allowedRoles가 있는 경우 내 권한이 포함되어야 보임
    if (item.meta?.allowedRoles) {
      return item.meta.allowedRoles.includes(myRole);
    }
    // “관리” 그룹의 “로그 관리”는 비관리자에겐 제외
    if (group.group === '관리' && item.label === '로그 관리' && !isAdmin.value) {
      return false
    }
    return true
  })
}

// 검색 결과 계산 (로그 관리 항목 제외)
const filteredMenuList = computed(() => {
  if (!searchQuery.value.trim()) return []
  const q = searchQuery.value.toLowerCase()
  const res = []
  menuList.forEach(group => {
    visibleItems(group).forEach(item => {
      if (
        group.group.toLowerCase().includes(q) ||
        item.label.toLowerCase().includes(q)
      ) {
        res.push({ group: group.group, item })
      }
    })
  })
  return res
})

const toggle = menu => {
  openMenu.value = openMenu.value === menu ? null : menu
}

const navigate = (label, path) => {
  if (tabStore.hasTab(path)) {
    router.push(path)
  } else {
    tabStore.addTab({ title: label, path })
    router.push(path)
  }
  searchQuery.value = ''
}

const handleSearch = () => {
  // computed(filteredMenuList)가 자동 갱신됩니다
}
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

.submenu-item {
  font-size: 14px;
  font-weight: 400;
  padding: 8px 12px;
  color: #333;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.submenu-item:hover {
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
