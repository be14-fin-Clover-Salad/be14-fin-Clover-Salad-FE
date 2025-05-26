<script setup>
import { ref } from "vue";

const openMenu = ref(null);
const activeSubmenu = ref("");

const toggleMenu = (menuName) => {
  openMenu.value = openMenu.value === menuName ? null : menuName;
};

const activate = (submenu) => {
  activeSubmenu.value = submenu;
};
</script>

<template>
  <aside class="sidebar">
    <div class="logo">salad</div>
    <nav>
      <ul>
        <li>
          <div @click="toggleMenu('dashboard')" class="menu-title">
            대시보드
          </div>
          <ul v-if="openMenu === 'dashboard'" class="submenu">
            <li
              :class="{ active: activeSubmenu === '사원별 실적 조회' }"
              @click="activate('사원별 실적 조회')"
            >
              사원별 실적 조회
            </li>
            <li
              :class="{ active: activeSubmenu === '상품별 매출 조회' }"
              @click="activate('상품별 매출 조회')"
            >
              상품별 매출 조회
            </li>
            <li
              :class="{ active: activeSubmenu === '영업부 매출 조회' }"
              @click="activate('영업부 매출 조회')"
            >
              영업부 매출 조회
            </li>
          </ul>
        </li>

        <li>
          <div @click="toggleMenu('performance')" class="menu-title">실적</div>
          <ul v-if="openMenu === 'performance'" class="submenu">
            <li
              :class="{ active: activeSubmenu === '개인 실적 목표' }"
              @click="activate('개인 실적 목표')"
            >
              개인 실적 목표
            </li>
            <li
              :class="{ active: activeSubmenu === '팀 실적 목표' }"
              @click="activate('팀 실적 목표')"
            >
              팀 실적 목표
            </li>
            <li
              :class="{ active: activeSubmenu === '매출 관리' }"
              @click="activate('매출 관리')"
            >
              매출 관리
            </li>
          </ul>
        </li>

        <li>
          <div @click="toggleMenu('contract')" class="menu-title">계약</div>
          <ul v-if="openMenu === 'contract'" class="submenu">
            <li
              :class="{ active: activeSubmenu === '계약 관리' }"
              @click="activate('계약 관리')"
            >
              계약 관리
            </li>
            <li
              :class="{ active: activeSubmenu === '계약서 관리' }"
              @click="activate('계약서 관리')"
            >
              계약서 관리
            </li>
          </ul>
        </li>

        <li>
          <div @click="toggleMenu('customer')" class="menu-title">고객</div>
          <ul v-if="openMenu === 'customer'" class="submenu">
            <li
              :class="{ active: activeSubmenu === '기존 고객' }"
              @click="activate('기존 고객')"
            >
              기존 고객
            </li>
            <li
              :class="{ active: activeSubmenu === '잠재 고객' }"
              @click="activate('잠재 고객')"
            >
              잠재 고객
            </li>
            <li
              :class="{ active: activeSubmenu === '상담 관리' }"
              @click="activate('상담 관리')"
            >
              상담 관리
            </li>
          </ul>
        </li>

        <li>
          <div @click="toggleMenu('product')" class="menu-title">상품</div>
          <ul v-if="openMenu === 'product'" class="submenu">
            <li
              :class="{ active: activeSubmenu === '상품 관리' }"
              @click="activate('상품 관리')"
            >
              상품 관리
            </li>
          </ul>
        </li>

        <li>
          <div @click="toggleMenu('admin')" class="menu-title">관리</div>
          <ul v-if="openMenu === 'admin'" class="submenu">
            <li
              :class="{ active: activeSubmenu === '결제 관리' }"
              @click="activate('결제 관리')"
            >
              결제 관리
            </li>
            <li
              :class="{ active: activeSubmenu === '사원 조회' }"
              @click="activate('사원 조회')"
            >
              사원 조회
            </li>
            <li
              :class="{ active: activeSubmenu === '계약서 양식 관리' }"
              @click="activate('계약서 양식 관리')"
            >
              계약서 양식 관리
            </li>
            <li
              :class="{ active: activeSubmenu === '알림 관리' }"
              @click="activate('알림 관리')"
            >
              알림 관리
            </li>
            <li
              :class="{ active: activeSubmenu === '로그 관리' }"
              @click="activate('로그 관리')"
            >
              로그 관리
            </li>
          </ul>
        </li>
      </ul>
    </nav>
  </aside>
</template>

<style scoped>
.sidebar {
  width: 240px;
  background-color: #f9f9f9;
  padding: 24px 20px;
  border-right: 1px solid #e0e0e0;
}
.logo {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 32px;
}
ul {
  list-style: none;
  padding: 0;
  margin: 0;
}
.menu-title {
  font-size: 14px;
  padding: 12px;
  cursor: pointer;
  color: #2f2f2f;
  border-radius: 6px;
}
.menu-title:hover {
  background-color: #eff9e3;
  font-weight: 500;
}
.submenu {
  padding-left: 12px;
  padding-bottom: 8px;
}
.submenu li {
  font-size: 13px;
  color: #444;
  padding: 12px;
  border-top: 1px solid #eee;
  cursor: pointer;
  border-radius: 4px;
}
.submenu li:hover {
  background-color: #f5f5f5;
}
.submenu li.active {
  background-color: #d5eb97;
  font-weight: bold;
  color: #2f2f2f;
}
</style>
