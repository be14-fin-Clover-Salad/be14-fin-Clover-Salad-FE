<template>
  <aside class="sidebar">
    <div class="logo">salad</div>
    <nav>
      <ul>
        <li>
          <div
            @click="toggle('dashboard')"
            :class="['menu-title', openMenu === 'dashboard' && 'active']"
          >
            <span class="menu-label">대시보드</span>
          </div>
          <ul class="submenu" v-show="openMenu === 'dashboard'">
            <li>사원별 실적 조회</li>
            <li>상품별 매출 조회</li>
            <li>영업부 매출 조회</li>
          </ul>
        </li>
        <li>
          <div
            @click="toggle('performance')"
            :class="['menu-title', openMenu === 'performance' && 'active']"
          >
            <span class="menu-label">실적</span>
          </div>
          <ul class="submenu" v-show="openMenu === 'performance'">
            <li>사업별 실적 조회</li>
            <li>상품별 매출 조회</li>
            <li>영업부 매출 조회</li>
            <li>개인 실적 목표 관리</li>
            <li>팀 실적 목표 관리</li>
            <li>매출 관리</li>
          </ul>
        </li>
        <li>
          <div
            @click="toggle('contract')"
            :class="['menu-title', openMenu === 'contract' && 'active']"
          >
            <span class="menu-label">계약</span>
          </div>
          <ul class="submenu" v-show="openMenu === 'contract'">
            <li>계약 관리</li>
            <li>계약서 양식 관리</li>
          </ul>
        </li>
        <li>
          <div
            @click="toggle('customer')"
            :class="['menu-title', openMenu === 'customer' && 'active']"
          >
            <span class="menu-label">고객</span>
          </div>
          <ul class="submenu" v-show="openMenu === 'customer'">
            <li>기존 고객</li>
            <li>잠재 고객</li>
            <li>상담 관리</li>
          </ul>
        </li>
        <li>
          <div
            @click="toggle('product')"
            :class="['menu-title', openMenu === 'product' && 'active']"
          >
            <span class="menu-label">상품</span>
          </div>
          <ul class="submenu" v-show="openMenu === 'product'">
            <li>상품 관리</li>
          </ul>
        </li>
        <li>
          <div
            @click="toggle('admin')"
            :class="['menu-title', openMenu === 'admin' && 'active']"
          >
            <span class="menu-label">관리</span>
          </div>
          <ul class="submenu" v-show="openMenu === 'admin'">
            <li>결제 관리</li>
            <li>사업 조회</li>
            <li>알림 관리</li>
            <li>로그인 관리</li>
          </ul>
        </li>
      </ul>
    </nav>
  </aside>
</template>

<script setup>
import { ref } from "vue";
const openMenu = ref(null);
const toggle = (menu) => {
  openMenu.value = openMenu.value === menu ? null : menu;
};
</script>

<style scoped>
.sidebar {
  width: 240px;
  background-color: #f9f9f9;
  padding: 24px 20px;
  border-right: 1px solid #e0e0e0;
  height: calc(100vh - 64px);
  overflow-y: auto;
}

.logo {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 40px;
  color: #222;
}

ul {
  list-style: none;
  padding: 0;
  margin: 0;
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

.arrow {
  font-size: 12px;
  color: #666;
  margin-left: auto;
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
</style>
