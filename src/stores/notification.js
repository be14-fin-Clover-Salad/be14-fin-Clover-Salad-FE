import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/api/auth'
import { useAuthStore } from '@/stores/auth'

const SSE_BASE_URL = import.meta.env.MODE === 'development'
  ? 'http://localhost:5000'
  // ? 'http://localhost:5001'
  : 'http://api.saladerp.com'

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
      notifications.value = response.data
      unreadCount.value = response.data.filter(n => !n.read).length
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
    deleteNotifications,
    setupSse,
  }
})