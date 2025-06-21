<template>
  <div class="notice-wrapper" v-if="notices.length">
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
          :class="{ deleted: notice.isDeleted }"
        >
          <td class="notice-index">
            <template v-if="isPinnedAdmin(notice)">🚩</template>
            <template v-else>{{ calcNoticeNumber(index) }}</template>
          </td>
          <td
            class="notice-title"
            :class="{
              system: notice.writerName === '관리자',
              deletedTitle: isAdmin && notice.isDeleted,
              read: !isAdmin && notice.isChecked
            }"
          >
            <router-link :to="`/support/notice/${notice.id}`" class="notice-link">
              <span v-html="formatTitle(notice.title)" />
            </router-link>
          </td>
          <td class="notice-author">
            {{ notice.writerName }} {{ notice.writerLevel || '' }}
          </td>
          <td class="notice-date">{{ formatDate(notice.createdAt) }}</td>
        </tr>
      </tbody>
    </table>

    <div class="notice-bottom-actions">
      <div class="pagination-wrapper">
        <Pagination
          :total="totalPages"
          :pageSize="1"
          :currentPage="currentPage"
          @update:currentPage="currentPage = $event"
        />
      </div>
      <div class="register-wrapper" v-if="canWriteNotice">
        <button class="register-btn" @click="goToWritePage">등록</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import Pagination from "@/components/common/Pagination.vue";
import { useAuthStore } from '@/stores/auth';
import axios from '@/api/auth';

const authStore = useAuthStore();
const loginUser = computed(() => authStore.userInfo || null);
const loginUserId = computed(() => authStore.userInfo?.id || null);
const accessToken = computed(() => authStore.accessToken || "");
const isAdmin = computed(() =>
  loginUser.value?.roles?.includes("ROLE_ADMIN") || loginUser.value?.name === "관리자"
);
const canWriteNotice = computed(() => {
  const user = authStore.userInfo;
  return user?.name === "관리자" || user?.levelLabel === "팀장";
});

const router = useRouter();
const notices = ref([]);
const currentPage = ref(1);
const pageSize = 15;

const adminNoticesAll = computed(() =>
  notices.value.filter(n => n.writerName === '관리자')
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
);
const pinnedAdmins = computed(() => adminNoticesAll.value.slice(0, 5));
const remainingAdmins = computed(() => adminNoticesAll.value.slice(5));
const normalNotices = computed(() =>
  notices.value.filter(n => n.writerName !== '관리자')
);
const mixedNotices = computed(() =>
  [...normalNotices.value, ...remainingAdmins.value]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
);
const totalPages = computed(() => {
  const remaining = mixedNotices.value.length - Math.max(0, 15 - pinnedAdmins.value.length);
  return Math.ceil(remaining / pageSize) + 1;
});
const pagedNotices = computed(() => {
  if (currentPage.value === 1) {
    const remaining = 15 - pinnedAdmins.value.length;
    return [...pinnedAdmins.value, ...mixedNotices.value.slice(0, remaining)];
  } else {
    const offset = (currentPage.value - 2) * pageSize + (15 - pinnedAdmins.value.length);
    return mixedNotices.value.slice(offset, offset + pageSize);
  }
});

const calcNoticeNumber = (index) => {
  const offset = (currentPage.value - 1) * pageSize - pinnedAdmins.value.length;
  return mixedNotices.value.length - (offset + index);
};
const formatTitle = (title) => title.replace(/(\[[^\]]+\])/g, "<strong>$1</strong>");
const formatDate = (dateStr) => dateStr?.split('T')[0] || '-';
const goToWritePage = () => router.push("/support/notice/create");

const isPinnedAdmin = (notice) => {
  return pinnedAdmins.value.some(n => n.id === notice.id);
};

onMounted(async () => {
  try {
    const headers = {
      Authorization: `Bearer ${accessToken.value}`
    };
    const res = await axios.get(`/support/notice`, { headers });
    const data = res.data || [];

    notices.value = isAdmin.value
      ? data
      : data.filter(n => !n.isDeleted);
  } catch (err) {
    console.error("📛 공지사항 조회 실패", err);
  }
});
</script>

<style>
.notice-wrapper {
  max-width: 1500px;
  margin: 0 auto;
  font-size: 15px;
  font-weight: 500;
  color: #222;
}
.notice-bottom-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
}
.pagination-wrapper {
  flex: 1;
  display: flex;
  justify-content: center;
}
.register-wrapper {
  display: flex;
  justify-content: flex-end;
  min-width: 100px;
}
.register-btn {
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
.register-btn:hover {
  background-color: #d1e9c2;
}
.notice-table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
}
thead {
  background-color: #f0f7e4;
  font-size: 15px;
  font-weight: 600;
}
th,
td {
  padding: 12px 20px;
  vertical-align: middle;
  border-bottom: 1px solid #ddd;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  height: 22px;
}
.notice-index {
  text-align: center;
  width: 60px;
  font-size: 16px;
}
.notice-title {
  text-align: left;
}
th.notice-title {
  text-align: center;
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
  color: rgb(255, 66, 89);
  font-weight: bold;
}
.read {
  color: #aaa;
}
.system.read {
  color: rgba(218, 67, 67, 0.5);
  font-weight: normal;
}
.deleted {
  opacity: 0.5;
}
.deletedTitle {
  color: #aaa;
  text-decoration: line-through;
}
strong {
  font-weight: 600;
  font-size: 15px;
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
