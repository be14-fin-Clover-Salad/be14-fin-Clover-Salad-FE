import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/api/auth'
import { useAuthStore } from '@/stores/auth'

const SSE_BASE_URL = 
  //  'http://localhost:5000'
  //  'http://localhost:5001'
   'https://api.saladerp.com'

let eventSource = null
let reconnectTimeout = null

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
      
      // 중복 알림 제거 (ID 기준)
      const uniqueNotifications = response.data.filter((notification, index, self) => 
        index === self.findIndex(n => n.id === notification.id)
      )
      
      notifications.value = uniqueNotifications
      
      // 전체 읽지 않은 알림 개수를 가져오기 위해 fetchUnreadCount 호출
      await fetchUnreadCount()
    } catch (error) {

    }
  }

  async function markAsRead(notificationId) {
    try {
      const auth = useAuthStore()
      await api.patch(`/notification/${notificationId}/read`, null, {
        headers: {
          'Authorization': `Bearer ${auth.accessToken}`
        }
      })
      const index = notifications.value.findIndex(n => n.id === notificationId)
      if (index !== -1 && !notifications.value[index].read) {
        notifications.value[index].read = true
        unreadCount.value = Math.max(0, unreadCount.value - 1)
      }
    } catch (error) {

    }
  }

  async function markAllAsRead() {
    try {
      const auth = useAuthStore()
      const unreadNotifications = notifications.value.filter(n => !n.read)
      if (unreadNotifications.length === 0) return

      const unreadIds = unreadNotifications.map(n => n.id)
      await api.patch('/notification/read', unreadIds, {
        headers: {
          'Authorization': `Bearer ${auth.accessToken}`
        }
      })
      
      // 모든 읽지 않은 알림을 읽음 상태로 변경
      notifications.value.forEach(notification => {
        if (!notification.read) {
          notification.read = true
        }
      })
      unreadCount.value = 0
    } catch (error) {
      console.error('모든 알림을 읽음 처리하는 중 오류 발생:', error)
    }
  }

  async function deleteNotifications(notificationIds) {
    try {
      const auth = useAuthStore()
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
      throw error
    }
  }

  const setupSse = async () => {
    if (typeof window === 'undefined') return

    const auth = useAuthStore()


    if (eventSource) {
      eventSource.close()
      eventSource = null
    }
    if (reconnectTimeout) {
      clearTimeout(reconnectTimeout)
      reconnectTimeout = null
    }

    if (!auth.accessToken) return

    try {
      const response = await api.get('/notification/subscribe-token', {
        headers: {
          'Authorization': `Bearer ${auth.accessToken}`
        }
      })
      const token = response.data

      eventSource = new EventSource(`${SSE_BASE_URL}/notification/subscribe?token=${token}`)

      eventSource.addEventListener('notification', (event) => {
        const data = JSON.parse(event.data)
      
        const exists = notifications.value.some(n => n.id === data.id)
        if (!exists) {
          notifications.value.unshift({ ...data, read: false })
          unreadCount.value++
        } else {
          console.debug(`중복 알림 수신 차단 - id: ${data.id}`)
        }
      })

      eventSource.onopen = () => {
        if (reconnectTimeout) {
          clearTimeout(reconnectTimeout)
          reconnectTimeout = null
        }

      }

      eventSource.onerror = (event) => {
        eventSource.close()
        eventSource = null
      
        const shouldRetry = event?.target?.readyState !== EventSource.CLOSED
        if (!shouldRetry) {
          console.warn('SSE 연결 종료됨, 재시도하지 않음')
          return
        }
      
        if (!reconnectTimeout) {
          reconnectTimeout = setTimeout(() => {
            reconnectTimeout = null
            setupSse()
          }, 5000)
        }
      }

    } catch (err) {

      eventSource = null
      if (!reconnectTimeout) {
        reconnectTimeout = setTimeout(() => {
          reconnectTimeout = null
          setupSse()
        }, 5000)
      }
    }
  }

  return {
    unreadCount,
    notifications,
    fetchUnreadCount,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotifications,
    setupSse,
  }
})