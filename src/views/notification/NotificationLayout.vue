<template>
    <div class="notification-container">
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
                        <td class="col-checkbox">
                            <input 
                                type="checkbox" 
                                v-model="selectedNotifications" 
                                :value="notification.id"
                                @click.stop
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
                    v-for="page in totalPages" 
                    :key="page"
                    @click="changePage(page - 1)"
                    :class="{ 'active': currentPage === page - 1 }"
                    class="page-button">
                    {{ page }}
                </button>
            </div>
            
            <div class="delete-actions">
                <button 
                    @click="confirmDelete" 
                    class="delete-button"
                    :disabled="selectedNotifications.length === 0">
                    삭제
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
            <div class="modal-content">
                <div class="modal-header">
                    <h3>알림 삭제</h3>
                </div>
                <div class="modal-body">
                    <p>선택한 알림을 삭제하시겠습니까?</p>
                </div>
                <div class="modal-footer">
                    <button @click="executeDelete" class="confirm-button">삭제</button>
                    <button @click="showDeleteConfirmModal = false" class="cancel-button">취소</button>
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
console.log('Notification Store:', notificationStore)
console.log('Store Methods:', Object.keys(notificationStore))
console.log('Delete Notifications Function:', notificationStore.deleteNotifications)

const notifications = ref([])
const currentPage = ref(0)
const totalPages = ref(1)
const showDetailModal = ref(false)
const selectedApproval = ref(null)
const showDeleteConfirmModal = ref(false)

const fetchNotifications = async (page) => {
    try {
        const response = await api.get(`/notification/list?page=${page}`, {
            headers: {
                'Authorization': `Bearer ${authStore.accessToken}`
            }
        })
        notifications.value = response.data
        notificationStore.unreadCount = response.data.filter(n => !n.read).length
    } catch (error) {
        console.error('알림 목록을 불러오는데 실패했습니다:', error)
        console.error('에러 상세:', error.response?.data || error.message)
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
    console.log('클릭된 알림 정보:', notification);
    try {
        // 읽지 않은 알림일 경우에만 읽음 처리
        if (!notification.read) {
            await notificationStore.markAsRead(notification.id)
            const index = notifications.value.findIndex(n => n.id === notification.id)
            if (index !== -1) {
                notifications.value[index].read = true
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
        console.error('알림 처리 중 오류 발생:', error)
        const errorMessage = error.response?.data || error.message
        console.error('에러 상세:', errorMessage)

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
        console.log('삭제 실행 전:', selectedNotifications.value)
        console.log('Store Methods:', Object.keys(notificationStore))
        console.log('Delete Notifications Function:', notificationStore.deleteNotifications)
        
        if (typeof notificationStore.deleteNotifications !== 'function') {
            throw new Error('deleteNotifications 함수를 찾을 수 없습니다.')
        }
        
        await notificationStore.deleteNotifications(selectedNotifications.value)
        showDeleteConfirmModal.value = false
        selectedNotifications.value = []
        // 목록 새로고침
        fetchNotifications(currentPage.value)
    } catch (error) {
        console.error('알림 삭제 중 오류 발생:', error)
        alert('알림 삭제에 실패했습니다.')
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
        transition: background-color 0.2s;
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
    width: 15%;
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
    gap: 5px;
    margin-top: 20px;

    .page-button {
        min-width: 32px;
        height: 32px;
        padding: 0 6px;
        border: 1px solid #dee2e6;
        background-color: white;
        color: #495057;
        font-size: 14px;
        cursor: pointer;
        border-radius: 4px;
        display: flex;
        align-items: center;
        justify-content: center;

        &:hover {
            background-color: #e9ecef;
            border-color: #dee2e6;
        }

        &.active {
            background-color: #007bff;
            color: white;
            border-color: #007bff;
        }
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
}

.modal-content {
    background-color: white;
    border-radius: 8px;
    width: 500px;
    max-width: 90%;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.modal-header {
    padding: 20px;
    border-bottom: 1px solid #eee;
    display: flex;
    justify-content: space-between;
    align-items: center;

    h3 {
        margin: 0;
        color: #333;
        font-size: 18px;
    }

    .close-button {
        background: none;
        border: none;
        font-size: 24px;
        color: #666;
        cursor: pointer;
        padding: 0;
        line-height: 1;
    }
}

.modal-body {
    padding: 20px;

    .notification-content {
        margin: 0 0 15px 0;
        color: #333;
        font-size: 16px;
        line-height: 1.5;
    }

    .notification-date {
        margin: 0;
        color: #666;
        font-size: 14px;
    }
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

        &:hover {
            background-color: #c62828;
        }
    }

    .cancel-button {
        padding: 8px 20px;
        background-color: #6c757d;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;

        &:hover {
            background-color: #5a6268;
        }
    }
}

.board-header {
    display: flex;
    justify-content: flex-end;
    padding: 10px 15px;
    border-bottom: 1px solid #eee;
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

.delete-mode-buttons {
    display: flex;
    gap: 8px;
}

.confirm-button {
    padding: 8px 16px;
    background-color: #a6ce39;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;

    &:hover {
        background-color: #94b933;
    }
}

.cancel-button {
    padding: 8px 16px;
    background-color: #6c757d;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;

    &:hover {
        background-color: #5a6268;
    }
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
    position: relative;
}

.delete-actions {
    display: flex;
    gap: 8px;
    position: absolute;
    right: 0;
}
</style>