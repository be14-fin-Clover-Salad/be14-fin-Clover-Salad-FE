<template>
  <section>
    <SearchFilterShell 
      :initial="searchForm" 
      :expanded="isExpanded"
      @search="handleSearch" 
      @reset="handleReset"
      @toggle-expand="handleToggleExpand"
    >
      <template #fields="{ filters, expanded }">
        <ProductSearchFields :filters="filters" :expanded="expanded"/>
        <!-- 기존 버전 -->
    <!-- <SearchFilterShell :initial="searchForm" :showToggle="false" @search="handleSearch" @reset="handleReset">
      <template #fields="{ filters }">
        <ProductSearchFields :filters="filters"/> -->
      </template>
    </SearchFilterShell>
    <div class="action-buttons">
      <button v-if="isAdmin" class="register-btn" @click="registerProduct">등록</button>
    </div>
    <BaseDataTable
      :rows="rows"
      :columns="columns"
      :isLoading="isLoading"
      :selectedCode="selectedRowCode"
      @row-click="handleRowClick"
      @row-dblclick="handleRowDblClick"
    />
  </section>
</template>

<script setup>
  import BaseDataTable from "@/components/BaseDataTable.vue";
  import SearchFilterShell from "@/components/common/SearchFilterShell.vue";
  import ProductSearchFields from "@/components/product/ProductSearchFields.vue";
  import { computed, reactive, ref } from "vue";
  import { useRouter } from 'vue-router'
  import api from "@/api/auth.js";
  import { useAuthStore } from "@/stores/auth.js";

  const searchForm = reactive({
    productCode: '',
    category: '',
    name: '',
    serialNumber: '',
    company: '',
    originCostStart: '',
    originCostEnd: '',
    rentalCostStart: '',
    rentalCostEnd: ''
  });

  const router = useRouter()
  const rows = reactive([])
  const authStore = useAuthStore();
  const isLoading = ref(false)
  const productId = ref(null)
  const isExpanded = ref(false)
  const selectedRowCode = ref(null)

  // 관리자 권한 확인
  const isAdmin = computed(() => {
    return authStore.userLevel === '관리자';
  });

  async function handleSearch(data) {
    try {
      isLoading.value = true
      const response = await api.get('/api/product/list', {
        params: data
      })
      // index 부여
      const indexedData = response.data.map((item, idx) => ({
        ...item,
        index: idx + 1,
        originCost: formatNumber(item.originCost),
        rentalCost: formatNumber(item.rentalCost),
      }))
      rows.splice(0, rows.length, ...indexedData)
    } catch (error) {
      console.error('검색 실패:', error);
    } finally {
      isLoading.value = false
    }
  }

  // 숫자 포맷팅 함수
  const formatNumber = (value) => {
    if (!value) return '';
    // 숫자가 아닌 문자 제거
    const numericValue = value.toString().replace(/[^\d]/g, '');
    // 세자리마다 쉼표 추가
    return numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  function handleReset() {
    Object.keys(searchForm).forEach(key => searchForm[key] = '')
  }

  function handleToggleExpand(expanded) {
    isExpanded.value = expanded
  }

  function handleRowClick(product) {
    selectedRowCode.value  = product.id
  }

  function handleRowDblClick(product) {
    productId.value = product.id;
    if (productId.value) {
      router.push(`/product/detail/${productId.value}`);
    } else {
      console.warn('선택된 상품이 없습니다.');
    }
  }

  function registerProduct() {
    router.push("/product/register");
  }

  const columns = [
    { label: '#', key: 'index' },
    { label: '상품 코드', key: 'productCode' },
    { label: '카테고리', key: 'category' },
    { label: '상품명', key: 'name' },
    { label: '모델명', key: 'serialNumber' },
    { label: '제조사', key: 'company' },
    { label: '원가', key: 'originCost' },
    { label: '월 렌탈료', key: 'rentalCost' }
  ]
</script>

<style scoped>
  section {
    padding: 20px;
    width: 100%;
    box-sizing: border-box;
  }
  ::v-deep(.data-table) {
    width: 100%;
    table-layout: auto;
  }
  .action-buttons {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    margin-top: 16px;
  }
  .register-btn {
    background-color: #6c87c1;
    color: white;
    border: none;
    border-radius: 6px;
    padding: 8px 16px;
    font-size: 14px;
    cursor: pointer;
  }
</style>
