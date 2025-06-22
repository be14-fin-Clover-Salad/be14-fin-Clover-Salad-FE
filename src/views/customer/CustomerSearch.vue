<template>
  <div class="customer-search">
    <div class="search-form">
      <div class="form-group">
        <label>고객명</label>
        <input v-model="form.name" placeholder="고객명을 입력하세요" />
      </div>
      <div class="form-group">
        <label>연락처</label>
        <input v-model="form.phone" placeholder="연락처를 입력하세요" />
      </div>
      <div class="form-group">
        <label>고객 유형</label>
        <select v-model="form.type">
          <option value="">전체</option>
          <option value="CUSTOMER">고객</option>
          <option value="PROSPECT">리드</option>
        </select>
      </div>
      <div class="form-group">
        <label>&nbsp;</label>
        <button @click="submit" class="search-btn">조회</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive } from "vue";
const emit = defineEmits(["search"]);

const form = reactive({
  name: "",
  phone: "",
  type: "",
});

const submit = () => {
  // 빈 값 제거
  const searchConditions = {};
  Object.keys(form).forEach((key) => {
    if (form[key] && form[key].trim() !== "") {
      searchConditions[key] = form[key].trim();
    }
  });

  emit("search", searchConditions);
};
</script>

<style scoped>
.customer-search {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

.search-form {
  display: flex;
  gap: 16px;
  align-items: end;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  font-size: 12px;
  font-weight: 500;
  color: #666;
  margin-bottom: 4px;
}

input,
select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  min-width: 150px;
}

input:focus,
select:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.search-btn {
  padding: 8px 16px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  min-width: 80px;
}

.search-btn:hover {
  background-color: #0056b3;
}
</style>
