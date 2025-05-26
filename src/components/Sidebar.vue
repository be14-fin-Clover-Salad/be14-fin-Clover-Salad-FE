<template>
  <aside class="sidebar">
    <div class="logo">salad</div>
    <nav>
      <ul>
        <li>대시보드</li>
        <li>
          실적
          <ul class="submenu">
            <li>사업별 실적 조회</li>
            <li>상품별 매출 조회</li>
            <li>영업부 매출 조회</li>
            <li>개인 실적 목표 관리</li>
            <li>팀 실적 목표 관리</li>
            <li>매출 관리</li>
          </ul>
        </li>
        <li>
          계약
          <ul class="submenu">
            <li>계약 관리</li>
            <li>계약서 양식 관리</li>
          </ul>
        </li>
        <li>
          고객
          <ul class="submenu">
            <li>기존 고객</li>
            <li>잠재 고객</li>
            <li>상담 관리</li>
          </ul>
        </li>
        <li>
          상품
          <ul class="submenu">
            <li>상품 관리</li>
          </ul>
        </li>
        <li>
          관리
          <ul class="submenu">
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
li {
  font-size: 14px;
  padding: 12px;
  cursor: pointer;
  color: #2f2f2f;
}
li:hover {
  background-color: #eff9e3;
  font-weight: 500;
}
.submenu {
  padding-left: 12px;
}
.submenu li {
  font-size: 13px;
  color: #444;
  padding: 8px 0;
}
</style>
