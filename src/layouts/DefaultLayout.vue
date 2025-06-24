<template>
  <div class="layout-wrapper">
    <HeaderBar />

    <div class="body-wrapper">
      <Sidebar />

      <div class="main-content">
        <TopTabs />
        <div class="breadcrumb-wrapper">
          <Breadcrumb />
        </div>
        <main class="view-area">
          <router-view />
        </main>
      </div>
    </div>
  </div>
</template>

<script setup>
import Sidebar from "@/components/Sidebar.vue";
import HeaderBar from "@/components/Header.vue";
import TopTabs from "@/components/TopTabs.vue";
import Breadcrumb from "@/components/Breadcrumb.vue";
</script>

<style scoped>
.layout-wrapper {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
}

.body-wrapper {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.main-content {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.breadcrumb-wrapper {
  padding: 16px 32px;
  background-color: #fdfdfd;
  border-bottom: 1px solid #eee;
  flex-shrink: 0;
}

.view-area {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  background-color: #fff;
}

/* 인쇄 시에 레이아웃 숨기기 위한 설정 */
@media print {
  .layout-wrapper > :first-child,
  .body-wrapper > :first-child,
  .main-content > :nth-child(1),
  .main-content > :nth-child(2),
  .no-print {
    display: none !important;
  }
  
  /* body 스타일 */
  body {
    margin: 0 !important;
    padding: 0 !important;
    background: white !important;
  }
  
  /* 레이아웃 컨테이너 스타일 */
  .layout-wrapper {
    display: block !important;
    height: auto !important;
    overflow: visible !important;
  }
  
  .body-wrapper {
    display: block !important;
    overflow: visible !important;
  }
  
  .main-content {
    display: block !important;
    overflow: visible !important;
  }
  
  .view-area {
    padding: 0 !important;
    overflow: visible !important;
    background: white !important;
  }
}
</style>
