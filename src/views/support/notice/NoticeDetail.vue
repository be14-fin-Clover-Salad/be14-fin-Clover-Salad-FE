<template>
  <div class="notice-detail-layout" v-if="notice && writer && (!notice.is_deleted || isAdmin)">
    <div class="notice-content">
      <button class="back-btn" @click="goBackToList">
        <span class="arrow"></span>목록
      </button>

      <!-- 삭제된 공지 안내 배너 -->
      <div v-if="notice.is_deleted" class="deleted-banner">
        🗑 이 공지는 삭제된 상태입니다.
      </div>

      <h1 class="notice-title">{{ notice.title }}</h1>
      <div class="notice-info">
        <span>작성자: {{ formatEmployeeLabel(writer.id) }}</span>
        <span>등록일자: {{ formatDate(notice.created_at) }}</span>
      </div>
      <div class="notice-box" v-html="notice.content"></div>

      <div class="btn-wrap">
        <button v-if="canEditOrDelete && !notice.is_deleted" class="btn edit-btn" @click="goEditPage">수정</button>
        <button v-if="canEditOrDelete && !notice.is_deleted" class="btn delete-btn" @click="deleteNotice">삭제</button>
        <button
          v-if="!isAdmin && alreadyChecked !== undefined"
          class="btn check-btn"
          :disabled="alreadyChecked"
          @click="confirmCheck"
        >
          {{ alreadyChecked ? "✔ 확인 완료" : "✅ 확인하기" }}
        </button>
      </div>
    </div>

    <div class="notice-sidebar">
      <h3>확인자 목록</h3>
      <input type="text" v-model="searchKeyword" placeholder="검색" class="search-input" />
      <ul class="checklist">
        <li
          v-for="entry in filteredCheckList"
          :key="entry.employee_id"
          :class="{
            checked: entry.is_checked,
            currentUser: Number(entry.employee_id) === Number(loginUserId)
          }"
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
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';

const route = useRoute();
const router = useRouter();
const noticeId = route.params.id;
const loginUserId = 8;

const notice = ref(null);
const writer = ref(null);
const employees = ref([]);
const departments = ref([]);
const checkList = ref([]);
const searchKeyword = ref("");

const loginUser = computed(() =>
  employees.value.find(e => Number(e.id) === loginUserId)
);

const isAdmin = computed(() => {
  return loginUser.value?.name === '관리자';
});

const canEditOrDelete = computed(() => {
  return writer.value?.id === loginUserId || isAdmin.value;
});

const formatEmployeeLabel = (id) => {
  const emp = employees.value.find(e => Number(e.id) === Number(id));
  const dept = departments.value.find(d => Number(d.id) === Number(emp?.department_id));
  return emp ? `${emp.name} ${emp.level} (${dept?.name || ''})` : '-';
};

const alreadyChecked = computed(() => {
  return checkList.value.find(e => Number(e.employee_id) === loginUserId)?.is_checked;
});

const filteredCheckList = computed(() => {
  const keyword = searchKeyword.value.trim().toLowerCase();
  return checkList.value
    .slice()
    .sort((a, b) => b.is_checked - a.is_checked)
    .filter(entry =>
      formatEmployeeLabel(entry.employee_id).toLowerCase().includes(keyword)
    );
});

const formatDate = (dateStr) => dateStr?.split('T')[0];

const fetchData = async () => {
  try {
    const [noticeRes, empRes, deptRes, empNoticeRes] = await Promise.all([
      axios.get(`http://localhost:3001/notices/${noticeId}`),
      axios.get('http://localhost:3001/employees'),
      axios.get('http://localhost:3001/departments'),
      axios.get(`http://localhost:3001/employee_notice?notice_id=${noticeId}`)
    ]);

    notice.value = noticeRes.data;
    employees.value = empRes.data;
    departments.value = deptRes.data;
    writer.value = employees.value.find(e => Number(e.id) === Number(notice.value.employee_id));
    checkList.value = empNoticeRes.data;
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
  } catch (e) {
    console.error("❌ 확인 PATCH 실패:", e);
  }
};

const goEditPage = () => {
  router.push(`/support/notice/edit/${notice.value.id}`);
};

const goBackToList = () => {
  router.push('/support/notice');
};

const deleteNotice = async () => {
  const confirmed = confirm('정말 삭제하시겠습니까?');
  if (!confirmed) return;
  try {
    await axios.patch(`http://localhost:3001/notices/${notice.value.id}`, {
      is_deleted: true
    });
    alert('삭제되었습니다.');
    router.push('/support/notice');
  } catch (e) {
    console.error("❌ 삭제 실패:", e);
    alert('삭제 중 오류가 발생했습니다.');
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
.notice-title {
  font-size: 1.6rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
  text-align: left;
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
.deleted-banner {
  background-color: #fff0f0;
  border: 1px dashed #d11a2a;
  color: #d11a2a;
  padding: 10px;
  margin-bottom: 1rem;
  font-weight: bold;
  font-size: 0.95rem;
  border-radius: 6px;
}

.btn-wrap {
  display: flex;
  justify-content: center;
  gap: 0.8rem;
  margin: 1.5rem 0;
}
.btn {
  padding: 0.55rem 1.2rem;
  min-width: 90px;
  border-radius: 6px;
  font-size: 0.95rem;
  font-weight: 500;
  border: 1px solid transparent;
  cursor: pointer;
  transition: all 0.2s ease;
}
.edit-btn {
  background-color: #e6f0fb;
  color: #1e6fd9;
  border-color: #1e6fd9;
}
.edit-btn:hover {
  background-color: #cfe2f8;
}
.delete-btn {
  background-color: #fbe6e6;
  color: #d11a2a;
  border-color: #d11a2a;
}
.delete-btn:hover {
  background-color: #f5cfcf;
}
.check-btn {
  background-color: #e6f7ec;
  color: #1eaf67;
  border-color: #1eaf67;
}
.check-btn:disabled {
  background-color: #f0f0f0;
  color: #aaa;
  border: 1px solid #ccc;
  cursor: not-allowed;
}
.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 0.4rem 0.8rem;
  font-size: 0.95rem;
  font-weight: 500;
  color: #2d8f65;
  background-color: transparent;
  border: 1px solid #2d8f65;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-bottom: 1.2rem;
}
.back-btn:hover {
  background-color: #dff3eb;
  color: #1d6b4f;
  border-color: #1d6b4f;
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
  background-color: #eef6ee;
  color: #666;
  font-style: normal;
}
.checklist li.currentUser {
  font-weight: bold;
  color: #2d8f65;
}
.not-allowed {
  max-width: 960px;
  margin: 3rem auto;
  font-size: 1.2rem;
  text-align: center;
  color: #a00;
}
</style>
