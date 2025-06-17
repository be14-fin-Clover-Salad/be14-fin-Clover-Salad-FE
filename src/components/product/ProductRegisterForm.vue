<template>
  <div v-if="form" class="form-grid">
    <div class="form-item">
      <label>사진<span class="required">*</span></label>
      <div v-if="imgUploaded" style="display: flex; flex-direction: column; align-items: center;">
        <button @click="showImageUploadModal = true">사진 변경</button>
        <img style="width: 100%" :src="form.imageUrl" :alt="form.name + '의 사진'">
      </div>
      <div v-else style="display: flex; flex: 1; justify-content: center; align-items: center; border: 1px #000 solid">
        <button @click="showImageUploadModal = true">사진 업로드</button>
      </div>
    </div>
    <div style="display: flex; flex-direction: column; justify-content: space-between">
      <div class="form-item">
        <label>상품 코드<span class="required">*</span></label>
        <input type="text" v-model="form.productCode"/>
      </div>
      <div style="display: flex; flex-direction: row; justify-content: space-between">
        <div class="form-item">
          <label>제조사<span class="required">*</span></label>
          <input type="text" v-model="form.company"/>
        </div>
        <div class="form-item">
          <label>카테고리<span class="required">*</span></label>
          <input type="text" v-model="form.category"/>
        </div>
        <div class="form-item">
          <label>모델명<span class="required">*</span></label>
          <input type="text" v-model="form.serialNumber"/>
        </div>
      </div>
      <div class="form-item">
        <label>상품명<span class="required">*</span></label>
        <input type="text" v-model="form.name"/>
      </div>
      <div class="form-item">
        <label>상품 원가<span class="required">*</span></label>
        <input type="number" v-model="form.originCost"/>
      </div>
      <div class="form-item">
        <label>렌탈료<span class="required">*</span></label>
        <input type="number" v-model="form.rentalCost"/>
      </div>
    </div>
    <div class="form-item full-width">
      <label>설명</label>
      <textarea rows="3" v-model="form.description" />
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
  import { ref, watch } from "vue";

  const imgUploaded = ref(true);
  const showImageUploadModal = ref(false);

  const props = defineProps({
    modelValue: {
      type: Object,
      required: true,
    },
  });

  const emit = defineEmits(["update:modelValue"]);

  const form = ref(JSON.parse(JSON.stringify(props.modelValue)));

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


  function handleUploadSuccess(imageUrl) {
    form.imageUrl = imageUrl;
    showImageUploadModal.value = false;
  }

  function submitForm() {
    return { form: form.value };
  }

  defineExpose({
    submitForm
  });
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

.required {
  color: #d32f2f;
  font-size: 18px;
  margin-left: 6px;
}
</style>
