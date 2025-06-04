<template>
  <div class="notice-wrapper" v-if="employees.length && notices.length">
    <!-- 작성 버튼은 관리자 또는 팀장만 -->
    <div class="notice-actions">
      <button v-if="canWriteNotice" @click="goToWritePage">공지 등록</button>
    </div>

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
              read: notice.is_checked,
            }"
          >
            <router-link
              :to="`/support/notice/${notice.id}`"
              v-html="formatTitle(notice.title)"
              class="notice-link"
            ></router-link>
          </td>
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
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import Pagination from "@/components/common/Pagination.vue";

// 로그인 한 유저
const loginUserId = 2;

const router = useRouter();
const notices = ref([]);
const employees = ref([]);
const currentPage = ref(1);
const pageSize = 10;

const loginUser = computed(() => {
  return employees.value.find(emp => Number(emp.id) === Number(loginUserId)) || {};
});

const canWriteNotice = computed(() => {
  return loginUser.value.name === "관리자" || loginUser.value.level === "팀장";
});

const pagedNotices = computed(() => {
  const start = (currentPage.value - 1) * pageSize;
  return notices.value.slice(start, start + pageSize);
});

const getEmployee = (employee_id) => {
  return employees.value.find(emp => Number(emp.id) === Number(employee_id)) || null;
};

const getEmployeeDisplayName = (employee_id) => {
  const emp = getEmployee(employee_id);
  if (!emp || !emp.name) return "-";
  return emp.name === "관리자" ? "관리자" : `${emp.name} ${emp.level || ""}`;
};

const formatTitle = (title) => {
  return title.replace(/(\[[^\]]+\])/g, "<strong>$1</strong>");
};

const goToWritePage = () => {
  router.push("/support/notice/create");
};

onMounted(async () => {
  const [empNoticeRes, noticeRes, employeeRes] = await Promise.all([
    fetch(`http://localhost:3001/employee_notice?employee_id=${loginUserId}`),
    fetch("http://localhost:3001/notices"),
    fetch("http://localhost:3001/employees")
  ]);

  const empNoticeData = await empNoticeRes.json();
  const noticeData = await noticeRes.json();
  const employeeData = await employeeRes.json();

  employees.value = employeeData;

  const allowedNoticeIds = empNoticeData.map(item => Number(item.notice_id));
  const isLoginUserAdmin = loginUser.value?.name === "관리자";

  const visibleNotices = isLoginUserAdmin
    ? noticeData
    : noticeData.filter(n => allowedNoticeIds.includes(Number(n.id)));

  const joined = visibleNotices.map(n => {
    const writer = employeeData.find(e => e.id === n.employee_id);
    return {
      ...n,
      employee_name: writer?.name || "알 수 없음",
      is_checked: empNoticeData.find(e => Number(n.id) === Number(e.notice_id))?.is_checked || false
    };
  });

  notices.value = joined.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  console.log("🔐 로그인 사용자:", loginUser.value);
  console.log("📌 보여줄 공지 목록:", joined);
});
</script>

<style scoped>
.notice-wrapper {
  max-width: 1200px;
  margin: 0 auto;
  font-size: 15px;
  font-weight: 500;
  color: #222;
}
.notice-actions {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 14px;
}
.notice-actions button {
  background-color: #e7f3d9;
  color: #222;
  padding: 10px 20px;
  font-size: 15px;
  font-weight: 600;
  border: 1px solid #b8dca6;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}
.notice-actions button:hover {
  background-color: #d1e9c2;
}
.notice-table {
  width: 100%;
  border-collapse: collapse;
}
thead {
  background-color: #f0f7e4;
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
.notice-link {
  text-decoration: none;
  color: inherit;
}
.notice-link:hover {
  text-decoration: underline;
  color: #3a6b1d;
}
</style>
