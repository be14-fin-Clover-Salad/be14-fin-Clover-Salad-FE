<template>
  <section>
    <div class="section">
      <div class="section-header">
        <h2 class="section-title">상품 상세 조회</h2>
        <div class="section-actions">
          <button class="button primary">인쇄</button>
          <button class="button primary" @click="updateProduct">수정</button>
          <button class="button danger" @click="showProductDeleteConfirmModal = true">삭제</button>
        </div>
      </div>
    </div>
    <ProductDetailForm v-if="productReady && !isLoading" :form="product"/>
    <div v-else>불러오는 중...</div>
    <ProductDeleteConfirmModal
      :isOpen="showProductDeleteConfirmModal"
      @close="showProductDeleteConfirmModal = false"
      @confirm="deleteProduct"
    />
  </section>
</template>

<script setup>
  import ProductDetailForm from '@/components/product/ProductDetailForm.vue';
  import ProductDeleteConfirmModal from "@/components/product/ProductDeleteConfirmModal.vue";
  import { ref, onMounted, computed } from 'vue';
  import { useRoute } from 'vue-router';
  import { useRouter } from 'vue-router';
  import api from "@/api/auth.js";
  import { useAuthStore } from "@/stores/auth.js";

  const route = useRoute();
  const router = useRouter();
  const product = ref(null);
  const isLoading = ref(false);
  const productId = ref(route.params.productId);
  const productReady = computed(() => product.value !== null);
  const showProductDeleteConfirmModal = ref(false);

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

  function updateProduct() {
    router.push(`/product/update/${productId.value}`);
  }

  // 백엔드에서 관리자와 나머지 권한 분기 필요
  async function deleteProduct() {
    const authStore = useAuthStore();
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

<style scoped>
/* 공통 섹션 박스 */
.section {
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

.section-actions .button {
  padding: 6px 14px;
  font-size: 14px;
  font-weight: 500;
  border-radius: 4px;
  border: none;
  color: #fff;
  user-select: none;
  outline: none;
  cursor: pointer;
  transition: background-color 0.2s ease, color 0.2s ease;
}

.section-actions .button.primary {
  background-color: #a6ce39;
}

.section-actions .button.primary:hover {
  background-color: #94b933;
}

.section-actions .button.danger {
  background-color: #e53935;
}

.section-actions .button.danger:hover {
  background-color: #c62828;
  color: #fbe9e7;
}
</style>
