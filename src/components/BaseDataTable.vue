<template>
  <div class="table-wrapper">
    <div class="table-header">
      <div class="summary">
        총 {{ rows.length }}건
        <span class="info-badge" @mouseover="showTooltip = true" @mouseleave="showTooltip = false">
          <span class="i">i</span>
        </span>
        <div v-if="showTooltip" class="tooltip">
          각 컬럼 헤더를 클릭하면<br />오름차순/내림차순 정렬이 가능합니다.
        </div>
      </div>
    </div>

    <div class="table-scroll">
      <table class="data-table">
        <thead>
          <tr>
            <th
              v-for="col in columns"
              :key="col.key"
              @click="toggleSort(col.key)"
              class="sortable"
            >
              <span class="label">{{ col.label }}</span>
              <span class="sort-icons" v-if="sortState.key === col.key">
                <span class="arrow up" :class="{ active: sortState.order === 'asc' }">▲</span>
                <span class="arrow down" :class="{ active: sortState.order === 'desc' }">▼</span>
              </span>
            </th>
          </tr>
        </thead>

        <tbody v-if="isLoading">
          <tr v-for="n in 10" :key="n">
            <td v-for="col in columns" :key="col.key">
              <div class="skeleton"></div>
            </td>
          </tr>
        </tbody>

        <tbody v-else-if="sortedRows.length">
          <tr v-for="(row, rowIndex) in sortedRows" :key="rowIndex">
            <td v-for="col in columns" :key="col.key">
              {{ row[col.key] || '-' }}
            </td>
          </tr>
        </tbody>

        <tbody v-else>
          <tr>
            <td :colspan="columns.length" class="empty-msg">
              조회된 데이터가 없습니다.
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  columns: { type: Array, required: true },
  rows: { type: Array, required: true },
  isLoading: { type: Boolean, default: false }
})

const sortState = ref({ key: null, order: null })
const showTooltip = ref(false)

function toggleSort(key) {
  if (sortState.value.key !== key) {
    sortState.value = { key, order: 'asc' }
  } else if (sortState.value.order === 'asc') {
    sortState.value.order = 'desc'
  } else {
    sortState.value = { key: null, order: null }
  }
}

const sortedRows = computed(() => {
  const { key, order } = sortState.value
  if (!key || !order) return props.rows

  return [...props.rows].sort((a, b) => {
    const aVal = a[key] ?? ''
    const bVal = b[key] ?? ''

    if (!isNaN(aVal) && !isNaN(bVal)) return order === 'asc' ? aVal - bVal : bVal - aVal
    const aDate = new Date(aVal)
    const bDate = new Date(bVal)
    if (!isNaN(aDate) && !isNaN(bDate)) return order === 'asc' ? aDate - bDate : bDate - aDate
    return order === 'asc'
      ? String(aVal).localeCompare(String(bVal))
      : String(bVal).localeCompare(String(aVal))
  })
})
</script>

<style scoped>
.table-wrapper {
  overflow-x: auto;
  border: 1px solid #ccc;
  border-radius: 6px;
  background: #fff;
  padding: 12px;
}
.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}
.summary {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  position: relative;
}
.info-badge {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  margin-left: 6px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background-color: #c8d4ab;
  color: white;
  font-size: 12px;
  font-weight: bold;
  cursor: default;
  position: relative;
  transition: background-color 0.2s;
}
.info-badge:hover { background-color: #b2c49c; }
.tooltip {
  position: absolute;
  top: 24px;
  left: 0;
  padding: 6px 10px;
  background-color: #333;
  color: #fff;
  font-size: 12px;
  border-radius: 4px;
  white-space: nowrap;
  z-index: 10;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
}
.table-scroll {
  max-height: 600px;
  overflow-y: auto;
}
.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
  table-layout: auto;
}
.data-table thead tr {
  background-color: #f9f9f9;
  text-align: center;
}
.data-table th,
.data-table td {
  padding: 12px 10px;
  border: 1px solid #e0e0e0;
  white-space: nowrap;
  text-align: center;
  vertical-align: middle;
}
.label {
  user-select: none;
  cursor: pointer;
}
.sort-icons {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  margin-left: 4px;
  font-size: 10px;
}
.arrow { color: #aaa; }
.arrow.active { color: #333; }
.empty-msg {
  text-align: center;
  color: #999;
  font-size: 14px;
  padding: 20px 0;
  font-style: italic;
}
.skeleton {
  height: 14px;
  width: 100%;
  border-radius: 4px;
  background: linear-gradient(90deg, #f0f0f0, #e0e0e0, #f0f0f0);
  background-size: 200% 100%;
  animation: shimmer 1.6s infinite linear;
}
@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
</style>
