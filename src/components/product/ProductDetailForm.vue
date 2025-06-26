<template>
  <div v-if="form" class="form-content">
    <!-- 이미지 섹션 -->
    <div class="form-section">
      <div class="section-header">
        <h3 class="section-title">상품 이미지</h3>
      </div>
      <div class="image-display-container">
        <img :src="path" :alt="form.name + '의 사진'" class="product-image">
      </div>
    </div>

    <!-- 기본 정보 섹션 -->
    <div class="form-section">
      <div class="section-header">
        <h3 class="section-title">기본 정보</h3>
      </div>
      <div class="form-grid">
        <div class="form-item">
          <label class="form-label">상품 코드</label>
          <input type="text" v-model="form.productCode" class="form-input" readonly/>
        </div>
        <div class="form-item">
          <label class="form-label">상품명</label>
          <input type="text" v-model="form.name" class="form-input" readonly/>
        </div>
        <div class="form-item">
          <label class="form-label">제조사</label>
          <input type="text" v-model="form.company" class="form-input" readonly/>
        </div>
        <div class="form-item">
          <label class="form-label">카테고리</label>
          <input type="text" v-model="form.category" class="form-input" readonly/>
        </div>
        <div class="form-item">
          <label class="form-label">모델명</label>
          <input type="text" v-model="form.serialNumber" class="form-input" readonly/>
        </div>
      </div>
    </div>

    <!-- 가격 정보 섹션 -->
    <div class="form-section">
      <div class="section-header">
        <h3 class="section-title">가격 정보</h3>
      </div>
      <div class="form-grid">
        <div class="form-item">
          <label class="form-label">상품 원가</label>
          <div class="input-with-unit">
            <input
              type="text"
              v-model="formattedOriginCost"
              class="form-input"
              placeholder="0"
              readonly
            />
            <span class="unit">원</span>
          </div>
        </div>
        <div class="form-item">
          <label class="form-label">기간</label>
          <select v-model="type" class="form-input">
            <option value="1">1년</option>
            <option value="3">3년</option>
            <option value="5">5년</option>
          </select>
        </div>
        <div class="form-item">
          <label class="form-label">렌탈료</label>
          <div class="input-with-unit">
            <input
              type="text"
              v-model="formattedCalcRentalCost"
              class="form-input"
              placeholder="0"
              readonly
            />
            <span class="unit">원</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 상품 설명 섹션 -->
    <div class="form-section">
      <div class="section-header">
        <h3 class="section-title">상품 설명</h3>
      </div>
      <div class="form-item full-width">
        <label class="form-label">상품 설명</label>
        <textarea rows="4" v-model="form.description" class="form-textarea" readonly/>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from "vue";

const props = defineProps({
  form: {
    type: Object,
    required: true
  }
})

const type = ref("1");
const calcRentalCost = ref(null);
const path = ref(props.form.fileUrl);

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

// 숫자 포맷팅 함수
const formatNumber = (value) => {
  if (!value) return '';
  // 숫자가 아닌 문자 제거
  const numericValue = value.toString().replace(/[^\d]/g, '');
  // 세자리마다 쉼표 추가
  return numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

// 숫자 언포맷팅 함수
const unformatNumber = (value) => {
  if (!value) return 0;
  // 쉼표 제거 후 숫자로 변환
  return parseInt(value.toString().replace(/,/g, '')) || 0;
};

// 포맷된 가격 표시용 computed
const formattedOriginCost = computed({
  get: () => formatNumber(props.form.originCost),
  set: (value) => {
    props.form.originCost = unformatNumber(value);
  }
});

const formattedCalcRentalCost = computed({
  get: () => formatNumber(calcRentalCost.value),
  set: (value) => {
    calcRentalCost.value = unformatNumber(value);
  }
});
</script>

<style lang="scss" scoped>
.form-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.form-section {
  background: white;
  border-radius: 8px;
  padding: 20px;
  border: 1px solid #e9ecef;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);

  .section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
    padding-bottom: 12px;
    border-bottom: 2px solid #F8FDF2;

    .section-title {
      font-size: 16px;
      font-weight: 600;
      color: #495057;
      margin: 0;
      display: flex;
      align-items: center;
      gap: 8px;
    }
  }
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
}

.form-item {
  display: flex;
  flex-direction: column;

  &.full-width {
    grid-column: 1 / -1;
  }
}

.form-label {
  font-weight: 600;
  margin-bottom: 8px;
  font-size: 14px;
  color: #495057;
  display: flex;
  align-items: center;
  gap: 4px;
}

.form-input,
.form-textarea {
  padding: 12px 16px;
  font-size: 14px;
  border: 2px solid #e9ecef;
  border-radius: 6px;
  background-color: #fff;
  transition: all 0.2s ease;
  font-family: inherit;
  color: #495057;

  &:read-only {
    cursor: default;
  }
}

.form-textarea {
  resize: vertical;
  min-height: 100px;
}

.input-with-unit {
  position: relative;
  display: flex;
  align-items: center;

  .form-input {
    flex: 1;
    padding-right: 40px;
  }

  .unit {
    position: absolute;
    right: 12px;
    color: #6c757d;
    font-size: 14px;
    font-weight: 500;
  }
}

/* 이미지 표시 스타일 */
.image-display-container {
  display: flex;
  justify-content: center;
}

.product-image {
  max-width: 300px;
  max-height: 300px;
  object-fit: cover;
  border-radius: 8px;
  border: 2px solid #e9ecef;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* 반응형 */
@media (max-width: 768px) {
  .form-section {
    padding: 16px;
  }

  .form-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .product-image {
    max-width: 250px;
    max-height: 250px;
  }

  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}
</style>

