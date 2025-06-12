<template>
  <div>
    <!-- 바운더리 바깥 상단 요약 -->
    <div class="table-summary">
      총 {{ rows.length }}건
      <span ref="badgeRef"
            class="info-badge"
            @mouseenter="showTooltip = true"
            @mouseleave="showTooltip = false">
        <span class="i">i</span>
        <div v-show="showTooltip" class="tooltip tooltip-local">
          클릭하면<br />오름/내림차순 정렬이 가능합니다.
        </div>
      </span>
    </div>

    <!-- 테이블 박스 -->
    <div class="table-wrapper">
      <div class="table-scroll">
        <table class="data-table">
          <thead>
            <tr>
              <th v-for="col in columns" :key="col.key" @click="toggleSort(col.key)"
                  class="sortable" :style="{ width: col.width || 'auto' }">
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
              <td v-for="col in columns" :key="col.key" :style="{ width: col.width || 'auto' }">
                <div class="skeleton"></div>
              </td>
            </tr>
          </tbody>

          <tbody v-else-if="sortedRows.length">
            <tr
              v-for="(row, rowIndex) in sortedRows"
              :key="rowIndex"
              @click="$emit('row-click', row)"
              @dblclick="$emit('row-dblclick', row)"
              :class="{ selected: row.code === selectedCode }"
            >
              <td v-for="col in columns" :key="col.key" :style="{ width: col.width || 'auto' }">
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
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  columns: { type: Array, required: true },
  rows: { type: Array, required: true },
  isLoading: { type: Boolean, default: false },
  selectedCode: { type: String, default: '' }
})

const sortState = ref({ key: null, order: null })
const showTooltip = ref(false)
const badgeRef = ref(null)

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
.table-summary {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-bottom: 12px;
  position: relative;
}

.info-badge {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background-color: #c8d4ab;
  color: white;
  font-size: 12px;
  font-weight: bold;
  cursor: default;
  transition: background-color 0.2s;
  position: relative;
}

.info-badge:hover {
  background-color: #b2c49c;
}

.tooltip {
  padding: 6px 10px;
  background-color: #333;
  color: #fff;
  font-size: 12px;
  border-radius: 4px;
  white-space: nowrap;
  z-index: 100;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
}

.tooltip-local {
  position: absolute;
  top: 100%;
  left: 400%;
  transform: translateX(-50%);
  margin-top: 6px;
}

.selected {
  background-color: #eef4ff;
}

.table-wrapper {
  overflow-x: auto;
  border: 1px solid #ccc;
  border-radius: 6px;
  background: #fff;
  padding: 12px;
}

.table-scroll {
  max-height: 600px;
  overflow: auto;
}

.data-table {
  width: max-content;
  border-collapse: collapse;
  font-size: 14px;
  table-layout: fixed;
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
  overflow: visible;
  cursor: default;
  user-select: none;
}

.data-table th {
  position: sticky;
  top: 0;
  background-color: #f9f9f9;
  z-index: 1;
}

.label {
  display: inline-block;
  text-align: center;
  user-select: none;
  font-weight: 500;
  cursor: pointer;
  width: 100%;
}

.sort-icons {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  font-size: 10px;
  align-items: center;
  line-height: 1;
}

.arrow {
  color: #ccc;
}

.arrow.active {
  color: #333;
}

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
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
</style>
