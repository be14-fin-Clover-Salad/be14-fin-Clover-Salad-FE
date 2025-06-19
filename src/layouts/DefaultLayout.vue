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
</style>
