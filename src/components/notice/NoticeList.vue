<template>
  <div class="notice-container">
    <div class="board-container">
      <table class="board-table">
        <thead>
          <tr>
            <th class="notice-index">번호</th>
            <th class="notice-title">제목</th>
            <th class="notice-author">작성자</th>
            <th class="notice-date">등록일자</th>
          </tr>
        </thead>
        <tbody v-if="notices.length">
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
        <tbody v-else>
          <tr>
            <td class="notice-index"></td>
            <td class="notice-title empty-message">
              등록된 공지사항이 없습니다.
            </td>
            <td class="notice-author"></td>
            <td class="notice-date"></td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="bottom-actions">
      <div class="pagination" v-if="notices.length">
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
      
      <div class="register-wrapper" v-if="canWriteNotice">
        <button class="register-btn" @click="goToWritePage">등록</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
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
const currentPage = ref(0);
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
  if (currentPage.value === 0) {
    const remaining = 15 - pinnedAdmins.value.length;
    return [...pinnedAdmins.value, ...mixedNotices.value.slice(0, remaining)];
  } else {
    const offset = (currentPage.value - 1) * pageSize + (15 - pinnedAdmins.value.length);
    return mixedNotices.value.slice(offset, offset + pageSize);
  }
});

const visiblePageNumbers = computed(() => {
  const startPage = Math.floor(currentPage.value / 10) * 10 + 1;
  const endPage = Math.min(startPage + 9, totalPages.value);
  const pages = [];
  
  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }
  
  return pages;
});

const calcNoticeNumber = (index) => {
  const offset = (currentPage.value) * pageSize - pinnedAdmins.value.length;
  return mixedNotices.value.length - (offset + index);
};
const formatTitle = (title) => title.replace(/(\[[^\]]+\])/g, "<strong>$1</strong>");
const formatDate = (dateStr) => dateStr?.split('T')[0] || '-';
const goToWritePage = () => router.push("/support/notice/create");

const isPinnedAdmin = (notice) => {
  return pinnedAdmins.value.some(n => n.id === notice.id);
};

const changePage = (page) => {
  if (page >= 0 && page < totalPages.value) {
    currentPage.value = page;
  }
};

onMounted(async () => {
  try {
    const headers = {
      Authorization: `Bearer ${accessToken.value}`
    };
    const res = await axios.get(`/support/notice`, { headers });
    const data = res.data || [];

    // 관리자가 아닌 경우: 삭제되지 않은 공지사항 중에서 현재 사용자가 대상자로 포함된 것만 필터링
    notices.value = isAdmin.value
      ? data
      : data.filter(n => {
          // 삭제된 공지사항 제외
          if (n.isDeleted) return false;
          
          // checkList가 없거나 비어있으면 모든 사용자에게 보임
          if (!n.checkList || n.checkList.length === 0) return true;
          
          // 현재 사용자가 대상자 목록에 포함되어 있는지 확인
          return n.checkList.some(check => 
            Number(check.employeeId) === Number(loginUserId.value)
          );
        });
  } catch (err) {
    console.error("📛 공지사항 조회 실패", err);
  }
});
</script>

<style lang="scss" scoped>
.notice-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
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

.notice-index {
  text-align: center !important;
  vertical-align: middle;
  width: 60px;
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

.bottom-actions {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 20px;
  padding: 15px 0;
  position: relative;
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
    cursor: not-allowed;
  }
}

.register-wrapper {
  display: flex;
  gap: 8px;
  position: absolute;
  right: 0;
}

.register-btn {
  padding: 8px 16px;
  background-color: #a6ce39;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;

  &:hover {
    background-color: #94b933;
  }
}

.empty-message {
  text-align: center;
  padding: 40px 15px;
  color: #6c757d;
  font-size: 14px;
}
</style>
