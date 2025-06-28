<template>
  <div class="qna-container">
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

    <div class="board-container">
      <table class="board-table">
        <thead>
          <tr>
            <th class="qna-index">번호</th>
            <th class="qna-title">제목</th>
            <th class="qna-status">상태</th>
            <th class="qna-author">작성자</th>
            <th class="qna-date">등록일자</th>
          </tr>
        </thead>
        <tbody v-if="filteredQnas.length">
          <tr
            v-for="(qna, index) in paginatedQnas"
            :key="qna.id"
            class="qna-row"
            :class="{ deleted: isAdmin && qna.is_deleted }"
            @click="goToDetail(qna.id)"
          >
            <td class="qna-index">{{ calcQnaNumber(index) }}</td>
            <td class="qna-title">
              <template v-if="isAdmin && qna.is_deleted">
                <del v-html="formatTitle(qna.title)" />
              </template>
              <template v-else>
                <span v-html="formatTitle(qna.title)" />
              </template>
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
        <tbody v-else>
          <tr>
            <td colspan="5" class="empty-message">등록된 문의사항이 없습니다.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="bottom-actions">
      <div class="pagination">
        <button 
          @click="changePage(currentPage - 10)"
          :disabled="currentPage < 10"
          class="page-button">
          &lt;
        </button>
        <div class="page-numbers">
          <span 
            v-for="pageNum in visiblePageNumbers" 
            :key="pageNum"
            @click="changePage(pageNum - 1)"
            :class="{ 'active': currentPage === pageNum - 1 }"
            class="page-number">
            {{ pageNum }}
          </span>
        </div>
        <button 
          @click="changePage(currentPage + 10)"
          :disabled="currentPage + 10 >= totalPages"
          class="page-button">
          &gt;
        </button>
      </div>
    </div>
  </div>
</template>


<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
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
const currentPage = ref(0)
const pageSize = 10

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

const totalPages = computed(() => {
  return Math.max(1, Math.ceil(filteredQnas.value.length / pageSize));
});

const visiblePageNumbers = computed(() => {
  const total = totalPages.value;
  const startPage = Math.floor(currentPage.value / 10) * 10 + 1;
  const endPage = Math.min(startPage + 9, total);
  const pages = [];

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  if (pages.length === 0) pages.push(1);

  return pages;
});

const changePage = (page) => {
  if (page >= 0 && page < totalPages.value) {
    currentPage.value = page;
  }
};

const calcQnaNumber = (index) => {
  return filteredQnas.value.length - ((currentPage.value) * pageSize + index)
}

const paginatedQnas = computed(() => {
  const start = (currentPage.value) * pageSize
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
const goToDetail = (id) => router.push(`/support/qna/${id}`)
const formatTitle = (title) => title.replace(/\[(.*?)\]/g, '<strong>[$1]</strong>')
</script>

<style lang="scss" scoped>
.qna-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
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
  font-size: 14px;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  height: 38px;
  background: #ffffff;
  vertical-align: middle;
  box-sizing: border-box;
}

.qna-actions .ask-btn {
  padding: 6px 12px;
  background-color: #a6ce39;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
  height: 36px;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 0;

  &:hover {
    background-color: #94b933;
  }
}

.board-container {
  background: #fff;
  border-top: 1px solid #eee;
  border-bottom: 1px solid #eee;
  margin-bottom: 20px;
}

.board-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;

  th, td {
    padding: 15px;
    text-align: left;
    border-bottom: 1px solid #eee;
  }

  th {
    background-color: #f8f9fa;
    font-weight: 600;
    color: #495057;
  }

  th.qna-title {
    text-align: center;
  }

  td.qna-title {
    padding-left: 24px;
    padding-right: 24px;
    text-align: left;
  }

  tbody tr {
    cursor: pointer;
    transition: background-color 0.2s;
    background-color: #ffffff;

    &:hover {
      background-color: #f8f9fa;
    }

    &.deleted {
      opacity: 0.5;
    }
  }
}

.board-table .qna-index {
  text-align: center;
}

.qna-index {
  width: 60px;
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
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
  display: inline-block;
  color: white;
}

.status-badge.waiting {
  background-color: #ffc107;
  color: white;
  border: 1px solid #ffc107;
}

.status-badge.done {
  background-color: #4A90E2;
  color: white;
  border: 1px solid #4A90E2;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  margin-top: 20px;
}

.page-numbers {
  display: flex;
  gap: 4px;
}

.page-number {
  cursor: pointer;
  padding: 4px 8px;
  border: none;
  border-radius: 4px;
  color: #495057;
  font-size: 14px;
  font-weight: normal;
  background-color: transparent;

  &:hover {
    border: 1px solid #dee2e6;
  }

  &.active {
    background-color: transparent;
    font-weight: bold;
    color: #000000;
  }
}

.page-button {
  min-width: 32px;
  height: 32px;
  padding: 0 6px;
  border: none;
  background-color: transparent;
  color: #495057;
  font-size: 14px;
  cursor: pointer;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: normal;

  &:hover:not(:disabled) {
    background-color: transparent;
    border: 1px solid #dee2e6;
  }

  &:disabled {
    background-color: transparent;
    color: #adb5bd;
    cursor: default;
  }
  
}

.bottom-actions {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 20px;
  padding: 15px 0;
  position: relative;
}

.empty-message {
  text-align: center !important;
  padding: 40px 15px;
  color: #6c757d;
  font-size: 14px;
}
</style>
