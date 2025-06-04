<template>
  <div class="table-wrapper">
    <table class="data-table">
      <thead>
        <tr>
          <th v-for="col in columns" :key="col.key">
            {{ col.label }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(row, rowIndex) in rows" :key="rowIndex">
          <td v-for="col in columns" :key="col.key">
            {{ row[col.key] || '-' }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
defineProps({
  columns: {
    type: Array,
    required: true,
  },
  rows: {
    type: Array,
    required: true,
  }
});
</script>

<style scoped>
.table-wrapper {
  overflow-x: auto;
  border: 1px solid #ccc;
  border-radius: 4px;
  background: #fff;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
  table-layout: auto;
}

.data-table thead tr {
  background-color: #e1ecb6;
  text-align: left;
}

.data-table th,
.data-table td {
  padding: 10px;
  border: 1px solid #d1d1d1;
  white-space: nowrap;
}

.data-table tbody tr:nth-child(even) {
  background-color: #f9f9f9;
}
</style>
