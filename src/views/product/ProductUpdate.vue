<template>
  <section>
    <div class="section-header">
      <h2 class="section-title">상품 수정</h2>
      <div class="section-actions">
        <button class="btn-primary" @click="showProductUpdateConfirmModal = true">수정</button>
        <button class="btn-danger" @click="showProductRegisterCancelModal = true">취소</button>
      </div>
    </div>
    <ProductRegisterForm
      ref="formRef"
      v-model="form"
    />
    <ProductUpdateConfirmModal
      :isOpen="showProductUpdateConfirmModal"
      @close="showProductUpdateConfirmModal = false"
      @confirm="updateProduct"
    />
    <ProductRegisterCancelModal
      :isOpen="showProductRegisterCancelModal"
      :type="type"
      @close="showProductRegisterCancelModal = false"
      @cancel="cancelUpdate"
    />
  </section>
</template>

<script setup>
  import ProductRegisterForm from "@/components/product/ProductRegisterForm.vue";
  import ProductRegisterCancelModal from "@/components/product/ProductRegisterCancelModal.vue";
  import ProductUpdateConfirmModal from "@/components/product/ProductUpdateConfirmModal.vue";
  import { onMounted, ref } from 'vue';
  import { useRoute } from 'vue-router';
  import { useRouter } from 'vue-router';
  import api from "@/api/auth.js";

  const route = useRoute();
  const router = useRouter();
  const isLoading = ref(false);
  const type = ref("수정");
  const productId = ref(route.params.productId);
  const formRef = ref(null);
  const showProductRegisterCancelModal = ref(false);
  const showProductUpdateConfirmModal = ref(false);

  const form = ref({
    productCode: '',
    company: '',
    category: '',
    serialNumber: '',
    name: '',
    originCost: 0,
    rentalCost: 0,
    description: '',
    imageUrl: ''
  });

  onMounted(async () => {
    try {
      isLoading.value = true;
      const response = await api.get(`/api/product/detail/${productId.value}`);
      form.value = response.data;
    } catch (error) {
      console.error('상품 정보 로딩 실패:', error);
    } finally {
      isLoading.value = false;
    }
  });

  async function updateProduct() {
    try {
      isLoading.value = true
      const result = formRef.value.submitForm()
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

      const response = await api.put(`/api/product/update/${productId.value}`, result.form)
      console.log(response)

      isLoading.value = false;
      await router.push(`/product/detail/${productId.value}`);
    } catch (error) {
      console.error('상품 수정 실패:', error);
    }
  }

  function cancelUpdate() {
    router.push(`/product/detail/${productId.value}`);
  }
</script>

<style scoped>
/* 공통 섹션 박스 */
section {
  background-color: #fff;
  border-radius: 6px;
  padding: 24px;
  margin-bottom: 32px;
  box-shadow: 0 0 4px rgba(0, 0, 0, 0.03);
}

/* 섹션 제목 및 버튼 영역 */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.section-title {
  font-size: 18px;
  font-weight: 700;
  display: flex;
  align-items: center;
}

/* 버튼들 */
.section-actions {
  display: flex;
  gap: 8px;
}

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

  &:hover {
    background: #3D5635;
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(74, 103, 65, 0.2);
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
</style>
