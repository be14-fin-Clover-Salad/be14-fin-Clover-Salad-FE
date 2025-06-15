<template>
    <div class="notification-container">
        <div class="board-container">
            <table class="board-table">
                <thead>
                    <tr>
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
                        <td colspan="4" class="no-data">등록된 알림이 없습니다.</td>
                    </tr>
                </tbody>
            </table>
        </div>
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

        <!-- 결재 상세 모달 -->
        <ApprovalDetailModal
            v-if="showDetailModal"
            :isOpen="showDetailModal"
            :approval="selectedApproval"
            @close="closeDetailModal"
            @refresh="handleRefresh"
            :isNotificationView="true"
        />
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/api/auth'
import ApprovalDetailModal from '@/components/approval/ApprovalDetailModal.vue'
import { useNotificationStore } from '@/stores/notification'

const router = useRouter()
const notificationStore = useNotificationStore()
const notifications = ref([])
const currentPage = ref(0)
const totalPages = ref(1)
const showDetailModal = ref(false)
const selectedApproval = ref(null)

const fetchNotifications = async (page) => {
    try {
        console.log(`알림 목록 요청 - 페이지: ${page}`)
        const response = await api.get(`/notification/list?page=${page}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('access_token')}`
            }
        })
        console.log('알림 목록 응답:', response.data)
        notifications.value = response.data
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
    try {
        // notification store의 markAsRead 함수 사용
        await notificationStore.markAsRead(notification.id)
        
        // 알림 목록에서 해당 알림의 read 상태 업데이트
        const index = notifications.value.findIndex(n => n.id === notification.id)
        if (index !== -1) {
            notifications.value[index].read = true
        }

        // 알림 타입에 따라 해당 페이지로 라우팅
        if (notification.url) {
            // URL에서 결재 ID 추출 (예: /approval/1 -> 1)
            const approvalId = notification.url.split('/').pop()
            
            // 결재 상세 정보 가져오기
            const response = await api.get(`/approval/${approvalId}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                }
            })
            
            // 모달에 데이터 표시
            selectedApproval.value = response.data
            showDetailModal.value = true
        }
    } catch (error) {
        console.error('알림 처리 중 오류 발생:', error)
        console.error('에러 상세:', error.response?.data || error.message)
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
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    margin-bottom: 20px;
}

.board-table {
    width: 100%;
    border-collapse: collapse;
    
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
            background-color: #f8f9fa;
            
            .col-type, .col-content {
                font-weight: normal;
            }
        }
    }

    .no-data {
        text-align: center;
        color: #6c757d;
        padding: 30px;
    }
}

.col-type {
    width: 15%;
}

.col-content {
    width: 55%;
}

.col-date {
    width: 20%;
}

.col-status {
    width: 10%;
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

    .confirm-button {
        padding: 8px 20px;
        background-color: #007bff;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;

        &:hover {
            background-color: #0056b3;
        }
    }
}
</style>