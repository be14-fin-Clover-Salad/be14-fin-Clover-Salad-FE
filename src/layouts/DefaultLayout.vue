<template>
  <div class="layout">
    <!-- Sidebar (좌측 고정) -->
    <aside class="sidebar-wrap">
      <Sidebar />
    </aside>

    <!-- Content (우측 전체) -->
    <div class="content-wrap">
      <!-- Header -->
      <header class="header-wrap">
        <Header />
      </header>

      <!-- Tabs -->
      <div class="tabs-wrap">
        <TopTabs v-if="$route.meta.showTabs" />
      </div>

      <!-- Main Contents -->
      <main class="main-wrap">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup>
import Sidebar from "../components/Sidebar.vue";
import Header from "../components/Header.vue";
import TopTabs from "../components/TopTabs.vue";
</script>

<style scoped>
.layout {
  display: flex;
  height: 100vh;
  overflow: hidden;
}

.sidebar-wrap {
  width: 280px;
  background-color: #f9f9f9;
  border-right: 1px solid #e0e0e0;
}

.content-wrap {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: white;
  height: 100vh;
}

.header-wrap {
  flex-shrink: 0;
  height: 64px;
  background-color: #d5eb97;
  border-bottom: 1px solid #ccc;
}

.tabs-wrap {
  flex-shrink: 0;
  height: 42px;
  background-color: #eef4d7;
  border-bottom: 1px solid #ccc;
}

.main-wrap {
  flex: 1;
  overflow-y: auto;
  padding: 32px 40px;
  background-color: #ffffff;
}
</style>
