<template>
  <div class="table-box">
    <div class="table-header">
      <div class="row-count">총 {{ consults.length }}건</div>
    </div>

    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>데이터를 불러오는 중...</p>
    </div>

    <table v-else>
      <thead>
        <tr>
          <th>#</th>
          <th>상담일시</th>
          <th>상담 내용</th>
          <th>피드백 점수</th>
          <th>비고</th>
          <th>상태</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(consult, index) in consults"
          :key="consult.id"
          class="clickable-row"
          @click="handleRowClick(consult)"
        >
          <td>{{ index + 1 }}</td>
          <td>{{ formatDate(consult.consultAt) }}</td>
          <td class="content-cell">{{ consult.content || "-" }}</td>
          <td>
            <span v-if="consult.feedbackScore" class="feedback-score">
              {{ consult.feedbackScore.toFixed(1) }}
            </span>
            <span v-else class="no-score">-</span>
          </td>
          <td>{{ consult.etc || "-" }}</td>
          <td>
            <span
              :class="[
                'status-badge',
                consult.isDeleted ? 'deleted' : 'active',
              ]"
            >
              {{ consult.isDeleted ? "삭제됨" : "활성" }}
            </span>
          </td>
        </tr>
        <tr v-if="!consults || consults.length === 0">
          <td colspan="6" style="text-align: center; color: #aaa">
            조회된 상담 내역이 없습니다.
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref } from "vue";

const consults = ref([]);
const loading = ref(false);

const emit = defineEmits(["row-click"]);

const loadData = (data) => {
  consults.value = data || [];
};

const setLoading = (isLoading) => {
  loading.value = isLoading;
};

const formatDate = (dateString) => {
  if (!dateString) return "-";
  try {
    const date = new Date(dateString);
    return date.toLocaleString("ko-KR");
  } catch (error) {
    return dateString;
  }
};

const handleRowClick = (consult) => {
  emit("row-click", consult);
};

defineExpose({ loadData, setLoading });
</script>

<style scoped>
.table-box {
  background-color: white;
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 16px;
}

.table-header {
  margin-bottom: 12px;
}

.row-count {
  font-size: 14px;
  color: #666;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  color: #666;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #86b649;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

th,
td {
  padding: 12px 8px;
  border-bottom: 1px solid #ddd;
  text-align: left;
}

th {
  background-color: #f8f8f8;
  font-weight: 600;
}

.clickable-row {
  cursor: pointer;
}

.clickable-row:hover {
  background-color: #f6f6f6;
}

.content-cell {
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.feedback-score {
  background-color: #e8f5e8;
  color: #2e7d32;
  padding: 4px 8px;
  border-radius: 4px;
  font-weight: 500;
}

.no-score {
  color: #999;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.status-badge.active {
  background-color: #e8f5e8;
  color: #2e7d32;
}

.status-badge.deleted {
  background-color: #ffebee;
  color: #c62828;
}
</style>
