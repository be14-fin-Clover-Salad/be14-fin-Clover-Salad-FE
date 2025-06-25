<template>
  <div class="consult-search-fields">
    <div class="row">
      <div class="field">
        <label>상담 일자</label>
        <div class="range-inputs">
          <input v-model="filters.consultDateFrom" type="date" />
          <span class="tilde">~</span>
          <input v-model="filters.consultDateTo" type="date" />
        </div>
      </div>
      <div class="field">
        <label>고객명</label>
        <div class="range-inputs">
          <input
            v-model="filters.customerName"
            placeholder="고객명을 입력하세요"
            type="text"
          />
        </div>
      </div>
      <div class="field">
        <label>상담 내용</label>
        <div class="range-inputs">
          <input
            v-model="filters.content"
            placeholder="상담 내용을 입력하세요"
            type="text"
          />
        </div>
      </div>
      <div class="field">
        <label>만족도</label>
        <div class="star-radios">
          <label v-for="n in 5" :key="n" class="star-label">
            <input type="radio" :value="n" v-model="filters.feedbackScore" />
            <span
              class="star"
              :class="{ checked: Number(filters.feedbackScore) >= n }"
              >★</span
            >
          </label>
          <label class="star-label none-label">
            <input type="radio" value="" v-model="filters.feedbackScore" />
            <span class="none-text">전체</span>
          </label>
        </div>
      </div>
      <div class="field">
        <label>부서</label>
        <select v-model="filters.departmentId" :disabled="!isAdmin" readonly>
          <option v-if="!isAdmin" :value="userDepartmentId" selected>
            {{ userDepartmentName }}
          </option>
          <template v-else>
            <option value="" selected>전체</option>
            <option
              v-for="dept in departments"
              :key="dept.id"
              :value="String(dept.id)"
            >
              {{ dept.name }}
            </option>
          </template>
        </select>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { getDepartments } from "@/api/department.js";
import { useAuthStore } from "@/stores/auth";

const props = defineProps({
  filters: {
    type: Object,
    required: true,
  },
});

const departments = ref([]);
const authStore = useAuthStore();

const isAdmin = computed(() => authStore.userInfo?.levelLabel === "관리자");
const userDepartmentId = computed(() =>
  String(authStore.userInfo?.departmentId ?? "")
);
const userDepartmentName = computed(
  () => authStore.userInfo?.departmentName ?? ""
);

onMounted(async () => {
  if (isAdmin.value) {
    const res = await getDepartments();
    departments.value = res.data;
    props.filters.departmentId = "";
  } else {
    props.filters.departmentId = userDepartmentId.value;
  }
});
</script>

<style scoped>
.consult-search-fields {
  padding: 16px 24px;
  margin-bottom: 12px;
  min-width: 0;
  overflow: hidden;
}
.row {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 12px;
  margin-bottom: 10px;
}
.field {
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.field label {
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 2px;
  color: #333;
  white-space: nowrap;
}
.field input[type="text"],
.field input[type="date"],
.field select {
  height: 29.5px;
  padding: 4px 8px;
  font-size: 13px;
  border: 1px solid #ccc;
  border-radius: 4px;
  width: 100%;
  box-sizing: border-box;
  line-height: normal;
}
.field input:focus {
  outline: none;
  border-color: #86b649;
  box-shadow: 0 0 0 2px rgba(134, 182, 73, 0.1);
}
.range-inputs {
  display: flex;
  align-items: center;
  gap: 4px;
}
.range-inputs input {
  flex: 1;
  min-width: 0;
}
.tilde {
  font-size: 12px;
  color: #666;
  flex-shrink: 0;
}
.star-radios {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 2px;
}
.star-label {
  display: flex;
  align-items: center;
  cursor: pointer;
}
.star-label input[type="radio"] {
  display: none;
}
.star {
  font-size: 18px;
  color: #ccc;
  transition: color 0.2s;
}
.star.checked {
  color: #ffc107;
}
.none-label {
  margin-left: 8px;
}
.none-text {
  font-size: 12px;
  color: #888;
  padding: 0 2px;
}
@media (max-width: 1200px) {
  .row {
    grid-template-columns: repeat(3, 1fr);
  }
}
@media (max-width: 992px) {
  .row {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (max-width: 768px) {
  .consult-search-fields {
    padding: 12px 16px;
  }
  .row {
    grid-template-columns: 1fr;
    gap: 8px;
  }
  .field label {
    font-size: 12px;
  }
  .field input {
    font-size: 12px;
    padding: 3px 6px;
  }
  .star {
    font-size: 16px;
  }
}
@media (max-width: 480px) {
  .consult-search-fields {
    padding: 8px 12px;
  }
  .row {
    gap: 6px;
  }
}
</style>
