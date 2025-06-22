<template>
  <div class="access-log-container">
    <!-- <h2 class="page-title">접속 로그 관리</h2> -->

    <!-- 검색 필터 -->
    <div class="search-bar">
      <input v-model="searchUser" class="search-input" placeholder="이메일/사번 검색" />
      <input type="date" v-model="searchDate" class="search-date" />
      <button @click="filterLogs" class="search-btn">검색</button>
      <button @click="downloadCsv" class="download-btn">로그 다운로드</button>
    </div>

    <!-- 로그 테이블 -->
    <table class="access-log-table">
      <thead>
        <tr>
          <th>날짜/시간</th>
          <th>사용자</th>
          <th>IP</th>
          <th>Method</th>
          <th>URI</th>
          <th>User-Agent</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="log in displayedLogs" :key="log.time + log.user + log.uri + log.method">
          <td>{{ log.time }}</td>
          <td>{{ log.user }}</td>
          <td>{{ log.ip }}</td>
          <td>
            <span :class="['method-badge', log.method]">{{ log.method }}</span>
          </td>
          <td>{{ log.uri }}</td>
          <td class="ua-cell">{{ log.userAgent }}</td>
        </tr>
        <tr v-if="displayedLogs.length === 0">
          <td colspan="6" style="text-align:center; color:#888;">조회된 로그가 없습니다.</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'

const logs = ref([])
const searchUser = ref('')
const searchDate = ref('')
const displayedLogs = ref([])

onMounted(async () => {
  const res = await axios.get('/api/log/access')
  logs.value = res.data
  displayedLogs.value = logs.value // 최초 전체 표시
})

// 필터 기능
function filterLogs() {
  let result = logs.value
  if (searchUser.value) {
    result = result.filter(
      l => l.user.includes(searchUser.value)
        || l.userAgent.includes(searchUser.value)
    )
  }
  if (searchDate.value) {
    result = result.filter(
      l => l.time.startsWith(searchDate.value)
    )
  }
  displayedLogs.value = result
}

// CSV 다운로드 (간단 버전)
function downloadCsv() {
  let csv = '날짜/시간,사용자,IP,Method,URI,User-Agent\n'
  for (const log of displayedLogs.value) {
    csv += [
      log.time, log.user, log.ip, log.method, log.uri, `"${log.userAgent}"`
    ].join(',') + '\n'
  }
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'access-log.csv'
  a.click()
  window.URL.revokeObjectURL(url)
}
</script>

<style scoped>
.access-log-container {
  max-width: 1200px;
  margin: 40px auto 0;
  font-family: 'Noto Sans KR', sans-serif;
}

.page-title {
  font-size: 26px;
  font-weight: 700;
  margin-bottom: 24px;
}

.search-bar {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-bottom: 20px;
}

.search-input,
.search-date {
  border: 1px solid #bbb;
  padding: 8px 14px;
  border-radius: 6px;
  font-size: 15px;
  min-width: 150px;
}

.search-btn, .download-btn {
  padding: 8px 18px;
  border-radius: 6px;
  background: #2962ff;
  color: #fff;
  border: none;
  cursor: pointer;
  font-weight: 500;
  font-size: 15px;
}
.download-btn {
  background: #b71c1c;
}
.download-btn:hover {
  background: #c62828;
}
.search-btn:hover {
  background: #0039cb;
}

.access-log-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 15px;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 1px 8px rgba(0,0,0,0.07);
  overflow: hidden;
}

.access-log-table th, .access-log-table td {
  border: 1px solid #e1e1e1;
  padding: 11px 12px;
  text-align: center;
  vertical-align: middle;
}
.access-log-table th {
  background: #f7f7f7;
  font-weight: 700;
}
.ua-cell {
  text-align: left;
  font-size: 13px;
  color: #666;
}

.method-badge {
  display: inline-block;
  padding: 2px 9px;
  border-radius: 12px;
  color: #fff;
  font-size: 13px;
  font-weight: 600;
}
.method-badge.GET { background: #42a5f5; }
.method-badge.POST { background: #43a047; }
.method-badge.PUT { background: #ffa726; }
.method-badge.DELETE { background: #e53935; }
</style>
