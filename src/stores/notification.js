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
let reconnectAttempts = 0
const MAX_RECONNECT_ATTEMPTS = 5
let connectionCheckInterval = null
let isConnecting = false

export const useNotificationStore = defineStore('notification', () => {
  const unreadCount = ref(0)
  const notifications = ref([])
  const showReconnectError = ref(false)

 const fetchUnreadCount = async() => {
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

  const fetchNotifications = async () =>  {
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

  const markAsRead = async (notificationId)  => {
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

  const markAllAsRead = async () => {
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

    if (isConnecting || (eventSource && eventSource.readyState !== EventSource.CLOSED)) {
      return
    }

    cleanupConnection()
    if (!auth.accessToken) return

    isConnecting = true
    showReconnectError.value = false

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

      eventSource.addEventListener('hearbeat', (event) => {
        console.debug('[SSE] hearbeat 수신: ', e.data)
      })

      eventSource.onopen = () => {
        console.debug('[SSE] 연결 성공')
        reconnectAttempts = 0
        isConnecting = false
        showReconnectError.value = false
        startConnectionMonitoring()
      }

      eventSource.onerror = () => {
        console.warn('[SSE] 오류 발생, 연결 종료 및 재시도 준비 중...')
        cleanupConnection()
        reconnectAttempts++
        isConnecting = false

        if(reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
          const delay = Math.min(5000 * 2 ** reconnectAttempts, 30000)
          reconnectTimeout = setTimeout(() => {
            reconnectTimeout = null
            connectSse()
          }, delay)
        } else {
            showReconnectError.value = true
            reconnectTimeout = setTimeout(() => {
              reconnectAttempts = 0
              showReconnectError.value = false
              connectSse()
          }, 30000)
        }
     }
    } catch (err) {
      console.warn('[SSE] 토큰 발급 실패:', err)
      reconnectAttempts++
      isConnecting = false
    }
  }

  // const setupSse = async () => {
  //   if (typeof window === 'undefined') return
  
  //   const auth = useAuthStore()
  
  //   // 이미 연결 중이거나 연결되어 있으면 중복 방지
  //   if (isConnecting || (eventSource && eventSource.readyState !== EventSource.CLOSED)) {
  //     console.debug('[SSE] 이미 연결 중이거나 연결되어 있음, 중복 연결 방지')
  //     return
  //   }
  
  //   // 기존 연결 정리
  //   cleanupConnection()
  
  //   if (!auth.accessToken) {
  //     console.debug('[SSE] 액세스 토큰 없음, 연결 시도 보류')
  //     return
  //   }
  
  //   // 재연결 시도 횟수 제한
  //   if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
  //     console.warn('[SSE] 최대 재연결 시도 횟수 초과, 연결 중단')
  //     return
  //   }
  
  //   isConnecting = true
  
  //   let token
  //   try {
  //     const response = await api.get('/notification/subscribe-token', {
  //       headers: {
  //         'Authorization': `Bearer ${auth.accessToken}`
  //       }
  //     })
  //     token = response.data
  //   } catch (err) {
  //     console.warn('[SSE] 토큰 발급 실패, SSE 연결 시도 보류:', err)
  //     reconnectAttempts++
  //     isConnecting = false
  //     return
  //   }
  
  //   try {
  //     // nginx 설정이 업데이트되었으므로 원래 URL 사용
  //     const sseUrl = `${SSE_BASE_URL}/notification/subscribe?token=${token}`
  //     eventSource = new EventSource(sseUrl)
      
  //     console.debug('[SSE] EventSource 생성 완료:', sseUrl)
  
  //     eventSource.addEventListener('notification', (event) => {
  //       try {
  //         const data = JSON.parse(event.data)
  //         const exists = notifications.value.some(n => n.id === data.id)
  //         if (!exists) {
  //           notifications.value.unshift({ ...data, read: false })
  //           unreadCount.value++
  //           console.debug('[SSE] 새 알림 수신:', data)
  //         }
  //       } catch (parseError) {
  //         console.warn('[SSE] 알림 데이터 파싱 오류:', parseError)
  //       }
  //     })
  
  //     eventSource.onopen = () => {
  //       console.debug('[SSE] 연결 성공')
  //       reconnectAttempts = 0
  //       isConnecting = false
  //       // 연결 성공 시 모니터링 시작
  //       startConnectionMonitoring()
  //     }
  
  //     eventSource.onerror = async (event) => {
  //       console.warn('[SSE] 오류 발생, 연결 종료 및 재시도 준비 중...', event)
  //       cleanupConnection()
  
  //       reconnectAttempts++
  //       if (!reconnectTimeout && reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
  //         const delay = Math.min(5000 * Math.pow(2, reconnectAttempts - 1), 30000) // 지수 백오프
  //         console.debug(`[SSE] ${delay}ms 후 재연결 시도 (${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})`)
  //         reconnectTimeout = setTimeout(() => {
  //           reconnectTimeout = null
  //           setupSse()
  //         }, delay)
  //       } else if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
  //         console.warn('[SSE] 최대 재연결 시도 횟수 초과')
  //         // 최대 시도 횟수 초과 시에도 30초 후 다시 시도
  //         reconnectTimeout = setTimeout(() => {
  //           reconnectAttempts = 0  // 카운터 리셋
  //           reconnectTimeout = null
  //           setupSse()
  //         }, 30000)
  //       }
  //     }
  //   } catch (error) {
  //     console.error('[SSE] EventSource 생성 실패:', error)
  //     reconnectAttempts++
  //     isConnecting = false
  //   }
  // }

  const cleanupConnection = () => {
    if (eventSource) {
      eventSource.close()
      eventSource = null
    }
    if (reconnectTimeout) {
      clearTimeout(reconnectTimeout)
      reconnectTimeout = null
    }
    if (connectionCheckInterval) {
      clearInterval(connectionCheckInterval)
      connectionCheckInterval = null
    }
    isConnecting = false
  }

  // 연결 상태 체크 함수
  const checkConnectionHealth = () => {
    if (eventSource?.readyState == EventSource.CLOSED) {
        console.warn('[SSE] 연결이 끊어진 것을 감지, 재연결 시도')
        cleanupConnection()
        setupSse()
    }
  }


  const startConnectionMonitoring = () => {
    if (connectionCheckInterval) {
      clearInterval(connectionCheckInterval)
    }
    connectionCheckInterval = setInterval(checkConnectionHealth, 30000)
  }

  const stopConnectionMonitoring = () => {
    if (connectionCheckInterval) {
      clearInterval(connectionCheckInterval)
      connectionCheckInterval = null
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
    startConnectionMonitoring,
    stopConnectionMonitoring,
    cleanupConnection,
    connectSse,
    showReconnectError
  }
})

if (typeof window !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      console.debug('[SSE] 탭 다시 활성화됨 - SSE 강제 재연결 시도')
      const store = useNotificationStore()
      store.stopConnectionMonitoring()
      store.cleanupConnection()
      store.setupSse()
    } else {
      console.debug('[SSE] 탭 비활성화됨 - 연결 정리')
      useNotificationStore().stopConnectionMonitoring()
    }
  })

  // 페이지를 떠날 때 연결 정리
  window.addEventListener('beforeunload', () => {
    const store = useNotificationStore()
    store.stopConnectionMonitoring()
    if (eventSource) {
      eventSource.close()
      eventSource = null
    }
  })
}