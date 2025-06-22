<template>
  <div class="consult-search">
    <div class="search-row">
      <div class="search-field">
        <label>상담일시</label>
        <div class="date-range">
          <input
            v-model="form.consultDateFrom"
            type="date"
            placeholder="시작일"
          />
          <span class="date-separator">~</span>
          <input
            v-model="form.consultDateTo"
            type="date"
            placeholder="종료일"
          />
        </div>
      </div>

      <div class="search-field">
        <label>상담 내용</label>
        <input
          v-model="form.content"
          placeholder="상담 내용 검색"
          @keyup.enter="submit"
        />
      </div>
    </div>

    <div class="search-row">
      <div class="search-field">
        <label>피드백 점수</label>
        <div class="score-range">
          <input
            v-model="form.minScore"
            type="number"
            min="0"
            max="5"
            step="0.1"
            placeholder="최소 점수"
          />
          <span class="score-separator">~</span>
          <input
            v-model="form.maxScore"
            type="number"
            min="0"
            max="5"
            step="0.1"
            placeholder="최대 점수"
          />
        </div>
      </div>

      <div class="search-field">
        <label>상태</label>
        <select v-model="form.status">
          <option value="">전체</option>
          <option value="active">활성</option>
          <option value="deleted">삭제됨</option>
        </select>
      </div>
    </div>

    <div class="search-actions">
      <button @click="submit" class="search-btn">조회</button>
      <button @click="reset" class="reset-btn">초기화</button>
    </div>
  </div>
</template>

<script setup>
import { reactive } from "vue";

const emit = defineEmits(["search"]);

const form = reactive({
  consultDateFrom: "",
  consultDateTo: "",
  content: "",
  minScore: "",
  maxScore: "",
  status: "",
});

const submit = () => {
  // 빈 값을 제외하고 검색 이벤트를 발생시킵니다.
  const searchParams = Object.entries(form).reduce((acc, [key, value]) => {
    if (value) {
      acc[key] = value;
    }
    return acc;
  }, {});
  emit("search", searchParams);
};

const reset = () => {
  Object.keys(form).forEach((key) => {
    form[key] = "";
  });
  emit("search", {});
};
</script>

<style scoped>
.consult-search {
  background-color: #f9f9f9;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
}

.search-row {
  display: flex;
  gap: 20px;
  margin-bottom: 16px;
}

.search-field {
  flex: 1;
}

.search-field label {
  display: block;
  margin-bottom: 6px;
  font-weight: 500;
  color: #333;
  font-size: 14px;
}

.search-field input,
.search-field select {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
}

.search-field input:focus,
.search-field select:focus {
  outline: none;
  border-color: #86b649;
  box-shadow: 0 0 0 2px rgba(134, 182, 73, 0.1);
}

.date-range,
.score-range {
  display: flex;
  align-items: center;
  gap: 8px;
}

.date-separator,
.score-separator {
  color: #666;
  font-weight: 500;
}

.date-range input,
.score-range input {
  flex: 1;
}

.search-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.search-btn,
.reset-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: background-color 0.2s;
}

.search-btn {
  background-color: #86b649;
  color: white;
}

.search-btn:hover {
  background-color: #709e3a;
}

.reset-btn {
  background-color: #f5f5f5;
  color: #666;
  border: 1px solid #ddd;
}

.reset-btn:hover {
  background-color: #e8e8e8;
}
</style>
