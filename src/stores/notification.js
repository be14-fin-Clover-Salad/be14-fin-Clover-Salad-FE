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
    } catch (error) {}
  }

  async function fetchNotifications() {
    try {
      const auth = useAuthStore()
      const response = await api.get('/notification/unread-latest', {
        headers: {
          'Authorization': `Bearer ${auth.accessToken}`
        }
      })
      const uniqueNotifications = response.data.filter((notification, index, self) => 
        index === self.findIndex(n => n.id === notification.id)
      )
      notifications.value = uniqueNotifications
      await fetchUnreadCount()
    } catch (error) {}
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
    } catch (error) {}
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

  const connectSse = async () => {
    const auth = useAuthStore()
    try {
      const response = await api.get('/notification/subscribe-token', {
        headers: { 'Authorization': `Bearer ${auth.accessToken}` }
      })
      const token = response.data
      eventSource = new EventSource(`${SSE_BASE_URL}/notification/subscribe?token=${token}`)
      eventSource.addEventListener('notification', (event) => {
        const data = JSON.parse(event.data)
        const exists = notifications.value.some(n => n.id === data.id)
        if (!exists) {
          notifications.value.unshift({ ...data, read: false })
          unreadCount.value++
        }
      })
      eventSource.onopen = () => {
        if (reconnectTimeout) {
          clearTimeout(reconnectTimeout)
          reconnectTimeout = null
        }
      }
      eventSource.onerror = () => {
        eventSource.close()
        eventSource = null
        reconnectTimeout = setTimeout(() => {
          reconnectTimeout = null
          setupSse()
        }, 5000)
      }
    } catch (err) {
      eventSource = null
      reconnectTimeout = setTimeout(() => {
        reconnectTimeout = null
        setupSse()
      }, 5000)
    }
  }

  const setupSse = async () => {
    if (typeof window === 'undefined') return
  
    const auth = useAuthStore()
  
    if (eventSource && eventSource.readyState !== EventSource.CLOSED) {
      console.debug('SSE가 이미 연결되어 있음, 중복 연결 방지')
      return
    }
  
    if (eventSource) {
      eventSource.close()
      eventSource = null
    }
    if (reconnectTimeout) {
      clearTimeout(reconnectTimeout)
      reconnectTimeout = null
    }
  
    if (!auth.accessToken) return
  
    let token
    try {
      const response = await api.get('/notification/subscribe-token', {
        headers: {
          'Authorization': `Bearer ${auth.accessToken}`
        }
      })
      token = response.data
    } catch (err) {
      console.warn('토큰 발급 실패, SSE 연결 시도 보류:', err)
      return
    }
  
    eventSource = new EventSource(`${SSE_BASE_URL}/notification/subscribe?token=${token}`)
  
    eventSource.addEventListener('notification', (event) => {
      const data = JSON.parse(event.data)
      const exists = notifications.value.some(n => n.id === data.id)
      if (!exists) {
        notifications.value.unshift({ ...data, read: false })
        unreadCount.value++
      }
    })
  
    eventSource.onopen = () => {
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout)
        reconnectTimeout = null
      }
    }
  
    eventSource.onerror = async (event) => {
      console.warn('SSE 오류 발생, 연결 종료 및 재시도 준비 중...')
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
  }

  return {
    unreadCount,
    notifications,
    fetchUnreadCount,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotifications,
    setupSse
  }
})

if (typeof window !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      console.debug('[SSE] 탭 다시 활성화됨 - SSE 재연결 시도')
      useNotificationStore().setupSse()
    }
  })
}