<template>
    <div class="notification-container">
        <div class="board-header">
            <div class="filter-options">
                <select v-model="filterStatus" @change="handleFilterChange" class="filter-select">
                    <option value="all">전체</option>
                    <option value="unread">읽지 않음</option>
                </select>
            </div>
            
            <div class="action-buttons">
                <button 
                    @click="handleMarkAllAsRead" 
                    class="mark-all-read-button"
                    :disabled="selectedNotifications.length === 0">
                    읽음
                </button>
                <button 
                    @click="confirmDelete" 
                    class="delete-button"
                    :disabled="selectedNotifications.length === 0">
                    삭제
                </button>
            </div>
        </div>
        
        <div class="board-container">
            <table class="board-table">
                <thead>
                    <tr>
                        <th class="col-checkbox">
                            <input 
                                type="checkbox" 
                                :checked="isAllSelected" 
                                @change="toggleSelectAll"
                            >
                        </th>
                        <th class="col-type">구분</th>
                        <th class="col-content">내용</th>
                        <th class="col-date">등록일</th>
                        <th class="col-status">상태</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="notification in notifications" 
                        :key="notification.id"
                        @click="handleNotificationClick(notification)"
                        :class="{ 'unread': !notification.read }">
                        <td class="col-checkbox" @click.stop="toggleNotificationSelection(notification.id)">
                            <input 
                                type="checkbox" 
                                :checked="selectedNotifications.includes(notification.id)"
                            >
                        </td>
                        <td class="col-type">{{ notification.type }}</td>
                        <td class="col-content">{{ notification.content }}</td>
                        <td class="col-date">{{ formatDate(notification.createdAt) }}</td>
                        <td class="col-status">
                            <span class="status-badge" :class="{ 'unread': !notification.read }">
                                {{ notification.read ? '읽음' : '읽지 않음' }}
                            </span>
                        </td>
                    </tr>
                    <tr v-if="notifications.length === 0">
                        <td colspan="5" class="no-data">등록된 알림이 없습니다.</td>
                    </tr>
                </tbody>
            </table>
        </div>
        
        <div class="bottom-actions">
            <div class="pagination">
                <button 
                    @click="changePage(currentPage - 10)"
                    :disabled="currentPage < 10"
                    class="page-button">
                    &lt;
                </button>
                <div class="page-numbers">
                    <span 
                        v-for="pageNum in visiblePageNumbers" 
                        :key="pageNum"
                        @click="changePage(pageNum - 1)"
                        :class="{ 'active': currentPage === pageNum - 1 }"
                        class="page-number">
                        {{ pageNum }}
                    </span>
                </div>
                <button 
                    @click="changePage(currentPage + 10)"
                    :disabled="currentPage + 10 >= totalPages"
                    class="page-button">
                    &gt;
                </button>
            </div>
        </div>

        <!-- 결재 상세 모달 -->
        <ApprovalDetailModal
            v-if="showDetailModal"
            :isOpen="showDetailModal"
            :approval="selectedApproval"
            @close="closeDetailModal"
            @refresh="handleRefresh"
            :isNotificationView="true"
        />

        <!-- 삭제 확인 모달 -->
        <div v-if="showDeleteConfirmModal" class="modal-overlay">
            <div class="modal-box">
                <div class="modal-header">
                    <h2 class="modal-title">알림 삭제</h2>
                </div>
                <div class="modal-content">
                    <p>선택한 알림을 삭제하시겠습니까?</p>
                </div>
                <div class="modal-footer">
                    <button @click="executeDelete" class="confirm-button">삭제</button>
                    <button @click="showDeleteConfirmModal = false" class="cancel-button">취소</button>
                </div>
            </div>
        </div>

        <!-- 읽음 처리 확인 모달 -->
        <div v-if="showReadConfirmModal" class="modal-overlay">
            <div class="modal-box">
                <div class="modal-header">
                    <h2 class="modal-title">알림 읽음 처리</h2>
                </div>
                <div class="modal-content">
                    <p>선택한 알림들을 모두 읽음 처리하시겠습니까?</p>
                </div>
                <div class="modal-footer">
                    <button @click="executeMarkAsRead" class="read-confirm-button">확인</button>
                    <button @click="showReadConfirmModal = false" class="cancel-button">취소</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/api/auth'
import ApprovalDetailModal from '@/components/approval/ApprovalDetailModal.vue'
import { useNotificationStore } from '@/stores/notification'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const notificationStore = useNotificationStore()
const authStore = useAuthStore()

// 스토어 디버깅
// console.log('Notification Store:', notificationStore)
// console.log('Store Methods:', Object.keys(notificationStore))
// console.log('Delete Notifications Function:', notificationStore.deleteNotifications)

const notifications = ref([])
const allNotifications = ref([]) // 모든 알림을 저장할 ref 추가
const currentPage = ref(0)
const totalPages = ref(1)
const showDetailModal = ref(false)
const selectedApproval = ref(null)
const showDeleteConfirmModal = ref(false)
const showReadConfirmModal = ref(false)
const filterStatus = ref('all')

const fetchNotifications = async (page) => {
    try {
        const response = await api.get(`/notification/list?page=${page}`, {
            headers: {
                'Authorization': `Bearer ${authStore.accessToken}`
            }
        })
        allNotifications.value = response.data
        
        // 프론트엔드에서 필터링 적용
        if (filterStatus.value === 'unread') {
            notifications.value = response.data.filter(n => !n.read)
        } else {
            notifications.value = response.data
        }
        
        notificationStore.unreadCount = response.data.filter(n => !n.read).length
    } catch (error) {
        // console.error('알림 목록을 불러오는데 실패했습니다:', error)
        // console.error('에러 상세:', error.response?.data || error.message)
    }
}

const changePage = (page) => {
    currentPage.value = page
    fetchNotifications(page)
}

const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return '-'
    
    const date = new Date(dateTimeString)
    return date.toLocaleString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    }).replace(/\. /g, '-').replace(/\./g, '').replace(',', '')
}

const handleNotificationClick = async (notification) => {
    // console.log('클릭된 알림 정보:', notification);
    try {
        // 읽지 않은 알림일 경우에만 읽음 처리
        if (!notification.read) {
            await notificationStore.markAsRead(notification.id)
            
            // allNotifications에서도 해당 알림을 읽음 상태로 변경
            const allIndex = allNotifications.value.findIndex(n => n.id === notification.id)
            if (allIndex !== -1) {
                allNotifications.value[allIndex].read = true
            }
            
            // 현재 표시된 notifications에서도 업데이트
            const index = notifications.value.findIndex(n => n.id === notification.id)
            if (index !== -1) {
                notifications.value[index].read = true
            }
            
            // "읽지 않음" 필터가 적용된 상태라면 해당 알림을 목록에서 제거
            if (filterStatus.value === 'unread') {
                notifications.value = notifications.value.filter(n => n.id !== notification.id)
            }
        }

        if (notification.url) {
            switch (notification.type) {
                case '공지사항':
                case '문의사항':
                    router.push(notification.url)
                    break
                case '결재': {
                    const approvalId = notification.url.split('/').pop()
                    const response = await api.get(`/approval/${approvalId}`, {
                        headers: {
                            'Authorization': `Bearer ${authStore.accessToken}`
                        }
                    })
                    selectedApproval.value = response.data
                    showDetailModal.value = true
                    break
                }
                default:
                    // 기타 알림 유형에 대한 기본 동작 (예: 라우팅)
                    if (notification.url) {
                        router.push(notification.url)
                    }
                    break
            }
        }
    } catch (error) {
        // console.error('알림 처리 중 오류 발생:', error)
        const errorMessage = error.response?.data || error.message
        // console.error('에러 상세:', errorMessage)

        if (errorMessage === '해당 결재를 찾을 수 없습니다.' || (error.response && error.response.status === 404)) {
            alert('연결된 문서를 찾을 수 없습니다. 이미 삭제되었을 수 있습니다.')
        } else {
            alert('알림을 처리하는 중 오류가 발생했습니다.')
        }
    }
}

const closeDetailModal = () => {
    showDetailModal.value = false
    selectedApproval.value = null
}

const handleRefresh = () => {
    // 모달에서 승인/반려 후 목록 새로고침
    fetchNotifications(currentPage.value)
}

const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    })
}

const isAllSelected = computed(() => {
    return notifications.value.length > 0 && selectedNotifications.value.length === notifications.value.length
})

const visiblePageNumbers = computed(() => {
    const startPage = Math.floor(currentPage.value / 10) * 10 + 1
    const endPage = Math.min(startPage + 9, totalPages.value)
    const pages = []
    
    for (let i = startPage; i <= endPage; i++) {
        pages.push(i)
    }
    
    return pages
})

const toggleSelectAll = (event) => {
    if (event.target.checked) {
        selectedNotifications.value = notifications.value.map(n => n.id)
    } else {
        selectedNotifications.value = []
    }
}

const confirmDelete = () => {
    if (selectedNotifications.value.length === 0) {
        alert('삭제할 알림을 선택해주세요.')
        return
    }
    showDeleteConfirmModal.value = true
}

const executeDelete = async () => {
    try {
        // console.log('삭제 실행 전:', selectedNotifications.value)
        // console.log('Store Methods:', Object.keys(notificationStore))
        // console.log('Delete Notifications Function:', notificationStore.deleteNotifications)
        
        if (typeof notificationStore.deleteNotifications !== 'function') {
            throw new Error('deleteNotifications 함수를 찾을 수 없습니다.')
        }
        
        await notificationStore.deleteNotifications(selectedNotifications.value)
        showDeleteConfirmModal.value = false
        selectedNotifications.value = []
        // 목록 새로고침
        fetchNotifications(currentPage.value)
    } catch (error) {
        // console.error('알림 삭제 중 오류 발생:', error)
        alert('알림 삭제에 실패했습니다.')
    }
}

const handleMarkAllAsRead = async () => {
    try {
        if (selectedNotifications.value.length === 0) {
            alert('읽음 처리할 알림을 선택해주세요.')
            return
        }

        // 선택된 알림들이 모두 이미 읽은 상태인지 확인
        const selectedNotificationObjects = allNotifications.value.filter(n => 
            selectedNotifications.value.includes(n.id)
        )
        
        const allAlreadyRead = selectedNotificationObjects.every(n => n.read)
        
        if (allAlreadyRead) {
            alert('선택하신 모든 알림은 이미 읽은 상태입니다.')
            return
        }

        showReadConfirmModal.value = true
    } catch (error) {
        console.error('읽음 처리 확인 중 오류 발생:', error)
        alert('읽음 처리 확인 중 오류가 발생했습니다.')
    }
}

const executeMarkAsRead = async () => {
    try {
        const auth = useAuthStore()
        await api.patch('/notification/read', selectedNotifications.value, {
            headers: {
                'Authorization': `Bearer ${auth.accessToken}`
            }
        })
        
        // 선택된 알림들을 읽음 상태로 변경 (allNotifications도 업데이트)
        allNotifications.value.forEach(notification => {
            if (selectedNotifications.value.includes(notification.id)) {
                notification.read = true
            }
        })
        
        // 필터링 상태에 따라 notifications 업데이트
        if (filterStatus.value === 'unread') {
            notifications.value = allNotifications.value.filter(n => !n.read)
        } else {
            notifications.value = allNotifications.value
        }
        
        // 선택 해제
        selectedNotifications.value = []
        
        // 모달 닫기
        showReadConfirmModal.value = false
    } catch (error) {
        console.error('선택된 알림을 읽음 처리하는 중 오류 발생:', error)
        alert('선택된 알림을 읽음 처리하는 중 오류가 발생했습니다.')
    }
}

const toggleNotificationSelection = (notificationId) => {
    const index = selectedNotifications.value.indexOf(notificationId)
    if (index === -1) {
        selectedNotifications.value.push(notificationId)
    } else {
        selectedNotifications.value.splice(index, 1)
    }
}

const handleFilterChange = () => {
    // 필터링 상태에 따라 목록 재로드
    if (filterStatus.value === 'unread') {
        notifications.value = allNotifications.value.filter(n => !n.read)
    } else {
        notifications.value = allNotifications.value
    }
}

const selectedNotifications = ref([])

onMounted(() => {
    fetchNotifications(0)
    // 알림 관리 페이지 진입 시 store의 알림 목록도 업데이트
    notificationStore.fetchNotifications()
})
</script>

<style lang="scss" scoped>
.notification-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
}

.notification-title {
    font-size: 24px;
    margin-bottom: 20px;
    color: #333;
    font-weight: 600;
}

.board-container {
    background: #fff;
    border-top: 1px solid #eee;
    border-bottom: 1px solid #eee;
    margin-bottom: 20px;
}

.board-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 14px;
    
    th, td {
        padding: 15px;
        text-align: left;
        border-bottom: 1px solid #eee;
    }

    th {
        background-color: #f8f9fa;
        font-weight: 600;
        color: #495057;
    }

    tbody tr {
        cursor: pointer;
        background-color: #ffffff;

        &:hover {
            background-color: #f8f9fa;
        }

        &.unread {
            background-color: #ffffff;
            
            .col-type, .col-content {
                font-weight: bold;
            }
            
            &:hover {
                background-color: #f8f9fa;
            }
        }

        &:not(.unread) {
            background-color: #ffffff;
            
            .col-type, .col-content {
                font-weight: normal;
            }
        }
    }

    .no-data {
        text-align: center;
        color: #6c757d;
        padding: 30px;
        background-color: #ffffff;
    }
}

.col-type {
    width: 10%;
}

.col-content {
    width: 60%;
}

.col-date {
    width: 20%;
}

.col-status {
    width: 15%;
    text-align: center;
}

.status-badge {
    display: inline-block;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
    background-color: #e9ecef;
    color: #495057;

    &.unread {
        background-color: #cce5ff;
        color: #004085;
    }
}

.pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 10px;
    margin-top: 20px;
}

.page-numbers {
    display: flex;
    gap: 4px;
}

.page-number {
    cursor: pointer;
    padding: 4px 8px;
    border: none;
    border-radius: 4px;
    color: #495057;
    font-size: 14px;
    font-weight: normal;
    background-color: transparent;

    &:hover {
        border: 1px solid #dee2e6;
    }

    &.active {
        background-color: transparent;
        font-weight: bold;
        color: #000000;
    }
}

.page-button {
    min-width: 32px;
    height: 32px;
    padding: 0 6px;
    border: none;
    background-color: transparent;
    color: #495057;
    font-size: 14px;
    cursor: pointer;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: normal;

    &:hover:not(:disabled) {
        background-color: transparent;
        border: 1px solid #dee2e6;
    }

    &:disabled {
        background-color: transparent;
        color: #adb5bd;
        cursor: not-allowed;
    }
}

.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    font-family: 'Noto Sans KR', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.modal-box {
    width: 500px;
    max-width: 90%;
    background: #ffffff;
    border-radius: 8px;
    padding: 0;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
    overflow: hidden;
    display: flex;
    flex-direction: column;
}

.modal-header {
    background: linear-gradient(135deg, #4A6741 0%, #8BA888 100%);
    color: white;
    padding: 20px 24px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #e0e0e0;
}

.modal-title {
    font-size: 18px;
    font-weight: 600;
    margin: 0;
    color: white;
}

.modal-content {
    padding: 24px;
    overflow-y: auto;
    flex: 1;
}

.modal-footer {
    padding: 15px 20px;
    border-top: 1px solid #eee;
    text-align: right;
    display: flex;
    justify-content: flex-end;
    gap: 8px;

    .confirm-button {
        padding: 8px 20px;
        background-color: #e53935;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
        font-weight: 500;
        transition: background-color 0.2s;

        &:hover {
            background-color: #c62828;
        }
    }

    .read-confirm-button {
        padding: 8px 20px;
        background-color: #28a745;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
        font-weight: 500;
        transition: background-color 0.2s;

        &:hover {
            background-color: #218838;
        }
    }

    .cancel-button {
        padding: 8px 20px;
        background-color: #adb5bd;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
        font-weight: 500;
        transition: background-color 0.2s;

        &:hover {
            background-color: #9fa6b1;
        }
    }
}

.board-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
}

.filter-options {
    display: flex;
    align-items: center;
}

.action-buttons {
    display: flex;
    gap: 8px;
}

.delete-button {
    padding: 8px 16px;
    background-color: #dc3545;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;

    &:hover:not(:disabled) {
        background-color: #c82333;
    }

    &:disabled {
        background-color: #e9ecef;
        color: #6c757d;
        cursor: not-allowed;
    }
}

.mark-all-read-button {
    padding: 8px 16px;
    background-color: #4a90e2;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;

    &:hover:not(:disabled) {
        background-color: #357abd;
    }

    &:disabled {
        background-color: #e9ecef;
        color: #6c757d;
        cursor: not-allowed;
    }
}

.delete-mode-buttons {
    display: flex;
    gap: 8px;
}

.col-checkbox {
    width: 40px;
    text-align: center;
}

.bottom-actions {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 20px;
    padding: 15px 0;
}

.filter-select {
    padding: 8px 12px;
    border: 1px solid #dee2e6;
    border-radius: 4px;
    background-color: white;
    font-size: 14px;
    color: #495057;
    cursor: pointer;
    outline: none;
    
    &:hover {
        border-color: #adb5bd;
    }
}
</style>