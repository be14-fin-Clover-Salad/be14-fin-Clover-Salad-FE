import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/api/auth'

export const useNotificationStore = defineStore('notification', () => {
  const unreadCount = ref(0)
  const notifications = ref([])

  async function fetchUnreadCount() {
    try {
      const response = await api.get('/notification/unread-latest', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      })
      unreadCount.value = response.data.length
    } catch (error) {
      console.error('읽지 않은 알림 개수를 가져오는데 실패했습니다:', error)
    }
  }

  async function fetchNotifications() {
    try {
      const response = await api.get('/notification/unread-latest', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      })
      notifications.value = response.data.map(notification => ({
        ...notification,
        read: false
      }))
      unreadCount.value = notifications.value.length
    } catch (error) {
      console.error('알림 목록을 가져오는데 실패했습니다:', error)
    }
  }

  async function markAsRead(notificationId) {
    try {
      const index = notifications.value.findIndex(n => n.id === notificationId)
      if (index !== -1) {
        notifications.value[index].read = true
        unreadCount.value = Math.max(0, unreadCount.value - 1)
      }
    } catch (error) {
      console.error('알림 읽음 처리 중 오류 발생:', error)
    }
  }

  async function deleteNotifications(notificationIds) {
    try {
      console.log('삭제할 알림 ID:', notificationIds)
      console.log('요청 데이터:', { deleteNotification: notificationIds })
      console.log('요청 헤더:', {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
      })

      await api.patch('/notification/delete', {
        deleteNotification: notificationIds
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      })
      
      notifications.value = notifications.value.filter(n => !notificationIds.includes(n.id))
      unreadCount.value = notifications.value.filter(n => !n.read).length
    } catch (error) {
      console.error('알림 삭제 중 오류 발생:', error)
      throw error
    }
  }

  return {
    unreadCount,
    notifications,
    fetchUnreadCount,
    fetchNotifications,
    markAsRead,
    deleteNotifications
  }
}) 