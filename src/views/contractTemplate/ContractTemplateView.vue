<template>
  <section>
    <!-- 검색 필터 -->
    <SearchFilterShell :initial="searchForm" :showToggle="false" @search="handleSearch" @reset="handleReset">
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
        <template #cell-createdAt="{ row }">
          {{ row.createdAtFormatted }}
        </template>
      </BaseDataTable>
    </div>

    <!-- 버튼 영역 -->
    <div class="action-buttons" v-if="isAdmin">
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
import { reactive, ref, onMounted, computed } from 'vue'
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
  createdAtEnd: '',
  description: ''
})

// 테이블 데이터 / UI 상태
const rows = ref([])
const isLoading = ref(false)
const showUploadModal = ref(false)
const showDetailModal = ref(false)
const selectedTemplate = ref(null)
const selectedRowCode = ref(null)

// 권한 체크
const authStore = useAuthStore()
const isAdmin = computed(() => authStore.userLevel === '관리자')

// 칼럼 정의
const columns = [
  { label: '양식명', key: 'name', width: '150px' },
  { label: '버전', key: 'version', width: '100px' },
  { label: '등록일', key: 'createdAtFormatted', width: '150px' },
  { label: '비고', key: 'description', width: '200px' }
]

// 마운트 시 한 번만 실행
onMounted(() => {
  handleSearch({ ...searchForm })
})

function openCreateModal() {
  selectedTemplate.value = null
  selectedRowCode.value = null
  showUploadModal.value = true
}

async function handleSearch(data) {
  isLoading.value = true
  try {
    const token = authStore.accessToken
    const res = await api.post('/api/query/documentTemplate/search', data, {
      headers: { Authorization: `Bearer ${token}` },
      withCredentials: true
    })
    rows.value = res.data.map(item => ({
      ...item,
      createdAtFormatted: new Date(item.createdAt).toLocaleString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      })
    }))
  } catch (e) {
    console.error('검색 실패:', e)
  } finally {
    isLoading.value = false
  }
}

function handleReset() {
  Object.keys(searchForm).forEach(key => (searchForm[key] = ''))
}

function handleRowClick(t) {
  selectedRowCode.value = t.id
  selectedTemplate.value = t
}

function handleRowDblClick(t) {
  selectedTemplate.value = {
    ...t,
    uploadFilePath: t.uploadFilePath,
    thumbnailPath: t.thumbnailPath
  }
  showDetailModal.value = true
}

async function handleEdit() {
  if (!selectedTemplate.value) return
  try {
    const token = authStore.accessToken
    const res = await api.get(`/api/query/documentTemplate/${selectedTemplate.value.id}`, {
      headers: { Authorization: `Bearer ${token}` },
      withCredentials: true
    })
    selectedTemplate.value = res.data
    showUploadModal.value = true
  } catch {
    alert('수정 불러오기 실패')
  }
}

async function handleDelete() {
  if (!selectedTemplate.value) return
  if (!confirm('삭제하시겠습니까?')) return
  try {
    const token = authStore.accessToken
    await api.delete(`/api/command/documentTemplate/${selectedTemplate.value.id}`, {
      headers: { Authorization: `Bearer ${token}` },
      withCredentials: true
    })
    alert('삭제 완료')
    selectedTemplate.value = null
    await handleSearch({ ...searchForm })
  } catch {
    alert('삭제 실패')
  }
}

async function handleUploadSuccess(uploadResp) {
  showUploadModal.value = false
  await handleSearch({ ...searchForm })

  const templateId = uploadResp?.id ?? selectedTemplate.value?.id

  try {
    const token = authStore.accessToken
    const { data: dto } = await api.get(`/api/query/documentTemplate/${templateId}`, {
      headers: { Authorization: `Bearer ${token}` },
      withCredentials: true
    })

    selectedTemplate.value = {
      id: dto.id,
      name: dto.name,
      description: dto.description,
      version: dto.version,
      createdAt: dto.createdAt,
      uploadFilePath: dto.uploadFilePath, // S3 PDF URL
      thumbnailPath: dto.thumbnailPath // S3 썸네일 URL
      // note 필드가 있다면 추가로 넣으세요: note: dto.note
    }

    selectedRowCode.value = templateId
    showDetailModal.value = true
  } catch (e) {
    console.error('상세 조회 실패:', e)
    alert('정상 등록/수정되었으나 상세 정보를 불러오지 못했습니다.')
  }
}

function closeUploadModal() {
  showUploadModal.value = false
}
function closeDetailModal() {
  showDetailModal.value = false
}
</script>

<style scoped>
section {
  padding: 20px;
}

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

.register-btn {
  background: #6c87c1;
  color: #fff;
}

.edit-btn {
  background: #ffc107;
  color: #000;
}

.delete-btn {
  background: #f44336;
  color: #fff;
}

.register-btn:disabled,
.edit-btn:disabled,
.delete-btn:disabled {
  background: #ccc;
  color: #666;
  cursor: not-allowed;
}
</style>
