<template>
  <div class="notification-dropdown" v-if="isOpen">
    <div class="dropdown-arrow"></div>
    <div class="dropdown-header">
      <h3>알림</h3>
      <div class="header-buttons">
        <button class="mark-all-read-btn" @click="handleMarkAllAsRead" :disabled="unreadNotifications.length === 0">모두 읽기</button>
        <button class="view-all-btn" @click="goToNotificationList">전체보기</button>
      </div>
    </div>
    <div class="dropdown-content">
      <div v-if="unreadNotifications.length === 0" class="no-notifications">
        새로운 알림이 없습니다.
      </div>
      <div v-else class="notification-list">
        <div
          v-for="notification in unreadNotifications"
          :key="notification.id"
          class="notification-item"
          @click="handleNotificationClick(notification)"
        >
          <div class="notification-content">
            <div class="notification-header">
              <div class="notification-type">{{ notification.type }}</div>
              <div class="notification-time">{{ calculateTimeAgo(notification.createdAt) }}</div>
            </div>
            <div class="notification-text">{{ notification.content }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useNotificationStore } from '@/stores/notification'

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true
  }
})

const router = useRouter()
const notificationStore = useNotificationStore()

const handleNotificationClick = async (notification) => {
  try {
    await notificationStore.markAsRead(notification.id)
    if (notification.type === '결재' && notification.url) {
      // URL에서 결재 ID 추출 (예: /approval/1 -> 1)
      const approvalId = notification.url.split('/').pop()
      router.push({
        path: '/approval',
        query: { showDetail: 'true', approvalId }
      })
    } else if (notification.url) {
      router.push(notification.url)
    }
  } catch (error) {
    console.error('알림 처리 중 오류 발생:', error)
  }
}

const goToNotificationList = () => {
  router.push('/notification/list')
}

const handleMarkAllAsRead = async () => {
  try {
    await notificationStore.markAllAsRead()
  } catch (error) {
    console.error('모든 알림을 읽음 처리하는 중 오류 발생:', error)
  }
}

// isOpen prop이 변경될 때마다 알림 목록을 새로고침
watch(() => props.isOpen, (newValue) => {
  if (newValue) {
    notificationStore.fetchNotifications()
  }
})

// 읽지 않은 알림만 필터링
const unreadNotifications = computed(() => {
  return notificationStore.notifications.filter(notification => !notification.read)
})

const calculateTimeAgo = (dateString) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffInSeconds = Math.floor((now - date) / 1000)
  
  if (diffInSeconds < 60) {
    return '방금 전'
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes < 60) {
    return `${diffInMinutes}분 전`
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) {
    return `${diffInHours}시간 전`
  }
  
  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 30) {
    return `${diffInDays}일 전`
  }
  
  const diffInMonths = Math.floor(diffInDays / 30)
  if (diffInMonths < 12) {
    return `${diffInMonths}개월 전`
  }
  
  const diffInYears = Math.floor(diffInMonths / 12)
  return `${diffInYears}년 전`
}
</script>

<style scoped>
.notification-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  width: 400px;
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.08);
  z-index: 1000;
}

.dropdown-arrow {
  position: absolute;
  top: -8px;
  right: 20px;
  width: 0;
  height: 0;
  border-left: 8px solid transparent;
  border-right: 8px solid transparent;
  border-bottom: 8px solid #fff;
  filter: drop-shadow(0 -2px 2px rgba(0,0,0,0.04));
}

.dropdown-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #eee;
}

.dropdown-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.header-buttons {
  display: flex;
  gap: 8px;
  align-items: center;
}

.mark-all-read-btn {
  background: none;
  border: none;
  color: #666;
  font-size: 13px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
}

.mark-all-read-btn:hover:not(:disabled) {
  background-color: #f5f5f5;
}

.mark-all-read-btn:disabled {
  color: #ccc;
  cursor: not-allowed;
}

.view-all-btn {
  background: none;
  border: none;
  color: #666;
  font-size: 13px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
}

.view-all-btn:hover {
  background-color: #f5f5f5;
}

.dropdown-content {
  max-height: 500px;
  overflow-y: auto;
}

.no-notifications {
  padding: 24px;
  text-align: center;
  color: #666;
  font-size: 14px;
}

.notification-list {
  padding: 8px 0;
}

.notification-item {
  padding: 16px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.notification-item:hover {
  background-color: #f8f9fa;
}

.notification-item.unread {
  background-color: #f0f7e4;
}

.notification-item.unread:hover {
  background-color: #e8f3d8;
}

.notification-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.notification-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.notification-type {
  font-size: 12px;
  color: #666;
}

.notification-text {
  font-size: 14px;
  color: #333;
  line-height: 1.5;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
  margin-top: 4px;
}

.notification-time {
  font-size: 12px;
  color: #999;
}
</style> 