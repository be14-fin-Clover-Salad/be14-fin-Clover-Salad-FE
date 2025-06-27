<template>
  <div class="pagination">
    <!-- 처음 페이지 이동 버튼 -->
    <button @click="goFirst" :disabled="currentPage === 1">≪</button>

    <!-- 이전 페이지 -->
    <button @click="prev" :disabled="currentPage === 1"><</button>

    <!-- 페이지 번호 목록 -->
    <button
      v-for="page in visiblePages"
      :key="page"
      @click="$emit('update:currentPage', page)"
      :class="{ active: page === currentPage }"
    >
      {{ page }}
    </button>

    <!-- 다음 페이지 -->
    <button @click="next" :disabled="currentPage === totalPages">></button>

    <!-- 마지막 페이지 이동 버튼 -->
    <button @click="goLast" :disabled="currentPage === totalPages">≫</button>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  total: Number,
  pageSize: Number,
  currentPage: Number
})

const emit = defineEmits(['update:currentPage'])

const totalPages = computed(() => Math.ceil(props.total / props.pageSize))

// 최대 10개 페이지 노출
const visiblePages = computed(() => {
  const total = totalPages.value
  const maxVisible = 10
  const current = props.currentPage

  let start = Math.max(1, current - Math.floor(maxVisible / 2))
  let end = start + maxVisible - 1

  if (end > total) {
    end = total
    start = Math.max(1, end - maxVisible + 1)
  }

  const pages = []
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  return pages
})

const prev = () => {
  if (props.currentPage > 1) emit('update:currentPage', props.currentPage - 1)
}

const next = () => {
  if (props.currentPage < totalPages.value) emit('update:currentPage', props.currentPage + 1)
}

const goFirst = () => emit('update:currentPage', 1)
const goLast = () => emit('update:currentPage', totalPages.value)
</script>

<style scoped>
.pagination {
  display: flex;
  justify-content: center;
  gap: 6px;
  margin-top: 16px;
}

button {
  padding: 6px 10px;
  border: 1px solid #ccc;
  background-color: white;
  cursor: pointer;
  min-width: 32px;
  color: #333;
  transition: all 0.2s ease;
}

button.active {
  background-color: #b6df91;
  font-weight: bold;
}

button:disabled {
  opacity: 0.5;
  pointer-events: none;
}
</style>
