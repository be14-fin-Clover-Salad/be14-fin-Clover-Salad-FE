<template>
  <header class="header" v-if="auth.accessToken">
    <!-- 로고 -->
    <div class="left" @click="goHome">
      <img src="/logo_text.svg" alt="logo" class="logo" />
    </div>

    <div class="right" style="position: relative;">
      <!-- 알림 -->
      <div class="notification-wrapper">
        <div class="notification" @click.stop="toggleNotificationDropdown">
          <img src="/notification.svg" alt="알림" class="icon" />
          <span class="badge" v-if="notificationStore.unreadCount > 0">
            {{ notificationStore.unreadCount }}
          </span>
        </div>
        <NotificationDropdown :isOpen="notificationDropdownOpen" />
      </div>

      <!-- 프로필 -->
      <div class="profile" @click="toggleDropdown">
        <div class="avatar">
          <img
            v-if="user.profilePath"
            :src="user.profilePath"
            alt="프로필"
          />
          <div v-else class="fallback-avatar">
            {{ user.name?.charAt(0) || '?' }}
          </div>
        </div>
        <div class="info">
          <div class="team">{{ user.departmentName || '로딩 중...' }}</div>
          <div class="name">{{ user.name || '사용자' }} {{ user.levelLabel || '' }}</div>
          <!-- 드롭다운 메뉴 (토글) -->
          <div class="dropdown-menu" v-if="dropdownOpen">
            <div class="dropdown-arrow"></div>
            <div class="dropdown-header">
              <div class="dropdown-header-left">
                <img v-if="user.profilePath" :src="user.profilePath" alt="프로필" class="dropdown-avatar" />
                <div v-else class="dropdown-fallback-avatar">{{ user.name?.charAt(0) || '?' }}</div>
              </div>
              <div class="dropdown-header-right">
                <div class="dropdown-team">{{ user.departmentName || '로딩 중...' }}</div>
                <div class="dropdown-employee">{{ user.name || '사용자' }} {{ user.levelLabel || '' }}</div>
              </div>
            </div>
            <div class="dropdown-divider"></div>
            <div class="dropdown-item" @click.stop="goToMypage">
              <img src="/profile.svg" alt="내 정보 수정" class="dropdown-icon" />
              내 정보 수정
            </div>
            <div class="dropdown-divider strong"></div>
            <div class="dropdown-item" @click.stop="logout">
              <img src="/logout.svg" alt="로그아웃" class="dropdown-icon" />
              <span class="logout-text">로그아웃</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { useRouter } from "vue-router";
import axios from "@/api/auth";
import { useAuthStore } from "@/stores/auth";
import { useNotificationStore } from "@/stores/notification";
import { computed, ref, watch } from "vue";
import NotificationDropdown from './notification/NotificationDropdown.vue';

const router = useRouter();
const auth = useAuthStore();
const notificationStore = useNotificationStore();

const user = computed(() => {
  return auth.userInfo || {
    name: "",
    departmentName: "",
    profilePath: null,
    levelLabel: "",
  };
});

// user가 변경될 때마다 알림 개수 가져오기
watch(() => user.value, async (newUser) => {
  if (newUser && newUser.name) {  // 로그인된 상태일 때만
    await notificationStore.fetchUnreadCount();
  }
}, { immediate: true });  // 컴포넌트 마운트 시에도 실행

// 사용자 정보가 유실된 경우 자동 복구
watch(() => user.value, async (newUser, oldUser) => {
  // 토큰은 있지만 사용자 정보가 없는 경우 (유실된 경우)
  if (auth.accessToken && (!newUser || !newUser.name)) {
    console.warn('[Header] 사용자 정보가 유실됨, 복구 시도 중...')
    try {
      await auth.recoverUserInfo()
      console.log('[Header] 사용자 정보 복구 성공')
    } catch (error) {
      console.error('[Header] 사용자 정보 복구 실패:', error)
      // 복구 실패 시 토큰도 클리어
      auth.clearToken()
      router.push('/login')
    }
  }
}, { immediate: true })

// 추가: 컴포넌트 마운트 시 사용자 정보 확인 및 복구
const checkAndRecoverUserInfo = async () => {
  if (auth.accessToken && !auth.userInfo) {
    console.log('[Header] 컴포넌트 마운트 시 사용자 정보 복구 시도...')
    try {
      await auth.recoverUserInfo()
      console.log('[Header] 컴포넌트 마운트 시 사용자 정보 복구 성공')
    } catch (error) {
      console.error('[Header] 컴포넌트 마운트 시 사용자 정보 복구 실패:', error)
      auth.clearToken()
      router.push('/login')
    }
  }
}

// 컴포넌트 마운트 시 실행
checkAndRecoverUserInfo()

const dropdownOpen = ref(false);
const toggleDropdown = () => {
  dropdownOpen.value = !dropdownOpen.value;
};

const notificationDropdownOpen = ref(false);

const toggleNotificationDropdown = () => {
  notificationDropdownOpen.value = !notificationDropdownOpen.value;
};

const goHome = () => {
  router.push("/home");
};

const goToMypage = () => {
  router.push("/mypage");
  dropdownOpen.value = false;
};

const logout = async () => {
  const token = auth.accessToken;
  if (!token) {
    console.warn("accessToken이 없어서 로그아웃 요청 건너뜀");
    return;
  }

  try {
    await axios.post(
      "/auth/logout",
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`
        },
        withCredentials: true
      }
    );
  } catch (e) {
    console.warn("로그아웃 중 오류:", e.message);
  } finally {
    auth.clearToken();
    router.push("/login");
  }
};

// 테스트용: 사용자 정보 유실 시뮬레이션
const simulateUserInfoLoss = () => {
  console.log('🧪 [테스트] 사용자 정보 유실 시뮬레이션 시작')
  console.log('유실 전 토큰:', auth.accessToken)
  console.log('유실 전 사용자 정보:', auth.userInfo)
  
  auth.simulateUserInfoLoss()
  
  console.log('유실 후 토큰:', auth.accessToken)
  console.log('유실 후 사용자 정보:', auth.userInfo)
  console.log('🧪 [테스트] 복구 로직이 자동으로 실행될 것입니다...')
}
</script>

<style scoped>
.header {
  height: 64px;
  background-color: #d5eb97;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #e0e0e0;
  user-select: none;
}
.left {
  display: flex;
  cursor: pointer;
  margin-left: 30px;
}
.logo {
  height: 60px;
  object-fit: cover;
}
.right {
  display: flex;
  align-items: center;
  gap: 15px;
  padding-right: 40px;
}
.notification-wrapper {
  position: relative;
}
.notification {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 8px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.notification:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.notification .icon {
  width: 30px;
  height: 30px;
  display: block;
}

.notification .badge {
  position: absolute;
  top: 1px;
  right: 1px;
  width: 16px;
  height: 16px;
  background-color: #ff3b30;
  color: #fff;
  font-size: 10px;
  font-weight: bold;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: none;
  z-index: 2;
  padding: 0;
}
.profile {
  display: flex;
  align-items: center;
  gap: 15px;
  height: 30px;
}
.avatar {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  overflow: hidden;
  border: 1px solid #ccc;
  background-color: #d5eb97;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: bold;
  color: #2f2f2f;
}
.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  border-radius: 50%;
}
.fallback-avatar {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.info {
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: 100%; /* avatar와 동일 높이 */
  line-height: 1.2;
}
.team {
  font-size: 11px;
  color: #4B4B4B;
  margin-top: 4px;
  margin-bottom: 4px;
  font-weight: 400;
}
.name {
  font-size: 12px;
  font-weight: 500;
  color: #111;
}
.logout {
  background-color: white;
  border: 1px solid #ddd;
  padding: 6px 12px;
  font-size: 13px;
  border-radius: 4px;
  cursor: pointer;
  color: #333;
}
.logout:hover {
  background-color: #f5f5f5;
}
/* 드롭다운 메뉴 스타일 */
.dropdown-menu {
  position: absolute;
  top: 40px;
  right: 0;
  width: 180px;
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.08);
  z-index: 100;
  padding: 0;
  margin-top: 8px;
  font-size: 15px;
}
.dropdown-arrow {
  position: absolute;
  top: -8px;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 8px solid transparent;
  border-right: 8px solid transparent;
  border-bottom: 8px solid #fff;
  z-index: 101;
  filter: drop-shadow(0 -2px 2px rgba(0,0,0,0.04));
}
.dropdown-header {
  display: flex;
  align-items: center;
  padding: 12px 16px 8px 16px;
  background: #f7fbef;
  border-radius: 8px 8px 0 0;
}
.dropdown-header-left {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
}
.dropdown-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid #e0e0e0;
}
.dropdown-fallback-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #d5eb97;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: bold;
  color: #2f2f2f;
  border: 1px solid #e0e0e0;
}
.dropdown-header-right {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
}
.dropdown-team {
  color: #4B4B4B;
  font-size: 11px;
  font-weight: 400;
  margin-bottom: 4px;
  margin-top: 0;
}
.dropdown-employee {
  color: #111;
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 2px;
}
.dropdown-divider {
  height: 1px;
  background: #f0f0f0;
  margin: 0 0 0 0;
}
.dropdown-divider.strong {
  background: #e0e0e0;
}
.dropdown-item {
  padding: 7px 0 7px 50px;
  text-align: left;
  cursor: pointer;
  transition: background 0.15s;
  font-family: 'Inter', sans-serif;
  font-size: 12px;
  font-weight: 600;
  display: flex;
  align-items: center;
}
.dropdown-item:hover {
  background: #f7fbef;
}
.dropdown-icon {
  width: 18px;
  height: 18px;
  margin-right: 8px;
  margin-bottom: 2px;
  flex-shrink: 0;
}

.dropdown-item:last-of-type .dropdown-icon {
  margin-left: 2px;
}

.logout-text {
  margin-left: -1px;
}
</style>