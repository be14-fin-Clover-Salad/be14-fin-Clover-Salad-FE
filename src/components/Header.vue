<template>
  <header class="header" v-if="user">
    <!-- 로고 -->
    <div class="left" @click="goHome">
      <img src="/logo_text.svg" alt="logo" class="logo" />
    </div>

    <div class="right" style="position: relative;">
      <!-- 알림 -->
      <div class="notification">
        <img src="/notification.svg" alt="알림" class="icon" />
        <span class="badge" v-if="user.notifications > 0">
          {{ user.notifications }}
        </span>
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
            {{ user.name?.charAt(0) }}
          </div>
        </div>
        <div class="info">
          <div class="team">{{ user.departmentName }}</div>
          <div class="name">{{ user.name }} {{ user.levelLabel }}</div>
          <!-- 드롭다운 메뉴 (토글) -->
          <div class="dropdown-menu" v-if="dropdownOpen">
            <div class="dropdown-arrow"></div>
            <div class="dropdown-header">
              <div class="dropdown-header-left">
                <img v-if="user.profilePath" :src="user.profilePath" alt="프로필" class="dropdown-avatar" />
                <div v-else class="dropdown-fallback-avatar">{{ user.name?.charAt(0) }}</div>
              </div>
              <div class="dropdown-header-right">
                <div class="dropdown-team">{{ user.departmentName }}</div>
                <div class="dropdown-employee">{{ user.name }} {{ user.levelLabel }}</div>
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
import { computed, ref } from "vue";

const router = useRouter();
const auth = useAuthStore();

const user = computed(() => {
  return auth.userInfo || {
    name: "",
    departmentName: "",
    profilePath: null,
    levelLabel: "",
    notifications: 0
  };
});

const dropdownOpen = ref(false);
const toggleDropdown = () => {
  dropdownOpen.value = !dropdownOpen.value;
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
      "/employee/logout",
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
.notification {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}
.notification .icon {
  width: 30px;
  height: 30px;
  display: block;
}
.notification .badge {
  position: absolute;
  top: -4px;
  right: -8px;
  background-color: #d32f2f;
  color: white;
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 999px;
  font-weight: bold;
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