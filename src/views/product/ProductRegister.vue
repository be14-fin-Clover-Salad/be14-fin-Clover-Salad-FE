<template>
  <section>
    <div class="section-header">
      <h2 class="section-title">상품 등록</h2>
      <div class="section-actions">
        <button class="button primary" @click="onClickRegister">등록</button>
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
      @cancel="router.push('/product/list');"
    />
    <ProductRegisterConfirmModal
      :isOpen="showProductRegisterConfirmModal"
      :isValid="isValid"
      @close="showProductRegisterConfirmModal = false"
      @confirm="registerProduct"
    />
  </section>
</template>

<script setup>
  import ProductRegisterForm from "@/components/product/ProductRegisterForm.vue";
  import ProductRegisterCancelModal from "@/components/product/ProductRegisterCancelModal.vue";
  import ProductRegisterConfirmModal from "@/components/product/ProductRegisterConfirmModal.vue";
  import { ref } from 'vue';
  import { useRouter } from 'vue-router';
  import api from "@/api/auth.js";

  const router = useRouter();
  const type = ref("추가");
  const isLoading = ref(false);
  const formRef = ref(null);
  const showProductRegisterCancelModal = ref(false);
  const showProductRegisterConfirmModal = ref(false);
  const isValid = ref(false);

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

  function validateForm(result) {
    return result.imageUrl !== ""
        && result.productCode !== ""
        && result.company !== ""
        && result.category !== ""
        && result.serialNumber !== ""
        && result.name !== ""
        && result.originCost !== ""
        && result.rentalCost !== "";
  }

  function onClickRegister() {
    const result = formRef.value.submitForm();
    isValid.value = validateForm(result.form);
    showProductRegisterConfirmModal.value = true;
  }

  async function registerProduct() {
    try {
      isLoading.value = true
      const result = formRef.value.submitForm()
      console.log(result.form);
      const response = await api.post('/api/product/register', result.form)
      console.log(response)
    } catch (error) {
      console.error('상품 등록 실패:', error);
    } finally {
      isLoading.value = false
      await router.push('/product/list');
    }
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
