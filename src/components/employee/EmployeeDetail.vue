<template>
  <div class="employee-detail-card" v-if="employee">
    <div class="profile-section">
      <div class="profile-photo">
        <img :src="employee.profilePath" alt="프로필 사진" />
      </div>
      <div class="profile-info">
        <div class="name-title">
          <span class="name">{{ employee.name }}</span>
          <span class="position">{{ employee.level }}</span>
        </div>
        <div class="contact-info">
          <div>{{ formatPhone(employee.phone) }}</div>
          <div>{{ employee.email }}</div>
          <div>{{ employee.departmentName }}</div>
        </div>
      </div>
    </div>
    <div class="info-table-section">
      <table class="info-table">
        <tr>
          <th>직책</th>
          <td>{{ employee.level }}</td>
        </tr>
        <tr>
          <th>소속</th>
          <td>{{ employee.departmentName }}</td>
        </tr>
        <tr>
          <th>사원번호</th>
          <td>{{ employee.code }}</td>
        </tr>
        <tr>
          <th>입사일</th>
          <td>{{ employee.hireDate }}</td>
        </tr>
        <tr>
          <th>근무지</th>
          <td>{{ employee.workPlace || '-' }}</td>
        </tr>
      </table>
    </div>
  </div>
  <div v-else class="employee-detail-card empty-state">
    <div class="empty-message">
      사원을 선택해주세요
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  employee: {
    type: Object,
    required: false,
    default: null
  }
});

const formatPhone = (phone) => {
  if (!phone) return '-';
  return phone.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
};
</script>

<style scoped lang="scss">
.employee-detail-card {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 32px;
}
.profile-section {
  display: flex;
  gap: 24px;
  align-items: flex-start;
  margin-bottom: 8px;
}
.profile-photo {
  width: 80px;
  height: 100px;
  background: #f3f3f3;
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}
.profile-photo img {
  width: 80px;
  height: 100px;
  object-fit: cover;
}
.profile-info {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.name-title {
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 2px;
  display: flex;
  gap: 8px;
  align-items: center;
}
.name {
  color: #222;
}
.position {
  color: #888;
  font-size: 15px;
  font-weight: 500;
}
.contact-info {
  font-size: 13px;
  color: #444;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.info-table-section {
  width: 100%;
}
.info-table {
  width: 100%;
  border-collapse: collapse;
  background: #fafafa;
  border-radius: 8px;
  overflow: hidden;
  font-size: 14px;
}
.info-table th {
  background: #f5f5f5;
  text-align: left;
  padding: 12px 16px;
  width: 90px;
  color: #666;
  font-weight: 600;
  border-bottom: 1px solid #eee;
}
.info-table td {
  padding: 12px 16px;
  color: #222;
  border-bottom: 1px solid #eee;
}
.info-table tr:last-child th,
.info-table tr:last-child td {
  border-bottom: none;
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  background: #fafafa;
  border-radius: 8px;
}

.empty-message {
  color: #888;
  font-size: 15px;
  font-weight: 500;
}
</style>