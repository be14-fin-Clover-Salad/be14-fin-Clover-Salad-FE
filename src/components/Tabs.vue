<template>
  <div class="tabs">
    <div class="tab active">고객 관리</div>
    <div class="tab">고객 등록</div>
    <div class="tab">상담 내역</div>
    <div class="tab">고객 통계</div>
  </div>
</template>

<style scoped>
.tabs {
  height: 48px;
  display: flex;
  align-items: center;
  background-color: #ffffff;
  padding-left: 24px;
  border-bottom: 1px solid #e0e0e0;
  gap: 24px;
}
.tab {
  font-size: 14px;
  padding: 12px 0;
  cursor: pointer;
  color: #666;
  border-bottom: 2px solid transparent;
}
.tab.active {
  color: #2f2f2f;
  border-color: #86b649;
  font-weight: 500;
}
</style>
