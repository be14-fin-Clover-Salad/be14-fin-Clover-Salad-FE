<template>
  <div class="table-box">
    <div class="table-header">
      <div class="row-count">총 {{ customers.length }}건</div>
      <!-- <button class="register-button">등록</button> -->
    </div>
    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>고객명</th>
          <th>생년월일</th>
          <th>연락처</th>
          <th>주소</th>
          <th>이메일</th>
          <th>고객등록일</th>
          <th>비고</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(customer, index) in customers" :key="customer.id">
          <td>{{ index + 1 }}</td>
          <td>{{ customer.name }}</td>
          <td>{{ customer.birth }}</td>
          <td>{{ customer.phone }}</td>
          <td>{{ customer.address }}</td>
          <td>{{ customer.email }}</td>
          <td>{{ customer.createdAt }}</td>
          <td>{{ customer.note }}</td>
        </tr>
        <tr v-if="customers.length === 0">
          <td colspan="8" style="text-align: center; color: #aaa">
            조회된 고객이 없습니다.
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref } from "vue";
const customers = ref([]);

const loadData = async (conditions) => {
  console.log("검색 조건:", conditions);
  customers.value = [
    {
      id: 1,
      name: "홍길동",
      birth: "1990-01-01",
      phone: "010-1234-5678",
      address: "서울시 강남구",
      email: "hong@example.com",
      createdAt: "2023-01-01",
      note: "VIP 고객",
    },
  ];
};

defineExpose({ loadData });
</script>

<style scoped>
.table-box {
  background-color: white;
  border: 1px solid #eee;
  border-radius: 6px;
  padding: 16px;
}
.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}
.row-count {
  font-size: 14px;
  color: #666;
}
/* .register-button {
  background-color: #86b649;
  color: white;
  border: none;
  padding: 6px 14px;
  border-radius: 4px;
  cursor: pointer;
} */
table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}
th,
td {
  padding: 8px;
  border-bottom: 1px solid #ddd;
  text-align: left;
}
th {
  background-color: #f8f8f8;
  font-weight: 600;
  color: #333;
}
</style>
