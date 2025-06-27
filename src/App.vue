<template>
  <component :is="layoutComponent">
    <router-view />
  </component>
</template>

<script setup>
import { computed, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import DefaultLayout from './layouts/DefaultLayout.vue'

import { useAuthStore } from './stores/auth'
import { useNotificationStore } from './stores/notification'

const route = useRoute()
const authStore = useAuthStore()
const layoutComponent = computed(() => {
  return route.meta.layout === 'none' ? 'div' : DefaultLayout
})

onMounted(() => {
  const notificationStore = useNotificationStore()
  if (authStore.userInfo && !notificationStore.connected) {
    notificationStore.connectSse()
  }
})

watch (
  () => authStore.userInfo,
  (newVal) => {
    const notificationStore = useNotificationStore()
    if (newVal && !notificationStore.connected)  {
      notificationStore.connectSse()
    }
  },
  { immediate: true }
)

</script>

<style>
html,
body,
#app {
  margin: 0;
  padding: 0;
  height: 100%;
}
</style>
