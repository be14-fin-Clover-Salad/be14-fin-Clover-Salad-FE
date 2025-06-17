<template>
  <section>
    <!-- 검색 필터 -->
    <SearchFilterShell :initial="searchForm" @search="handleSearch" @reset="handleReset">
      <template #fields="{ filters }">
        <ContractTemplateSearchFields :filters="filters" />
      </template>
    </SearchFilterShell>

    <!-- 테이블 -->
    <div class="table-wrapper">
      <BaseDataTable :columns="columns" :rows="rows" :isLoading="isLoading" :selectedCode="selectedRowCode"
        @row-click="handleRowClick" @row-dblclick="handleRowDblClick" />
    </div>

    <!-- 버튼 영역 -->
    <div class="action-buttons">
      <button class="register-btn" @click="showUploadModal = true">등록</button>
      <button class="edit-btn" :disabled="!selectedTemplate" @click="handleEdit">수정</button>
      <button class="delete-btn" :disabled="!selectedTemplate" @click="handleDelete">삭제</button>
    </div>

    <!-- 업로드 모달 -->
    <ContractTemplateUploadModal :isOpen="showUploadModal" :editMode="!!selectedTemplate"
      :initialData="selectedTemplate" @close="showUploadModal = false" @upload-success="handleUploadSuccess" />

    <!-- 상세 모달 -->
    <ContractTemplateDetailModal v-if="selectedTemplate" :isOpen="showDetailModal" :template="selectedTemplate"
      @close="showDetailModal = false" />
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

const searchForm = reactive({
  name: '',
  version: '',
  createdAtStart: '',
  createdAtEnd: ''
})

const rows = reactive([])
const isLoading = ref(false)
const showUploadModal = ref(false)
const showDetailModal = ref(false)
const selectedTemplate = ref(null)
const selectedRowCode = ref(null)

async function handleSearch(data) {
  const token = useAuthStore().accessToken
  try {
    isLoading.value = true
    const response = await api.post('/api/query/documentTemplate/search', data, {
      headers: { Authorization: `Bearer ${token}` },
      withCredentials: true
    })
    rows.splice(0, rows.length, ...response.data)
  } catch (error) {
    console.error('검색 실패:', error)
  } finally {
    isLoading.value = false
  }
}

function handleReset() {
  Object.keys(searchForm).forEach(key => searchForm[key] = '')
}

function handleUploadSuccess(templateData) {
  selectedTemplate.value = templateData
  showUploadModal.value = false
  handleSearch({ ...searchForm })
  showDetailModal.value = true
}

function handleRowClick(template) {
  selectedRowCode.value = template.id
  selectedTemplate.value = template
}

function handleRowDblClick(template) {
  selectedTemplate.value = template
  showDetailModal.value = true
}

async function handleEdit() {
  if (!selectedTemplate.value) return
  try {
    const token = useAuthStore().accessToken
    const response = await api.get(`/api/query/documentTemplate/${selectedTemplate.value.id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    selectedTemplate.value = response.data
    showUploadModal.value = true
  } catch (err) {
    alert('수정 불러오기 실패')
    console.error(err)
  }
}

async function handleDelete() {
  if (!selectedTemplate.value) return
  if (!confirm('정말 삭제하시겠습니까?')) return
  try {
    const token = useAuthStore().accessToken
    await api.delete(`/api/command/documentTemplate/${selectedTemplate.value.id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    alert('삭제 완료')
    selectedTemplate.value = null
    handleSearch({ ...searchForm })
  } catch (err) {
    alert('삭제 실패')
    console.error(err)
  }
}

const columns = [
  { label: '양식명', key: 'name', width: '150px' },
  { label: '버전', key: 'version', width: '100px' },
  { label: '등록일', key: 'createdAt', width: '150px' },
  { label: '비고', key: 'note', width: '200px' }
]
</script>

<style scoped>
section {
  padding: 20px;
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
  background-color: #6c87c1;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 8px 16px;
  font-size: 14px;
  cursor: pointer;
}

.edit-btn {
  background-color: #ffc107;
  color: #000;
}

.delete-btn {
  background-color: #f44336;
}

.edit-btn:disabled,
.delete-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
  color: #666;
}
</style>