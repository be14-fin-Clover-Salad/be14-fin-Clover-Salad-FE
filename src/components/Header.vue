<script setup>
const user = {
  name: "강수지",
  role: "사원",
  team: "영업1팀",
  profileImageUrl: "", // 없으면 이니셜 표시됨
  notifications: 0,
};
</script>

<template>
  <header class="header">
    <div class="right">
      <!-- 알림 아이콘 -->
      <div class="notification">
        <span class="icon">🔔</span>
        <span class="badge" v-if="user.notifications && user.notifications > 0">
          {{ user.notifications }}
        </span>
      </div>

      <!-- 프로필 정보 -->
      <div class="profile">
        <div class="avatar">
          <img
            v-if="user.profileImageUrl"
            :src="user.profileImageUrl"
            alt="프로필"
          />
          <div v-else class="fallback-avatar">
            {{ user.name?.charAt(0) || "U" }}
          </div>
        </div>
        <div class="info">
          <div class="team">{{ user.team }}</div>
          <div class="name">{{ user.name }} {{ user.role }}</div>
        </div>
      </div>

      <!-- 로그아웃 -->
      <button class="logout">로그아웃</button>
    </div>
  </header>
</template>

<style scoped>
.header {
  height: 64px;
  background-color: #d5eb97;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 0 24px;
  border-bottom: 1px solid #e0e0e0;
}

.right {
  display: flex;
  align-items: center;
  gap: 32px;
}

/* 알림 */
.notification {
  position: relative;
  font-size: 20px;
  cursor: pointer;
}
.notification .icon {
  display: inline-block;
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

/* 사용자 */
.profile {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-right: 16px;
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

/* 로그아웃 버튼 */
.logout {
  background-color: white;
  border: none;
  padding: 6px 12px;
  font-size: 13px;
  border-radius: 4px;
  cursor: pointer;
  color: #333;
  border: 1px solid #ddd;
}
.logout:hover {
  background-color: #f5f5f5;
}
</style>
