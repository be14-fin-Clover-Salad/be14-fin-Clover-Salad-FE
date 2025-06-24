<template>
    <div class="form-container">
      <ProductRegisterForm
        ref="formRef"
        v-model="form"
      />
    </div>

    <!-- 페이지 푸터 -->
    <div class="page-footer">
      <div class="footer-info">
        <div class="form-status">
          <span v-if="isValid" class="status-valid">모든 필수 항목이 입력되었습니다</span>
          <span v-else class="status-invalid">필수 항목을 모두 입력해주세요</span>
        </div>
      </div>
      <div class="footer-actions">
        <button 
          class="btn-primary" 
          :disabled="!isValid"
          @click="onClickRegister"
        >
          등록
        </button>
        <button class="btn-secondary" @click="showProductRegisterCancelModal = true">
          취소
        </button>
      </div>
    </div>

    <!-- 모달 컴포넌트들 -->
    <ProductRegisterCancelModal
      :isOpen="showProductRegisterCancelModal"
      :type="type"
      @close="showProductRegisterCancelModal = false"
      @cancel="router.push('/product/list');"
    />
    <ProductRegisterConfirmModal
      :isOpen="showProductRegisterConfirmModal"
      :isValid="isValid"
      @close="showProductRegisterConfirmModal = false"
      @confirm="registerProduct"
    />
</template>

<script setup>
  import ProductRegisterForm from "@/components/product/ProductRegisterForm.vue";
  import ProductRegisterCancelModal from "@/components/product/ProductRegisterCancelModal.vue";
  import ProductRegisterConfirmModal from "@/components/product/ProductRegisterConfirmModal.vue";
  import { ref, computed } from 'vue';
  import { useRouter } from 'vue-router';
  import api from "@/api/auth.js";

  const router = useRouter();
  const type = ref("추가");
  const isLoading = ref(false);
  const formRef = ref(null);
  const showProductRegisterCancelModal = ref(false);
  const showProductRegisterConfirmModal = ref(false);

  const form = ref({
    productCode: '',
    company: '',
    category: '',
    serialNumber: '',
    name: '',
    originCost: 0,
    rentalCost: 0,
    description: '',
    fileUploadId: '',
    fileName: '',
    fileUrl: ''
  });

  // 폼 유효성 검사
  const isValid = computed(() => {
    return form.value.productCode !== ""
        && form.value.company !== ""
        && form.value.category !== ""
        && form.value.serialNumber !== ""
        && form.value.name !== ""
        && form.value.originCost > 0
        && form.value.rentalCost > 0
        && (form.value.fileUrl !== "" || form.value.selectedFile);
  });

  function validateForm(result) {
    return result.productCode !== ""
        && result.company !== ""
        && result.category !== ""
        && result.serialNumber !== ""
        && result.name !== ""
        && result.originCost > 0
        && result.rentalCost > 0
        && (result.fileUrl !== "" || result.selectedFile);
  }

  function onClickRegister() {
    const result = formRef.value.submitForm();
    console.log(result.form);
    showProductRegisterConfirmModal.value = true;
  }

  async function registerProduct() {
    try {
      isLoading.value = true;
      const result = formRef.value.submitForm();
      console.log(result.form);
      
      // 파일이 선택된 경우 먼저 S3에 업로드
      if (result.form.selectedFile) {
        console.log('파일 업로드 시작...');
        const formData = new FormData();
        formData.append('file', result.form.selectedFile);
        formData.append('type', 'PRODUCT');
        
        const uploadResponse = await api.post('/api/product/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          }
        });
        
        console.log('파일 업로드 응답:', uploadResponse.data);
        
        // 업로드된 파일 정보로 폼 데이터 업데이트
        result.form.fileUploadId = uploadResponse.data.fileUploadId;
        result.form.fileName = uploadResponse.data.fileName;
        result.form.fileUrl = uploadResponse.data.fileUrl;
        
        // selectedFile은 제거 (서버로 전송할 필요 없음)
        delete result.form.selectedFile;
        delete result.form.fileSize;
        delete result.form.fileType;
      }
      
      // 상품 정보 등록
      const response = await api.post('/api/product/register', result.form);
      console.log('상품 등록 응답:', response);
      
    } catch (error) {
      console.error('상품 등록 실패:', error);
      alert('상품 등록에 실패했습니다.');
      return;
    } finally {
      isLoading.value = false;
      await router.push('/product/list');
    }
  }
</script>

<style lang="scss" scoped>
.page-container {
  min-height: 100vh;
  background: #f8f9fa;
  display: flex;
  flex-direction: column;
  padding: 32px;
}

.form-container {
  flex: 1;
  background: white;
  border-radius: 12px;
  padding: 32px;
  border: 1px solid #e9ecef;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  overflow-y: auto;
  margin-bottom: 24px;
}

/* 페이지 푸터 */
.page-footer {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 24px 32px;
  background: white;
  border-top: 1px solid #e9ecef;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.05);

  .footer-info {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    color: #6c757d;

    .form-status {
      display: flex;
      align-items: center;
      gap: 8px;

      .status-valid {
        color: #4A6741;
        font-weight: 500;
      }

      .status-invalid {
        color: #dc3545;
        font-weight: 500;
      }
    }
  }

  .footer-actions {
    display: flex;
    gap: 12px;
    justify-content: center;
  }
}

/* 버튼 스타일 */
.btn-primary {
  padding: 10px 20px;
  background: #4A6741;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 6px;

  &:hover:not(:disabled) {
    background: #3D5635;
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(74, 103, 65, 0.2);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:disabled {
    background: #cbd5e0;
    color: #a0aec0;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
}

.btn-secondary {
  padding: 10px 20px;
  background: #8BA888;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 6px;

  &:hover {
    background: #7A9A77;
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(139, 168, 136, 0.2);
  }

  &:active {
    transform: translateY(0);
  }
}

.btn-danger {
  padding: 10px 20px;
  background: #e53935;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 6px;

  &:hover {
    background: #c62828;
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(229, 57, 53, 0.2);
  }

  &:active {
    transform: translateY(0);
  }
}

/* 반응형 */
@media (max-width: 768px) {
  .page-container {
    padding: 16px 20px;
  }

  .form-container {
    padding: 20px;
    margin-bottom: 16px;
  }

  .page-footer {
    padding: 20px 16px;
    gap: 12px;

    .footer-info {
      text-align: center;
    }
  }
}
</style>
