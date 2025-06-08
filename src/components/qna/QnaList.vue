<template>
  <div class="qna-wrapper" v-if="filteredQnas.length">
    <div class="top-area">
      <div class="filter-area">
        <select v-model="selectedStatus">
          <option value="">모든 상태</option>
          <option value="완료">완료</option>
          <option value="대기">대기</option>
        </select>
      </div>
      <div class="qna-actions" v-if="!isAdmin">
        <button @click="goToCreatePage">문의하기</button>
      </div>
    </div>

    <table class="qna-table">
      <thead>
        <tr>
          <th class="qna-index">번호</th>
          <th class="qna-title">제목</th>
          <th class="qna-status">상태</th>
          <th class="qna-author">작성자</th>
          <th class="qna-date">등록일자</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(qna, index) in paginatedQnas"
          :key="qna.id"
          :class="{ deleted: qna.is_deleted }"
        >
          <td class="qna-index">{{ (currentPage - 1) * pageSize + index + 1 }}</td>
          <td class="qna-title">
            <router-link :to="`/support/qna/${qna.id}`" class="qna-link">
              <del v-if="isAdmin && qna.is_deleted">
                <span v-html="formatTitle(qna.title)" />
              </del>
              <span v-else v-html="formatTitle(qna.title)" />
            </router-link>
          </td>
          <td class="qna-status">
            <span :class="['status-badge', qna.status === '대기' ? 'waiting' : 'done']">
              {{ qna.status }}
            </span>
          </td>
          <td class="qna-author">{{ getEmployeeDisplayName(qna.employee_id) }}</td>
          <td class="qna-date">{{ formatDate(qna.created_at) }}</td>
        </tr>
      </tbody>
    </table>

    <Pagination
      :total="filteredQnas.length"
      :pageSize="pageSize"
      :currentPage="currentPage"
      @update:currentPage="currentPage = $event"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Pagination from '@/components/common/Pagination.vue'

const router = useRouter()
const qnas = ref([])
const employees = ref([])
const selectedStatus = ref('')
const currentPage = ref(1)
const pageSize = 5
const loginUserId = 8

const loginUser = computed(() =>
  employees.value.find(emp => Number(emp.id) === Number(loginUserId)) || {}
)

const isAdmin = computed(() => loginUser.value.name === '관리자')

onMounted(async () => {
  const [qnaRes, empRes] = await Promise.all([
    fetch('http://localhost:3001/qnas'),
    fetch('http://localhost:3001/employees')
  ])
  const qnaData = await qnaRes.json()
  const empData = await empRes.json()
  employees.value = empData

  qnas.value = isAdmin.value
    ? qnaData
    : qnaData.filter(q => Number(q.employee_id) === Number(loginUserId) && !q.is_deleted)
})

const filteredQnas = computed(() => {
  const base = selectedStatus.value
    ? qnas.value.filter(q => q.status === selectedStatus.value)
    : qnas.value
  return [...base].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
})

const paginatedQnas = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return filteredQnas.value.slice(start, start + pageSize)
})

const formatDate = (str) => str?.split('T')[0] || '-'

const goToCreatePage = () => {
  router.push('/support/qna/create')
}

const getEmployee = (id) => {
  return employees.value.find(e => Number(e.id) === Number(id)) || null
}

const getEmployeeDisplayName = (id) => {
  const emp = getEmployee(id)
  return emp?.name === '관리자' ? '관리자' : `${emp?.name || '-'} ${emp?.level || ''}`
}

const formatTitle = (title) => {
  return title.replace(/\[(.*?)\]/g, '<strong>[$1]</strong>')
}
</script>


<style scoped>
.qna-wrapper {
  max-width: 1200px;
  margin: 0 auto;
  font-size: 14px;
  font-weight: 500;
  color: #222;
}

.top-area {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 14px;
}

.filter-area select {
  padding: 8px 12px;
  min-width: 120px;
  font-size: 14px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.qna-actions button {
  background-color: #e7f3d9;
  color: #222;
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 600;
  border: 1px solid #b8dca6;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}
.qna-actions button:hover {
  background-color: #d1e9c2;
}

.qna-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 0;
}

.qna-table thead {
  background-color: #f0f7e4;
  font-weight: 600;
}

.qna-table th,
.qna-table td {
  padding: 12px 20px;
  border-bottom: 1px solid #ddd;
  vertical-align: middle;
}

.qna-index {
  text-align: center;
  width: 60px;
}
.qna-title {
  text-align: left;
}
.qna-status {
  text-align: center;
  width: 100px;
}
.qna-author {
  text-align: center;
  width: 180px;
}
.qna-date {
  text-align: center;
  width: 120px;
}

.qna-link {
  text-decoration: none;
  color: inherit;
}
.qna-link:hover {
  text-decoration: underline;
  color: #3a6b1d;
}

.status-badge {
  padding: 0.2rem 0.7rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: bold;
  display: inline-block;
}
.status-badge.waiting {
  background-color: #fff0f0;
  color: #e53935;
  border: 1px solid #e53935;
}
.status-badge.done {
  background-color: #e6f4ea;
  color: #43a047;
  border: 1px solid #43a047;
}
.deleted {
  opacity: 0.5;
}
</style>
