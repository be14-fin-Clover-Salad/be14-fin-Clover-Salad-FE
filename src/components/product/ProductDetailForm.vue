<template>
  <div v-if="form" class="form-grid">
    <div class="form-item">
      <label>사진</label>
      <img style="width: 100%" :src="path" :alt="form.name + '의 사진'">
    </div>
    <div style="display: flex; flex-direction: column; justify-content: space-between">
      <div class="form-item">
        <label>상품 코드</label>
        <input type="text" v-model="form.productCode" readonly/>
      </div>
      <div style="display: flex; flex-direction: row; justify-content: space-between">
        <div class="form-item">
          <label>제조사</label>
          <input type="text" v-model="form.company" readonly/>
        </div>
        <div class="form-item">
          <label>카테고리</label>
          <input type="text" v-model="form.category" readonly/>
        </div>
        <div class="form-item">
          <label>모델명</label>
          <input type="text" v-model="form.serialNumber" readonly/>
        </div>
      </div>
      <div class="form-item">
        <label>상품명</label>
        <input type="text" v-model="form.name" readonly/>
      </div>
      <div class="form-item">
        <label>상품 원가</label>
        <input type="number" v-model="form.originCost" readonly/>
      </div>
      <div class="form-item" style="display: flex; flex-direction: row; justify-content: space-between">
        <div class="form-item" style="flex: 1;">
          <label>기간</label>
          <select v-model="type">
            <option value = "1">1년</option>
            <option value = "3">3년</option>
            <option value = "5">5년</option>
          </select>
        </div>
        <div class="form-item" style="flex: 2;">
          <label>렌탈료</label>
          <input type="number" v-model="calcRentalCost" readonly/>
        </div>
      </div>
    </div>
    <div class="form-item full-width">
      <label>설명</label>
      <textarea rows="3" v-model="form.description" readonly />
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from "vue";

const props = defineProps({
  form: {
    type: Object,
    required: true
  }
})

const type = ref("1");
const calcRentalCost = ref(null);
const path = ref(props.form.fileUrl + '/' + props.form.fileName);

watch(() => type.value, (newType) => {
  const years = parseInt(newType) || 1;
  switch (years) {
    case 1:
      calcRentalCost.value = props.form.rentalCost * years * 12;
      break;
    case 3:
      calcRentalCost.value = props.form.rentalCost * years * 12 * 0.9;
      break;
    case 5:
      calcRentalCost.value = props.form.rentalCost * years * 12 * 0.8;
      break;
  }
}, { immediate: true })
</script>

<style scoped>
/* 입력 영역 그리드 */
.form-grid {
  width: 80%;
  justify-self: center;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-top: 20px;
}

.form-item {
  display: flex;
  flex-direction: column;
}

.form-item label {
  font-weight: 600;
  margin-bottom: 6px;
  font-size: 14px;
  color: #444;
}

.form-item input,
.form-item select,
.form-item textarea {
  padding: 8px 10px;
  font-size: 14px;
  border: 1px solid #ccc;
  border-radius: 4px;
  background-color: #fff;
}

.full-width {
  grid-column: span 4;
}
</style>
