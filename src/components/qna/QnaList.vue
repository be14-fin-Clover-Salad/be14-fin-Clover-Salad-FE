<template>
  <div class="qna-list">
    <div class="qna-header">
      <select v-model="selectedStatus">
        <option value="">모든 상태</option>
        <option value="완료">완료</option>
        <option value="대기">대기</option>
      </select>
      <button @click="goToCreatePage">문의하기</button>
    </div>

    <table class="qna-table">
      <thead>
        <tr>
          <th>번호</th>
          <th>제목</th>
          <th>상태</th>
          <th>등록일자</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(qna, index) in filteredQnas"
          :key="qna.id"
        >
          <td>{{ index + 1 }}</td>
          <td>{{ qna.title }}</td>
          <td>
            <span :class="['status-badge', qna.status === '대기' ? 'waiting' : 'done']">
              {{ qna.status }}
            </span>
          </td>
          <td>{{ qna.created_at }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
// TODO: 실제 API 호출로 대체
const qnas = ref([])

const selectedStatus = ref('')

onMounted(async () => {
  // 예시 JSON 로딩. 실제로는 axios나 fetch로 대체
  const response = await fetch('/db.json')
  const data = await response.json()
  qnas.value = data.qnas
})

const filteredQnas = computed(() =>
  qnas.value.filter(qna => !selectedStatus.value || qna.status === selectedStatus.value)
)

const goToCreatePage = () => {
  // TODO: 문의 작성 페이지로 라우팅
}
</script>

<style scoped>
.qna-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.qna-table {
  width: 100%;
  border-collapse: collapse;
}

.qna-table th,
.qna-table td {
  border: 1px solid #ddd;
  padding: 0.75rem;
  text-align: center;
}

.status-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 10px;
  font-size: 0.9rem;
  display: inline-block;
}

.status-badge.waiting {
  background-color: #fce4e4;
  color: #e53935;
}

.status-badge.done {
  background-color: #e8f5e9;
  color: #43a047;
}
</style>
