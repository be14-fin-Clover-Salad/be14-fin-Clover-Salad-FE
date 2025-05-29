<template>
  <div class="search-box">
    <label>
      고객명:
      <input v-model="criteria.name" placeholder="이름 입력" />
    </label>
    <button @click="onSearch">검색</button>
  </div>
</template>

<script setup>
import { reactive } from "vue";
const emit = defineEmits(["search"]);

const criteria = reactive({
  name: "",
});

const onSearch = () => {
  emit("search", { ...criteria });
};
</script>

<style scoped>
.search-box {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}
input {
  padding: 4px 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
}
button {
  padding: 6px 12px;
  background-color: #86b649;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
</style>
