<!-- File: src/views/contractTemplate/ContractTemplateView.vue -->
<template>
  <section>
    <!-- 검색 필터 -->
    <SearchFilterShell
      :initial="searchForm"
      :showToggle="false"
      @search="handleSearch"
      @reset="handleReset"
    >
      <template #fields="{ filters }">
        <ContractTemplateSearchFields :filters="filters" />
      </template>
    </SearchFilterShell>

    <!-- 테이블 -->
    <div class="table-wrapper">
      <BaseDataTable
        :columns="columns"
        :rows="rows"
        :isLoading="isLoading"
        :selectedCode="selectedRowCode"
        @row-click="handleRowClick"
        @row-dblclick="handleRowDblClick"
      >
        <!-- 등록일 포맷 적용 -->
        <template #cell-createdAt="{ row }">
          {{ row.createdAtFormatted }}
        </template>
      </BaseDataTable>
    </div>

    <!-- 버튼 영역 -->
    <div class="action-buttons">
      <button class="register-btn" @click="openCreateModal">등록</button>
      <button class="edit-btn" :disabled="!selectedTemplate" @click="handleEdit">수정</button>
      <button class="delete-btn" :disabled="!selectedTemplate" @click="handleDelete">삭제</button>
    </div>

    <!-- 업로드/수정 모달 -->
    <ContractTemplateUploadModal
      :isOpen="showUploadModal"
      :editMode="!!selectedTemplate"
      :initialData="selectedTemplate"
      @close="closeUploadModal"
      @upload-success="handleUploadSuccess"
    />

    <!-- 상세 모달 -->
    <ContractTemplateDetailModal
      v-if="showDetailModal"
      :isOpen="showDetailModal"
      :template="selectedTemplate"
      @close="closeDetailModal"
    />
  </section>
</template>

<script setup>
import { reactive, ref } from 'vue'
import api from '@/api/auth'
import { useAuthStore } from '@/stores/auth'
import BaseDataTable from '@/components/BaseDataTable.vue'
import SearchFilterShell from '@/components/common/SearchFilterShell.vue'
import ContractTemplateSearchFields from '@/views/contractTemplate/ContractTemplateSearchFields.vue'
import ContractTemplateUploadModal from '@/views/contractTemplate/ContractTemplateUploadModal.vue'
import ContractTemplateDetailModal from '@/views/contractTemplate/ContractTemplateDetailModal.vue'

// 검색 폼 상태
const searchForm = reactive({
  name: '',
  version: '',
  createdAtStart: '',
  createdAtEnd: ''
})

// 테이블 데이터 및 UI 상태
const rows = ref([])
const isLoading = ref(false)
const showUploadModal = ref(false)
const showDetailModal = ref(false)
const selectedTemplate = ref(null)
const selectedRowCode = ref(null)

// 테이블 칼럼 정의
const columns = [
  { label: '양식명', key: 'name', width: '150px' },
  { label: '버전', key: 'version', width: '100px' },
  { label: '등록일', key: 'createdAt', width: '150px' },
  { label: '비고', key: 'note', width: '200px' }
]

// 등록버튼 클릭: 신규 등록 모드로 전환
function openCreateModal() {
  selectedTemplate.value = null
  selectedRowCode.value = null
  showUploadModal.value = true
}

// 검색 수행
async function handleSearch(data) {
  const token = useAuthStore().accessToken
  isLoading.value = true
  try {
    const res = await api.post('/api/query/documentTemplate/search', data, {
      headers: { Authorization: `Bearer ${token}` },
      withCredentials: true
    })
    // 등록일 포맷 필드 추가
    rows.value = res.data.map(item => ({
      ...item,
      createdAtFormatted: formatDateTime(item.createdAt)
    }))
  } catch (e) {
    console.error('검색 실패:', e)
  } finally {
    isLoading.value = false
  }
}

// 검색 초기화
function handleReset() {
  Object.keys(searchForm).forEach(key => searchForm[key] = '')
}

// 행 선택
function handleRowClick(template) {
  selectedRowCode.value = template.id
  selectedTemplate.value = template
}
function handleRowDblClick(template) {
  selectedTemplate.value = template
  showDetailModal.value = true
}

// 수정 모드
async function handleEdit() {
  if (!selectedTemplate.value) return
  const token = useAuthStore().accessToken
  try {
    const res = await api.get(
      `/api/query/documentTemplate/${selectedTemplate.value.id}`,
      { headers: { Authorization: `Bearer ${token}` }, withCredentials: true }
    )
    selectedTemplate.value = res.data
    showUploadModal.value = true
  } catch (e) {
    alert('수정 불러오기 실패')
    console.error(e)
  }
}

// 삭제
async function handleDelete() {
  if (!selectedTemplate.value) return
  if (!confirm('정말 삭제하시겠습니까?')) return
  const token = useAuthStore().accessToken
  try {
    await api.delete(
      `/api/command/documentTemplate/${selectedTemplate.value.id}`,
      { headers: { Authorization: `Bearer ${token}` }, withCredentials: true }
    )
    alert('삭제 완료')
    selectedTemplate.value = null
    handleSearch({ ...searchForm })
  } catch (e) {
    alert('삭제 실패')
    console.error(e)
  }
}

// 모달 닫기
function closeUploadModal() {
  showUploadModal.value = false
}
function closeDetailModal() {
  showDetailModal.value = false
}

// 날짜/시간 포맷 함수
function formatDateTime(val) {
  if (!val) return ''
  return new Date(val).toLocaleString('ko-KR', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
  })
}
</script>

<style scoped>
section { padding: 20px; }

::v-deep(.data-table) {
  width: 100%;
  table-layout: auto;
}

.table-wrapper {
  margin-top: 24px;
  overflow-x: auto;
}

.action-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 16px;
}

.register-btn,
.edit-btn,
.delete-btn {
  padding: 8px 16px;
  font-size: 14px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}
.register-btn { background-color: #6c87c1; color: white; }
.edit-btn     { background-color: #ffc107; color: #000; }
.delete-btn   { background-color: #f44336; color: white; }

.register-btn:disabled,
.edit-btn:disabled,
.delete-btn:disabled {
  background-color: #ccc;
  color: #666;
  cursor: not-allowed;
}
</style>
