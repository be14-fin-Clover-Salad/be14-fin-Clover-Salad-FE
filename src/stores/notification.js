import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/api/auth'
import { useAuthStore } from '@/stores/auth'

// SSE 연결용 BASE URL (API와 동일한 포트 사용)
const SSE_BASE_URL = import.meta.env.MODE === 'development'
  ? 'http://localhost:5000'
  : 'http://api.saladerp.com'

export const useNotificationStore = defineStore('notification', () => {
  const unreadCount = ref(0)
  const notifications = ref([])

  async function fetchUnreadCount() {
    try {
      const auth = useAuthStore()
      const response = await api.get('/notification/unread-latest', {
        headers: {
          'Authorization': `Bearer ${auth.accessToken}`
        }
      })
      unreadCount.value = response.data.length
    } catch (error) {
      console.error('읽지 않은 알림 개수를 가져오는데 실패했습니다:', error)
    }
  }

  async function fetchNotifications() {
    try {
      const auth = useAuthStore()
      const response = await api.get('/notification/unread-latest', {
        headers: {
          'Authorization': `Bearer ${auth.accessToken}`
        }
      })
      notifications.value = response.data
      unreadCount.value = response.data.filter(n => !n.read).length
    } catch (error) {
      console.error('알림 목록을 가져오는데 실패했습니다:', error)
    }
  }

  async function markAsRead(notificationId) {
    try {
      const auth = useAuthStore()
      await api.patch(`/notification/${notificationId}/read`, null, {
        headers: {
          Authorization: `Bearer ${auth.accessToken}`
        }
      })
      const index = notifications.value.findIndex(n => n.id === notificationId)
      if (index !== -1 && !notifications.value[index].read) {
        notifications.value[index].read = true
        unreadCount.value = Math.max(0, unreadCount.value - 1)
      }
    } catch (error) {
      console.error('알림 읽음 처리 중 오류 발생:', error)
    }
  }

  const setupSse = async () => {
    if (typeof window === 'undefined') return
  
    const auth = useAuthStore()
    if (!auth.accessToken) {
      console.warn('[SSE] 토큰 없음 - SSE 연결 불가')
      return
    }
  
    try {
      console.log('[SSE] 구독 토큰 요청')
      
      // 1️⃣ 토큰 먼저 받아오기
      const response = await api.get('/notification/subscribe-token', {
        headers: {
          Authorization: `Bearer ${auth.accessToken}`,
        },
      })
      const subscribeToken = response.data
  
      // 2️⃣ 해당 토큰으로 SSE 연결 (올바른 포트 사용)
      const eventSource = new EventSource(`${SSE_BASE_URL}/notification/subscribe?token=${subscribeToken}`)
  
      eventSource.onopen = () => {
        console.log('연결 완료')
      }
  
      eventSource.addEventListener('notification', (event) => {
        const data = JSON.parse(event.data)
        console.log(data)
        const exists = notifications.value.find(n => n.id === data.id)
        if (!exists) {
          notifications.value.unshift({ ...data, read: false })
          unreadCount.value++
        }
      })
  
      eventSource.onerror = (err) => {
        console.warn('[SSE] 오류 발생. 연결 종료됨:', err)
        eventSource.close()
      }
  
    } catch (err) {
      console.error('[SSE] 구독 토큰 발급 또는 연결 실패:', err)
    }
  }

  async function deleteNotifications(notificationIds) {
    try {
      const auth = useAuthStore()
      console.log('삭제할 알림 ID:', notificationIds)
      console.log('요청 데이터:', { deleteNotification: notificationIds })
      console.log('요청 헤더:', {
        'Authorization': `Bearer ${auth.accessToken}`
      })

      await api.patch('/notification/delete', {
        deleteNotification: notificationIds
      }, {
        headers: {
          'Authorization': `Bearer ${auth.accessToken}`
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
    setupSse,
    deleteNotifications
  }
}) 