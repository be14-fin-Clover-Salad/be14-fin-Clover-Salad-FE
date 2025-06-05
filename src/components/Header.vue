<template>
  <header class="header">
    <!-- 로고 -->
    <div class="left" @click="goHome">
      <img src="/logo_text.svg" alt="logo" class="logo" />
    </div>

    <div class="right">
      <!-- 알림 -->
      <div class="notification">
        <img src="/notification.svg" alt="알림" class="icon" />
        <span class="badge" v-if="user.notifications > 0">
          {{ user.notifications }}
        </span>
      </div>

      <!-- 프로필 -->
      <div class="profile">
        <div class="avatar">
          <img
            v-if="user.profileImagePath"
            :src="user.profileImagePath"
            alt="프로필"
          />
          <div v-else class="fallback-avatar">
            {{ user.name?.charAt(0) }}
          </div>
        </div>
        <div class="info">
      <div class="team">{{ user.departmentName }}</div>
      <div class="name">{{ user.name }} {{ user.level }}</div>
    </div>
      </div>

      <!-- 로그아웃 버튼 -->
      <button class="logout" @click="logout">로그아웃</button>
    </div>
  </header>
</template>

<script setup>
import { useRouter } from "vue-router";
import axios from "@/api/auth"; // 설정된 axios 인스턴스
import { useAuthStore } from "@/stores/auth";
import { ref, onMounted } from "vue";

const router = useRouter();
const auth = useAuthStore();

const user = ref({
  name: "",
  departmentName: "",
  profileImagePath: null,
  level: "",
  notifications: 0
});

const goHome = () => {
  router.push("/home");
};

const logout = async () => {
  const token = auth.accessToken;
  if (!token) {
    console.warn("⚠️ accessToken이 없어서 로그아웃 요청 건너뜀");
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
    console.warn("🚨 로그아웃 중 오류:", e.message);
  } finally {
    auth.clearToken();
    user.value = {
      name: "",
      departmentName: "",
      profileImagePath: null,
      notifications: 0
    };
    router.push('/login');
  }
};

// 로그인 응답 데이터로 user 정보 업데이트
const updateUserInfo = (loginData) => {
  console.log('로그인 데이터:', loginData);
  if (!loginData?.loginHeaderInfo) {
    console.warn('loginHeaderInfo가 없습니다');
    return;
  }

  const { name, departmentName, profileImagePath, level } = loginData.loginHeaderInfo;

  user.value = {
    name: name || "",
    departmentName: departmentName || "",
    profileImagePath: profileImagePath || null,
    level: level || "",
    notifications: 0
  };

  localStorage.setItem('userInfo', JSON.stringify(loginData));
};

// 컴포넌트가 마운트될 때 로컬 스토리지에서 사용자 정보 가져오기
onMounted(() => {
  try {
    const savedUserInfo = localStorage.getItem('userInfo');
    console.log('저장된 사용자 정보:', savedUserInfo);
    if (savedUserInfo) {
      const parsedInfo = JSON.parse(savedUserInfo);
      updateUserInfo(parsedInfo);
    } else {
      // 로컬 스토리지에 데이터가 없는 경우 빈 값으로 초기화
      user.value = {
        name: "",
        departmentName: "",
        profileImagePath: null,
        level: "",
        notifications: 0
      };
    }
  } catch (error) {
    console.error('사용자 정보를 불러오는 중 오류가 발생했습니다:', error);
  }
});
</script>

<style scoped>
.header {
  height: 64px;
  background-color: #d5eb97;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 34px;
  border-bottom: 1px solid #e0e0e0;
  user-select: none;
}
.left {
  display: flex;
  cursor: pointer;
  margin: 47px;
}
.logo {
  height: 60px;
  object-fit: cover;
}
.right {
  display: flex;
  align-items: center;
  gap: 15px;
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
  margin-right: 8px;
}
.avatar {
  width: 36px;
  height: 36px;
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
  line-height: 1.2;
}
.team {
  font-size: 12px;
  color: #444;
}
.name {
  font-size: 14px;
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
</style>