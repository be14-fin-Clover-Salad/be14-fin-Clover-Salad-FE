import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/api/auth'
import { useAuthStore } from '@/stores/auth'

const SSE_BASE_URL = 
  //  'http://localhost:5000'
   'http://localhost:5001'
  //  'https://api.saladerp.com'

let eventSource = null
let reconnectTimeout = null
let isConnecting = false // 연결 중 상태 플래그
let reconnectAttempts = 0 // 재연결 시도 횟수
const MAX_RECONNECT_ATTEMPTS = 5 // 최대 재연결 시도 횟수

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
      unreadCount.value = uniqueNotifications.filter(n => !n.read).length
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

      await api.patch('/notification/read-all', null, {
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

  // SSE 연결 해제 함수
  function disconnectSse() {
    if (eventSource) {
      eventSource.close()
      eventSource = null
    }
    if (reconnectTimeout) {
      clearTimeout(reconnectTimeout)
      reconnectTimeout = null
    }
    isConnecting = false
    reconnectAttempts = 0
  }

  const setupSse = async () => {
    if (typeof window === 'undefined') return

    const auth = useAuthStore()

    // 이미 연결 중이거나 연결되어 있으면 중복 호출 방지
    if (isConnecting || eventSource) {
      console.log('SSE 이미 연결 중이거나 연결되어 있습니다.')
      return
    }

    // 기존 연결 정리
    disconnectSse()

    if (!auth.accessToken) {
      console.log('액세스 토큰이 없어 SSE 연결을 건너뜁니다.')
      return
    }

    isConnecting = true

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
        notifications.value.unshift({ ...data, read: false })
        unreadCount.value++
      })

      eventSource.onopen = () => {
        console.log('SSE 연결 성공')
        isConnecting = false
        reconnectAttempts = 0 // 연결 성공 시 재연결 시도 횟수 초기화
        
        if (reconnectTimeout) {
          clearTimeout(reconnectTimeout)
          reconnectTimeout = null
        }
      }

      eventSource.onerror = (error) => {
        console.error('SSE 연결 오류:', error)
        isConnecting = false
        
        if (eventSource) {
          eventSource.close()
          eventSource = null
        }

        // 재연결 시도 횟수 제한
        if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
          reconnectAttempts++
          console.log(`SSE 재연결 시도 ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS}`)
          
          if (!reconnectTimeout) {
            reconnectTimeout = setTimeout(() => {
              reconnectTimeout = null
              setupSse()
            }, 5000 * reconnectAttempts) // 점진적으로 대기 시간 증가
          }
        } else {
          console.error('SSE 최대 재연결 시도 횟수 초과. 수동 재연결이 필요합니다.')
        }
      }

    } catch (err) {
      console.error('SSE 토큰 발급 실패:', err)
      isConnecting = false
      
      // 재연결 시도 횟수 제한
      if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
        reconnectAttempts++
        console.log(`SSE 재연결 시도 ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS}`)
        
        if (!reconnectTimeout) {
          reconnectTimeout = setTimeout(() => {
            reconnectTimeout = null
            setupSse()
          }, 5000 * reconnectAttempts)
        }
      } else {
        console.error('SSE 최대 재연결 시도 횟수 초과. 수동 재연결이 필요합니다.')
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
    disconnectSse, // 연결 해제 함수 추가
  }
})