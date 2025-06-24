<template>
  <div class="form-container">
    <div class="section-header no-print">
      <h2 class="section-title">상품 상세 조회</h2>
      <div class="section-actions">
        <button class="btn-print" @click="printProduct">인쇄</button>
        <button v-if="isAdmin" class="btn-primary" @click="showProductUpdateConfirmModal = true">수정</button>
        <button v-if="isAdmin" class="btn-danger" @click="showProductDeleteConfirmModal = true">삭제</button>
      </div>
    </div>
    <ProductDetailForm v-if="productReady && !isLoading" :form="product" :isAdmin="isAdmin"/>
    <div v-else class="loading">불러오는 중...</div>
    <ProductUpdateConfirmModal
      :isOpen="showProductUpdateConfirmModal"
      @close="showProductUpdateConfirmModal = false"
      @confirm="updateProduct"
    />
    <ProductDeleteConfirmModal
      :isOpen="showProductDeleteConfirmModal"
      @close="showProductDeleteConfirmModal = false"
      @confirm="deleteProduct"
    />
  </div>
</template>

<script setup>
  import ProductDetailForm from '@/components/product/ProductDetailForm.vue';
  import ProductDeleteConfirmModal from "@/components/product/ProductDeleteConfirmModal.vue";
  import ProductUpdateConfirmModal from "@/components/product/ProductUpdateConfirmModal.vue";
  import { ref, onMounted, computed } from 'vue';
  import { useRoute } from 'vue-router';
  import { useRouter } from 'vue-router';
  import api from "@/api/auth.js";
  import { useAuthStore } from "@/stores/auth.js";

  const route = useRoute();
  const router = useRouter();
  const authStore = useAuthStore();
  const product = ref(null);
  const isLoading = ref(false);
  const productId = ref(route.params.productId);
  const productReady = computed(() => product.value !== null);
  const showProductDeleteConfirmModal = ref(false);
  const showProductUpdateConfirmModal = ref(false);

  // 관리자 권한 확인
  const isAdmin = computed(() => {
    return authStore.userLevel === '관리자';
  });

  onMounted(async () => {
    try {
      isLoading.value = true;
      const response = await api.get(`/api/product/detail/${productId.value}`);
      product.value = response.data;
    } catch (error) {
      console.error('상품 정보 로딩 실패:', error);
    } finally {
      isLoading.value = false;
    }
  })

  function printProduct() {
    window.print();
  }

  async function updateProduct() {
    try {
      const response = await api.put(`/api/product/update/${productId.value}`, product.value);
      console.log('상품 수정 성공:', response.data);
      showProductUpdateConfirmModal.value = false;
      // 수정 후 페이지 새로고침 또는 성공 메시지 표시
    } catch (error) {
      console.error('상품 수정 실패:', error);
    }
  }

  // 백엔드에서 관리자와 나머지 권한 분기 필요
  async function deleteProduct() {
    const token = authStore.accessToken;
    try {
      const response = await api.put(`/api/product/delete/${productId.value}`, {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true
        });
      console.log(response.data);
    } catch (error) {
      console.error('상품 삭제 실패:', error);
    } finally {
      await router.push('/product/list');
    }
  }
</script>

<style lang="scss" scoped>
.form-container {
  background: white;
  border-radius: 12px;
  padding: 32px;
  border: 1px solid #e9ecef;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  overflow-y: auto;
}

/* 섹션 제목 및 버튼 영역 */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e9ecef;
}

.section-title {
  font-size: 24px;
  font-weight: 700;
  color: #2d3748;
  margin: 0;
}

/* 버튼들 */
.section-actions {
  display: flex;
  gap: 12px;
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

  &:hover {
    background: #3D5635;
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(74, 103, 65, 0.2);
  }

  &:active {
    transform: translateY(0);
  }
}

.btn-print {
  padding: 10px 20px;
  background: #6c757d;
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
    background: #5a6268;
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(108, 117, 125, 0.2);
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

.loading {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  font-size: 16px;
  color: #6c757d;
}

/* 인쇄 스타일 */
@media print {
  /* 전역 요소 숨김 */
  header,
  nav,
  .sidebar,
  .header,
  .main-header,
  .main-sidebar,
  .layout-header,
  .layout-sidebar,
  .no-print {
    display: none !important;
  }
  
  /* 메인 컨테이너 스타일 */
  body {
    margin: 0 !important;
    padding: 0 !important;
    background: white !important;
  }
  
  .form-container {
    box-shadow: none !important;
    border: none !important;
    padding: 20px !important;
    margin: 0 !important;
    width: 100% !important;
    max-width: none !important;
  }
  
  .form-section {
    box-shadow: none !important;
    border: 1px solid #000 !important;
    margin-bottom: 20px !important;
    page-break-inside: avoid;
    padding: 15px !important;
  }
  
  .section-header {
    border-bottom: 2px solid #000 !important;
    margin-bottom: 15px !important;
    padding-bottom: 10px !important;
  }
  
  .section-title {
    color: #000 !important;
    font-size: 18px !important;
  }
  
  .form-input,
  .form-textarea {
    border: 1px solid #000 !important;
    background: white !important;
    color: #000 !important;
    padding: 8px 12px !important;
  }
  
  .form-label {
    color: #000 !important;
    font-weight: bold !important;
  }
  
  .product-image {
    max-width: 200px !important;
    max-height: 200px !important;
    border: 1px solid #000 !important;
  }
  
  .form-grid {
    gap: 12px !important;
  }
  
  .unit {
    color: #000 !important;
  }
}

/* 반응형 */
@media (max-width: 768px) {
  .form-container {
    padding: 20px;
  }

  .section-header {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }

  .section-actions {
    width: 100%;
    justify-content: flex-end;
  }
}
</style>
