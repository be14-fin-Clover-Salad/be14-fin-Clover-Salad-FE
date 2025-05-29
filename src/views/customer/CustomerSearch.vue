<template>
  <div class="customer-search">
    <input v-model="form.name" placeholder="고객명" />
    <input v-model="form.phone" placeholder="연락처" />
    <select v-model="form.status">
      <option value="">전체 상태</option>
      <option value="ACTIVE">활성</option>
      <option value="INACTIVE">비활성</option>
    </select>
    <button @click="submit">조회</button>
  </div>
</template>

<script setup>
import { reactive } from "vue";
const emit = defineEmits(["search"]);

const form = reactive({
  name: "",
  phone: "",
  status: "",
});

const submit = () => {
  emit("search", { ...form });
};
</script>

<style scoped>
.customer-search {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}
input,
select {
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 6px;
  width: 160px;
}
button {
  padding: 8px 16px;
  background-color: #86b649;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}
</style>
