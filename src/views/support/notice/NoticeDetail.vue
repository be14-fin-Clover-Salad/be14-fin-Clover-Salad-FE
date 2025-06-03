<template>
  <div class="notice-detail-layout" v-if="notice && writer">
    <div class="notice-content">
      <div class="breadcrumb">공지사항 &gt; 상세보기</div>
      <h1 class="notice-title">{{ notice.title }}</h1>
      <div class="notice-info">
        <span>작성자: {{ writer.name }}</span>
        <span>등록일자: {{ formatDate(notice.created_at) }}</span>
      </div>
      <div class="notice-box" v-html="notice.content"></div>
      <div class="btn-wrap">
        <button class="check-btn" :disabled="alreadyChecked" @click="confirmCheck">
          ✅ 확인하기
        </button>
      </div>
    </div>

    <div class="notice-sidebar">
      <h3>확인자 목록</h3>
      <input
        type="text"
        v-model="searchKeyword"
        placeholder="검색"
        class="search-input"
      />
      <ul class="checklist">
        <li
          v-for="entry in filteredCheckList"
          :key="entry.employee_id"
          :class="{ checked: entry.is_checked }"
        >
          <span>{{ formatEmployeeLabel(entry.employee_id) }}</span>
          <span>{{ entry.is_checked ? "✅" : "❌" }}</span>
        </li>
      </ul>
    </div>
  </div>
  <div v-else class="not-allowed">해당 공지에 접근할 수 없습니다.</div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';

const route = useRoute();
const noticeId = Number(route.params.id);
const loginUserId = 2;

const notice = ref(null);
const writer = ref(null);
const employees = ref([]);
const departments = ref([]);
const checkList = ref([]);
const searchKeyword = ref("");

// 🔍 포맷: "영업1팀 홍길동 팀장"
const formatEmployeeLabel = (id) => {
  const emp = employees.value.find(e => Number(e.id) === Number(id));
  if (!emp) return "-";
  const dept = departments.value.find(d => Number(d.id) === Number(emp.department_id));
  const deptName = dept?.name || '';
  return `${deptName} ${emp.name} ${emp.level}`;
};

const alreadyChecked = computed(() => {
  return checkList.value.find(e => Number(e.employee_id) === loginUserId)?.is_checked;
});

const filteredCheckList = computed(() => {
  const keyword = searchKeyword.value.trim().toLowerCase();
  return checkList.value.filter(entry =>
    formatEmployeeLabel(entry.employee_id).toLowerCase().includes(keyword)
  );
});

const formatDate = (dateStr) => dateStr?.split('T')[0];

const fetchData = async () => {
  try {
    const [noticeRes, empRes, deptRes, empNoticeRes] = await Promise.all([
      axios.get(`http://localhost:3001/notices/${noticeId}`),
      axios.get(`http://localhost:3001/employees`),
      axios.get(`http://localhost:3001/departments`),
      axios.get(`http://localhost:3001/employee_notice?notice_id=${noticeId}`)
    ]);

    notice.value = noticeRes.data;
    employees.value = empRes.data;
    departments.value = deptRes.data;
    writer.value = employees.value.find(e => Number(e.id) === Number(notice.value.employee_id));
    checkList.value = empNoticeRes.data;

    console.log("📌 공지:", notice.value);
    console.log("👤 작성자:", writer.value);
    console.log("👥 직원 목록:", employees.value);
    console.log("🏢 부서 목록:", departments.value);
    console.log("✅ 확인자 목록:", checkList.value);
  } catch (e) {
    console.error("❌ fetchData 실패:", e);
  }
};

const confirmCheck = async () => {
  const entry = checkList.value.find(e => Number(e.employee_id) === loginUserId);
  if (!entry || entry.is_checked) return;

  try {
    await axios.patch(`http://localhost:3001/employee_notice/${entry.id}`, {
      is_checked: true
    });
    entry.is_checked = true;
    console.log("✅ 확인 완료:", entry);
  } catch (e) {
    console.error("❌ 확인 PATCH 실패:", e);
  }
};

onMounted(fetchData);
</script>

<style scoped>
.notice-detail-layout {
  display: flex;
  gap: 2rem;
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}
.notice-content {
  flex: 2;
}
.notice-sidebar {
  width: 220px;
  background: #f9f9f9;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 1rem;
  max-height: 500px;
  overflow-y: auto;
}
.breadcrumb {
  font-size: 0.9rem;
  color: #888;
  margin-bottom: 1.2rem;
}
.notice-title {
  font-size: 1.6rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
}
.notice-info {
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 1.5rem;
}
.notice-box {
  padding: 1.5rem;
  border: 1px solid #ddd;
  background-color: #f9f9f9;
  border-radius: 8px;
  white-space: pre-wrap;
  line-height: 1.6;
  margin-bottom: 2rem;
}
.btn-wrap {
  display: flex;
  justify-content: center;
}
.check-btn {
  padding: 0.6rem 1.2rem;
  background-color: #00a86b;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
}
.check-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}
.search-input {
  width: 90%;
  padding: 0.4rem 0.6rem;
  margin-bottom: 0.8rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 0.9rem;
}
.checklist {
  list-style: none;
  padding: 0;
  margin: 0;
}
.checklist li {
  display: flex;
  justify-content: space-between;
  padding: 0.3rem 0;
  border-bottom: 1px solid #eee;
  font-size: 0.85rem;
}
.checklist li.checked {
  background-color: #eee;
  color: #888;
  font-style: italic;
}
.not-allowed {
  max-width: 960px;
  margin: 3rem auto;
  font-size: 1.2rem;
  text-align: center;
  color: #a00;
}
</style>
