<template>
  <section>
    <div class="section-header">
      <h2 class="section-title">상품 수정</h2>
      <div class="section-actions">
        <button class="button primary" @click="updateProduct">수정</button>
        <button class="button danger" @click="showProductRegisterCancelModal = true">취소</button>
      </div>
    </div>
    <ProductRegisterForm
      ref="formRef"
      v-model="form"
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
      const response = await api.put(`/api/product/update/${productId.value}`, result.form)
      console.log(response)
    } catch (error) {
      console.error('상품 수정 실패:', error);
    } finally {
      isLoading.value = false
      await router.push(`/product/detail/${productId.value}`);
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
