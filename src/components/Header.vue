<script setup>
const user = {
  name: "강수지",
  profileImageUrl: "", // 비어 있으면 이니셜 표시됨
};
</script>

<template>
  <header class="header">
    <div class="notification">🔔 알림 없음</div>
    <div class="user">
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
        <div class="name">{{ user.name }}</div>
        <div class="role">사원</div>
      </div>
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
  gap: 24px;
}

.notification {
  font-size: 14px;
  background: #f4fbea;
  padding: 6px 12px;
  border-radius: 20px;
  color: #2f2f2f;
}

.user {
  display: flex;
  align-items: center;
  gap: 12px;
}

.avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  overflow: hidden;
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
}

.fallback-avatar {
  width: 100%;
  height: 100%;
}
.info .name {
  font-size: 14px;
  font-weight: 500;
}
.info .role {
  font-size: 12px;
  color: #666;
}
</style>
