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
        <button class="ask-btn" @click="goToCreatePage">문의하기</button>
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
          class="qna-row"
          :class="{ deleted: isAdmin && qna.is_deleted }"
        >
          <td class="qna-index">{{ calcQnaNumber(index) }}</td>
          <td class="qna-title">
            <router-link :to="`/support/qna/${qna.id}`" class="qna-link">
              <template v-if="isAdmin && qna.is_deleted">
                <del v-html="formatTitle(qna.title)" />
              </template>
              <template v-else>
                <span v-html="formatTitle(qna.title)" />
              </template>
            </router-link>
          </td>
          <td class="qna-status">
            <span :class="['status-badge', qna.answerStatus === '대기' ? 'waiting' : 'done']">
              {{ qna.answerStatus }}
            </span>
          </td>
          <td class="qna-author">
            {{ getEmployeeDisplayName(qna.writerId) }}
          </td>
          <td class="qna-date">{{ formatDate(qna.createdAt) }}</td>
        </tr>
      </tbody>
    </table>

    <div class="qna-bottom-actions">
      <Pagination
        :total="filteredQnas.length"
        :pageSize="pageSize"
        :currentPage="currentPage"
        @update:currentPage="currentPage = $event"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import Pagination from '@/components/common/Pagination.vue'
import api from '@/api/auth'

const router = useRouter()
const authStore = useAuthStore()
const loginUser = computed(() => authStore.userInfo || null)
const loginUserId = computed(() => authStore.userInfo?.id || null)
const accessToken = computed(() => authStore.accessToken || '')
const isAdmin = computed(() =>
  loginUser.value?.roles?.includes('ROLE_ADMIN') || loginUser.value?.name === '관리자'
)

const qnas = ref([])
const employees = ref([])
const selectedStatus = ref('')
const currentPage = ref(1)
const pageSize = 5

async function fetchQnaList() {
  if (!loginUserId.value) return
  try {
    const [empRes, qnaRes] = await Promise.all([
      api.post('/employee/search', {}, {
        headers: { Authorization: `Bearer ${accessToken.value}` }
      }),
      api.get(
        isAdmin.value
          ? '/support/qna'
          : `/support/qna?employeeId=${loginUserId.value}`,
        { headers: { Authorization: `Bearer ${accessToken.value}` } }
      )
    ])
    employees.value = empRes.data
    qnas.value = qnaRes.data

  } catch (err) {
    console.error('QnA API 오류:', err)
  }
}

watch(loginUserId, (newId) => {
  if (newId) fetchQnaList()
}, { immediate: true })

const filteredQnas = computed(() => {
  const base = selectedStatus.value
    ? qnas.value.filter(q => q.answerStatus === selectedStatus.value)
    : qnas.value
  return [...base].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
})

const calcQnaNumber = (index) => {
  return filteredQnas.value.length - ((currentPage.value - 1) * pageSize + index)
}

const paginatedQnas = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return filteredQnas.value.slice(start, start + pageSize)
})

const getEmployeeDisplayName = (id) => {
  const emp = employees.value.find(e => Number(e.id) === Number(id))
  if (!emp) return '-'
  let result = emp.name || ''
  if (emp.level) result += ' ' + emp.level
  if (emp.departmentName) result += ' (' + emp.departmentName + ')'
  return result
}

const formatDate = (str) => str?.split('T')[0] || '-'
const goToCreatePage = () => router.push('/support/qna/create')
const formatTitle = (title) => title.replace(/\[(.*?)\]/g, '<strong>[$1]</strong>')
</script>

<style scoped>
.qna-wrapper {
  max-width: 1500px;
  margin: 0 auto;
  font-size: 15px;
  font-weight: 500;
  color: #222;
}
.top-area {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
  gap: 16px;
}
.filter-area {
  display: flex;
  align-items: center;
  margin-bottom: 0;
}
.filter-area select {
  padding: 8px 12px;
  min-width: 120px;
  font-size: 15px;
  border: 1px solid #ccc;
  border-radius: 4px;
  height: 38px;
  background: #fafcf5;
  vertical-align: middle;
  box-sizing: border-box;
}

.qna-actions .ask-btn {
  background: #86b649;
  color: #fff;
  font-size: 15px;
  font-weight: 600;
  padding: 9px 28px;
  border: none;
  border-radius: 7px;
  box-shadow: 0 1px 6px 0 rgba(80, 120, 80, 0.05);
  transition: background 0.18s, box-shadow 0.16s, transform 0.13s;
  outline: none;
  cursor: pointer;
  letter-spacing: 0.1px;
  height: 40px;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 0;
}
.qna-actions .ask-btn:hover {
  background: #419e35;
  color: #fff;
  box-shadow: 0 2px 8px 0 rgba(76, 175, 80, 0.15);
  transform: translateY(-1px) scale(1.02);
}

.qna-bottom-actions {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}
.qna-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 0;
  table-layout: fixed;
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
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  height: 38px;
}
.qna-index {
  text-align: center;
  width: 60px;
  font-size: 16px;
}
.qna-status {
  text-align: center;
  width: 100px;
}
.qna-author {
  text-align: center;
  width: 220px;
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
  font-size: 0.95rem;
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
