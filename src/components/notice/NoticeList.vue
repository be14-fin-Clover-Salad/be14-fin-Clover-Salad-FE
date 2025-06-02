<template>
  <div class="notice-wrapper">
    <table class="notice-table">
      <thead>
        <tr>
          <th class="notice-index">번호</th>
          <th class="notice-title">제목</th>
          <th class="notice-author">작성자</th>
          <th class="notice-date">등록일자</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(notice, index) in pagedNotices"
          :key="notice.id"
          class="notice-row"
        >
          <td class="notice-index">
            {{ (currentPage - 1) * pageSize + index + 1 }}
          </td>
          <td
            class="notice-title"
            :class="{
              system: getEmployee(notice.employee_id)?.name === '관리자',
              read: notice.is_checked
            }"
            v-html="formatTitle(notice.title)"
          ></td>
          <td class="notice-author">
            {{ getEmployeeDisplayName(notice.employee_id) }}
          </td>
          <td class="notice-date">
            {{ notice.created_at.split('T')[0] }}
          </td>
        </tr>
      </tbody>
    </table>

    <Pagination
      :total="notices.length"
      :pageSize="pageSize"
      :currentPage="currentPage"
      @update:currentPage="currentPage = $event"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import Pagination from '@/components/notice/Pagination.vue'

const notices = ref([])
const employees = ref([])
const currentPage = ref(1)
const pageSize = 10

const pagedNotices = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return notices.value.slice(start, start + pageSize)
})

const getEmployee = (employee_id) => {
  return employees.value.find(emp => emp.id === employee_id) || {}
}

const getEmployeeDisplayName = (employee_id) => {
  const emp = getEmployee(employee_id)
  if (!emp.name) return '-'
  return emp.name === '관리자' ? '관리자' : `${emp.name} ${emp.level}`
}

// ✅ 대괄호 전체 강조
const formatTitle = (title) => {
  return title.replace(/(\[[^\]]+\])/g, '<strong>$1</strong>')
}

onMounted(async () => {
  const [noticeRes, employeeRes] = await Promise.all([
    fetch('http://localhost:3001/notices'),
    fetch('http://localhost:3001/employees')
  ])
  const noticeData = await noticeRes.json()
  const employeeData = await employeeRes.json()

  // 최신순 정렬
  notices.value = noticeData.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  employees.value = employeeData
})
</script>

<style scoped>
.notice-wrapper {
  max-width: 1200px;
  margin: 0 auto;
  font-size: 15px;
  font-weight: 500;
  color: #222;
}

.notice-table {
  width: 100%;
  border-collapse: collapse;
}

thead {
  background-color: #F0F7E4;
  font-size: 16px;
  font-weight: 600;
}

th,
td {
  padding: 12px 20px;
  vertical-align: middle;
  border-bottom: 1px solid #ddd;
}

.notice-index {
  text-align: center;
  width: 60px;
}

.notice-title {
  text-align: left;
}

.notice-author {
  text-align: center;
  width: 260px;
}

.notice-date {
  text-align: center;
  padding: 0 10px;
  width: 120px;
}

.system {
  color: red;
  font-weight: bold;
  font-size: inherit;
}

.read {
  color: #aaa;
}

.system.read {
  color: #aaa !important;
  font-weight: normal;
  font-size: inherit;
}

strong {
  font-weight: 900;
  font-size: 16px;
}
</style>
