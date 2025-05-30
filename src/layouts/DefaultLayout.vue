<template>
  <div class="layout-wrapper">
    <Sidebar />
    <div class="main-content">
      <HeaderBar />
      <TopTabs />
      <div class="breadcrumb-wrapper">
        <Breadcrumb />
      </div>
      <main class="view-area">
        <router-view />
      </main>
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
  height: 100vh;
  overflow: hidden;
}

.main-content {
  flex-grow: 1;
  margin-left: 280px; /* Sidebar width */
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
}

.breadcrumb-wrapper {
  padding: 12px 32px 0;
  background-color: #fdfdfd;
  border-bottom: 1px solid #eee;
  flex-shrink: 0;
}

.view-area {
  flex: 1;
  padding: 24px 32px;
  overflow-y: auto;
  background-color: #fff;
}
</style>
