<template>
  <div class="layout">
    <!-- 사이드바 -->
    <Sidebar />

    <!-- 메인 영역 -->
    <div class="main">
      <!-- 헤더 -->
      <Header />

      <!-- 상단 탭 -->
      <Tabs />

      <!-- 페이지 콘텐츠 -->
      <main class="content">
        <h1>고객 관리</h1>
        <!-- 실제 콘텐츠는 각 페이지마다 바뀔 수 있음 -->
      </main>
    </div>
  </div>
</template>

<script setup>
import Sidebar from "@/components/Sidebar.vue";
import Header from "@/components/Header.vue";
import Tabs from "@/components/Tabs.vue";
</script>

<style scoped>
.layout {
  display: flex;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  font-family: "Pretendard", sans-serif;
}

.main {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.content {
  flex: 1;
  padding: 32px 24px;
  background-color: #ffffff;
  overflow-y: auto;
}

.content h1 {
  font-size: 24px;
  font-weight: bold;
  color: #2f2f2f;
}
</style>
