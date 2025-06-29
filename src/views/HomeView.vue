<template>
    <div>
    <EmployeeDashboard v-if="!isAdminOrTeamLead" />
    <TeamOrAdminDashboard v-else />
  </div>
</template>

<script setup>
  import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import EmployeeDashboard from '@/views/dashboard/EmployeeDashboard.vue'
import TeamOrAdminDashboard from '@/views/salesDashboard/SalesDashboardLayout.vue' 
const authStore = useAuthStore()
const userLevel = computed(() => authStore.userLevel)
const isAdminOrTeamLead = computed(() => userLevel.value === '관리자' || userLevel.value === '팀장')

</script>

<style scoped>
.home-page {
  padding: 32px;
  font-size: 16px;
}
</style>
