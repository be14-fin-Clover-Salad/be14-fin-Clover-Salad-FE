<template>
  <div v-if="form" class="form-content">
    <!-- 이미지 업로드 섹션 -->
    <div class="form-section">
      <div class="section-header">
        <h3 class="section-title">
          상품 이미지
        </h3>
        <span class="required-badge">필수</span>
      </div>
      <div class="image-upload-container">
        <div 
          class="image-upload-area"
          @click="showImageUploadModal = true"
        >
          <div v-if="imgUploaded" class="image-display">
            <img :src="path" :alt="form.name + '의 사진'">
            <div class="image-overlay">
              <span>이미지 변경</span>
            </div>
          </div>
          <div v-else class="upload-placeholder">
            <span>이미지를 업로드하세요</span>
            <button type="button" class="upload-btn">파일 선택</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 기본 정보 섹션 -->
    <div class="form-section">
      <div class="section-header">
        <h3 class="section-title">
          기본 정보
        </h3>
      </div>
      <div class="form-grid">
        <div class="form-item">
          <label class="form-label">
            상품 코드
            <span class="required">*</span>
          </label>
          <input 
            type="text" 
            v-model="form.productCode"
            class="form-input"
            placeholder="상품 코드를 입력하세요"
          />
        </div>
        <div class="form-item">
          <label class="form-label">
            상품명
            <span class="required">*</span>
          </label>
          <input 
            type="text" 
            v-model="form.name"
            class="form-input"
            placeholder="상품명을 입력하세요"
          />
        </div>
        <div class="form-item">
          <label class="form-label">
            제조사
            <span class="required">*</span>
          </label>
          <input 
            type="text" 
            v-model="form.company"
            class="form-input"
            placeholder="제조사를 입력하세요"
          />
        </div>
        <div class="form-item">
          <label class="form-label">
            카테고리
            <span class="required">*</span>
          </label>
          <input 
            type="text" 
            v-model="form.category"
            class="form-input"
            placeholder="카테고리를 입력하세요"
          />
        </div>
        <div class="form-item">
          <label class="form-label">
            모델명
            <span class="required">*</span>
          </label>
          <input 
            type="text" 
            v-model="form.serialNumber"
            class="form-input"
            placeholder="모델명을 입력하세요"
          />
        </div>
      </div>
    </div>

    <!-- 가격 정보 섹션 -->
    <div class="form-section">
      <div class="section-header">
        <h3 class="section-title">
          가격 정보
        </h3>
      </div>
      <div class="form-grid">
        <div class="form-item">
          <label class="form-label">
            상품 원가
            <span class="required">*</span>
          </label>
          <div class="input-with-unit">
            <input 
              type="text" 
              v-model="formattedOriginCost"
              @input="handleOriginCostInput"
              class="form-input"
              placeholder="0"
            />
            <span class="unit">원</span>
          </div>
        </div>
        <div class="form-item">
          <label class="form-label">
            렌탈료
            <span class="required">*</span>
          </label>
          <div class="input-with-unit">
            <input 
              type="text" 
              v-model="formattedRentalCost"
              @input="handleRentalCostInput"
              class="form-input"
              placeholder="0"
            />
            <span class="unit">원</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 상품 설명 섹션 -->
    <div class="form-section">
      <div class="section-header">
        <h3 class="section-title">
          상품 설명
        </h3>
      </div>
      <div class="form-item full-width">
        <label class="form-label">상품 설명</label>
        <textarea 
          rows="4" 
          v-model="form.description"
          class="form-textarea"
          placeholder="상품에 대한 상세한 설명을 입력하세요"
        />
      </div>
    </div>
  </div>

  <ImageUploadModal
    :isOpen="showImageUploadModal"
    @close="showImageUploadModal = false"
    @upload-success="handleUploadSuccess"
  />
</template>

<script setup>
  import ImageUploadModal from "@/components/product/ImageUploadModal.vue";
  import { ref, watch, onMounted, computed } from "vue";

  const imgUploaded = ref(false);
  const showImageUploadModal = ref(false);
  const path = ref("");

  const props = defineProps({
    modelValue: {
      type: Object,
      required: true,
    },
  });

  const emit = defineEmits(["update:modelValue"]);

  const form = ref(JSON.parse(JSON.stringify(props.modelValue)));

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
    get: () => formatNumber(form.value.originCost),
    set: (value) => {
      form.value.originCost = unformatNumber(value);
    }
  });

  const formattedRentalCost = computed({
    get: () => formatNumber(form.value.rentalCost),
    set: (value) => {
      form.value.rentalCost = unformatNumber(value);
    }
  });

  // 입력 핸들러
  const handleOriginCostInput = (event) => {
    const value = event.target.value;
    const numericValue = value.replace(/[^\d]/g, '');
    const formattedValue = formatNumber(numericValue);
    event.target.value = formattedValue;
    form.value.originCost = unformatNumber(formattedValue);
  };

  const handleRentalCostInput = (event) => {
    const value = event.target.value;
    const numericValue = value.replace(/[^\d]/g, '');
    const formattedValue = formatNumber(numericValue);
    event.target.value = formattedValue;
    form.value.rentalCost = unformatNumber(formattedValue);
  };

  // 컴포넌트 마운트 시 기존 이미지가 있는지 확인
  onMounted(() => {
    if (props.modelValue.fileUrl) {
      path.value = props.modelValue.fileUrl; // 전체 URL 사용
      imgUploaded.value = true;
    }
  });

  watch(() => props.modelValue, (newVal) => {
    if (JSON.stringify(newVal) !== JSON.stringify(form.value)) {
      form.value = JSON.parse(JSON.stringify(newVal));
    }
  }, { deep: true });

  watch(form, (newVal) => {
    if (JSON.stringify(newVal) !== JSON.stringify(props.modelValue)) {
      emit("update:modelValue", newVal);
    }
  }, { deep: true });


  function handleUploadSuccess(response) {
    console.log("handleUploadSuccess - 전체 response:", response);
    
    // 파일 선택 시 미리보기 처리
    if (response && response.file && response.previewUrl) {
      // 파일 객체와 미리보기 URL 저장
      form.value.selectedFile = response.file;
      form.value.fileName = response.fileName;
      form.value.fileSize = response.fileSize;
      form.value.fileType = response.fileType;
      
      // 미리보기용 URL 설정 (Base64)
      path.value = response.previewUrl;
      imgUploaded.value = true;
      showImageUploadModal.value = false;
      
      console.log("파일 선택 완료:", {
        fileName: response.fileName,
        fileSize: response.fileSize,
        previewUrl: response.previewUrl
      });
    } else {
      console.error("파일 데이터가 누락되었습니다:", response);
    }
  }

  function submitForm() {
    return { form: form.value };
  }

  defineExpose({
    submitForm
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

      i {
        font-size: 18px;
      }
    }

    .required-badge {
      background: #dc3545;
      color: white;
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 500;
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

  .required {
    color: #dc3545;
    font-size: 16px;
  }
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

  &:focus {
    outline: none;
    border-color: #4A6741;
    box-shadow: 0 0 0 3px rgba(74, 103, 65, 0.1);
  }

  &::placeholder {
    color: #adb5bd;
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

/* 이미지 업로드 스타일 */
.image-upload-container {
  display: flex;
  justify-content: center;
}

.image-upload-area {
  width: 200px;
  height: 200px;
  border: 2px dashed #4A6741;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  overflow: hidden;
  background: #F8FDF2;

  &:hover {
    border-color: #3D5635;
    background: #E8F0E5;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(74, 103, 65, 0.15);
  }
}

.image-display {
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;

  img {
    max-width: 100%;
    max-height: 100%;
    object-fit: cover;
    border-radius: 8px;
  }

  .image-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    color: white;
    opacity: 0;
    transition: opacity 0.3s ease;
    border-radius: 8px;

    i {
      font-size: 24px;
      margin-bottom: 8px;
    }

    span {
      font-size: 12px;
      font-weight: 500;
    }
  }

  &:hover .image-overlay {
    opacity: 1;
  }
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 12px;
  text-align: center;
  color: #4A6741;

  i {
    font-size: 32px;
    opacity: 0.7;
  }

  span {
    font-size: 14px;
    font-weight: 500;
  }

  .upload-btn {
    padding: 8px 16px;
    background: #4A6741;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 12px;
    font-weight: 500;
    transition: background-color 0.3s ease;

    &:hover {
      background: #3D5635;
    }
  }
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

  .image-upload-area {
    width: 150px;
    height: 150px;
  }

  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}
</style>
