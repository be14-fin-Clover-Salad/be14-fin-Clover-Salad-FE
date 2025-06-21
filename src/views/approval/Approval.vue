<template>
  <section>
    <!-- 검색 필터 -->
    <SearchFilterShell :initial="searchForm" @search="handleSearch" @reset="handleReset">
      <template #fields="{ filters }">
        <ApprovalSearchFields :filters="filters" />
      </template>
    </SearchFilterShell>

    <!-- 테이블 -->
    <div class="table-wrapper">
      <BaseDataTable
        :columns="columns"
        :rows="filteredRows"
        :isLoading="isLoading"
        @row-click="handleRowClick"
        @register-click="handleRegisterClick"
      />
    </div>

    <!-- 상세보기 모달 -->
    <ApprovalDetailModal
      :isOpen="showDetailModal"
      :approval="selectedApproval"
      @close="showDetailModal = false"
      @refresh="handleRefresh"
    />
  </section>
</template>

<script setup>
import { reactive, ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import api from '@/api/auth'
import { useAuthStore } from '@/stores/auth'
import BaseDataTable from '@/components/BaseDataTable.vue'
import SearchFilterShell from '@/components/common/SearchFilterShell.vue'
import ApprovalSearchFields from '@/components/approval/ApprovalSearchFields.vue'
import ApprovalDetailModal from '@/components/approval/ApprovalDetailModal.vue'

const route = useRoute()

// 검색 폼 초기값
const searchForm = reactive({
  approvalCode: '',
  title: '',
  content: '',
  status: '',
  contractCode: '',
  requestDateStart: '',
  requestDateEnd: '',
  approvalDateStart: '',
  approvalDateEnd: '',
  requester: '',
  approver: '',
  comment: ''
})

// 테이블 데이터 (초기 빈 배열, API 호출로 데이터 로드)
const rows = reactive([])

const isLoading = ref(false)
const showDetailModal = ref(false)
const selectedApproval = ref(null)

// 마지막 검색 조건 저장
let lastSearchData = null

// 날짜 형식 변환 함수
const formatDateTime = (dateTimeString) => {
  if (!dateTimeString) return '-'
  
  // ISO 형식 (2025-06-12T13:10:11)을 YYYY-MM-DD HH:mm:ss 형식으로 변환
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

// 컬럼 정의
const columns = [
  { label: '결재 코드', key: 'code', width: '130px' },
  { label: '결재 제목', key: 'title', width: '150px' },
  { label: '결재 내용', key: 'content', width: '200px' },
  { label: '결재 요청 일시', key: 'reqDate', width: '150px' },
  { label: '결재 일시', key: 'aprvDate', width: '150px' },
  { label: '결재 상태', key: 'state', width: '100px' },
  { label: '결재 코멘트', key: 'comment', width: '200px' },
  { label: '요청 담당자', key: 'reqName', width: '120px' },
  { label: '승인 담당자', key: 'aprvName', width: '120px' },
  { label: '계약 코드', key: 'contractCode', width: '130px' }
]

// 필터링된 데이터 (현재는 전체 데이터 반환, 추후 API 연동 시 수정)
const filteredRows = computed(() => {
  return rows
})

// 이벤트 핸들러
async function handleSearch(data) {
  lastSearchData = data // 검색 조건 저장
  
  const authStore = useAuthStore()
  const token = authStore.accessToken
  
  // API 요청용 데이터 변환
  const requestBody = {
    code: data.approvalCode || "",
    title: data.title || "",
    content: data.content || "",
    reqDateFrom: data.requestDateStart || null,
    reqDateTo: data.requestDateEnd || null,
    aprvDateFrom: data.approvalDateStart || null,
    aprvDateTo: data.approvalDateEnd || null,
    state: data.status || "",
    comment: data.comment || "",
    reqName: data.requester || "",
    aprvName: data.approver || "",
    contractCode: data.contractCode || ""
  }
  

  
  try {
    isLoading.value = true
    const response = await api.post('/approval/search', requestBody, {
      headers: {
        Authorization: `Bearer ${token}`
      },
      withCredentials: true
    })
    
    // 검색 결과로 테이블 데이터 업데이트
    let dataArray = []
    if (Array.isArray(response.data)) {
      dataArray = response.data
    } else if (response.data.data && Array.isArray(response.data.data)) {
      dataArray = response.data.data
    } else {
      rows.splice(0, rows.length)
      return
    }
    

    
    // 날짜 형식 변환
    const formattedData = dataArray.map(item => ({
      ...item,
      reqDate: formatDateTime(item.reqDate),
      aprvDate: formatDateTime(item.aprvDate)
    }))
    
    rows.splice(0, rows.length, ...formattedData)
    
  } catch (error) {
    alert(`검색 중 오류가 발생했습니다: ${error.message}`)
  } finally {
    isLoading.value = false
  }
}

function handleReset() {
  Object.keys(searchForm).forEach(key => searchForm[key] = '')
  lastSearchData = null
}

function handleRowClick(row) {
  selectedApproval.value = row
  showDetailModal.value = true
}

function handleRegisterClick() {
  // 등록 모달 등의 로직
}

function handleRefresh() {
  // 승인/반려 후 마지막 검색 조건으로 다시 검색
  if (lastSearchData) {
    handleSearch(lastSearchData)
  }
}

// 라우터 쿼리 파라미터 감시 - approvalId 값 변경을 직접 감시
watch(() => route.query.approvalId, async (newApprovalId, oldApprovalId) => {
    if (route.query.showDetail === 'true' && newApprovalId && newApprovalId !== oldApprovalId) {
        try {
            const authStore = useAuthStore()
            const response = await api.get(`/approval/${newApprovalId}`, {
                headers: {
                    'Authorization': `Bearer ${authStore.accessToken}`
                }
            })
            selectedApproval.value = response.data
            showDetailModal.value = true
        } catch (error) {
            console.error('결재 상세 정보를 불러오는데 실패했습니다:', error)
        }
    }
}, { immediate: true })
</script>

<style lang="scss" scoped>
section {
  padding: 20px;
}

.table-wrapper {
  margin-top: 24px;
  overflow-x: auto;
}
</style>