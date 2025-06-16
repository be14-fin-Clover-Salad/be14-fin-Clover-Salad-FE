import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/api/auth'

export const useNotificationStore = defineStore('notification', () => {
  const unreadCount = ref(0)
  const notifications = ref([])

  const fetchUnreadCount = async () => {
    try {
      const response = await api.get('/notification/unread-latest', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      })
      // 읽지 않은 알림 배열의 길이로 개수 계산
      unreadCount.value = response.data.length
    } catch (error) {
      console.error('읽지 않은 알림 개수를 가져오는데 실패했습니다:', error)
    }
  }

  const fetchNotifications = async () => {
    try {
      const response = await api.get('/notification/unread-latest', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      })
      // 서버에서 받은 데이터를 그대로 사용 (모두 읽지 않은 알림)
      notifications.value = response.data.map(notification => ({
        ...notification,
        read: false // 읽지 않은 알림이므로 read: false로 설정
      }))
      unreadCount.value = notifications.value.length
    } catch (error) {
      console.error('알림 목록을 가져오는데 실패했습니다:', error)
    }
  }

  const markAsRead = async (notificationId) => {
    try {
      // 임시로 API 호출 비활성화 - 서버에 해당 엔드포인트가 없음
      // await api.patch(`/notification/${notificationId}/read`, null, {
      //   headers: {
      //     'Authorization': `Bearer ${localStorage.getItem('access_token')}`
      //   }
      // })
      
      // 알림 목록에서 해당 알림의 read 상태 업데이트
      const index = notifications.value.findIndex(n => n.id === notificationId)
      if (index !== -1) {
        notifications.value[index].read = true
        unreadCount.value = Math.max(0, unreadCount.value - 1)
      }
    } catch (error) {
      console.error('알림 읽음 처리 중 오류 발생:', error)
    }
  }

  return {
    unreadCount,
    notifications,
    fetchUnreadCount,
    fetchNotifications,
    markAsRead
  }
}) 