<template>
  <div class="pagination">
    <button @click="prev" :disabled="currentPage === 1">‹</button>

    <button
      v-for="page in totalPages"
      :key="page"
      @click="$emit('update:currentPage', page)"
      :class="{ active: page === currentPage }"
    >
      {{ page }}
    </button>

    <button @click="next" :disabled="currentPage === totalPages">›</button>
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

const prev = () => {
  if (props.currentPage > 1) emit('update:currentPage', props.currentPage - 1)
}

const next = () => {
  if (props.currentPage < totalPages.value) emit('update:currentPage', props.currentPage + 1)
}
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
}

button.active {
  background-color: #b6df91;
  font-weight: bold;
}

button:disabled {
  color: #ccc;
  cursor: not-allowed;
}
</style>
