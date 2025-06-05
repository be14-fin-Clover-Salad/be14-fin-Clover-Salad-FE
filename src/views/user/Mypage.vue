<template>
  <div class="mypage-container">
    <div class="profile-section">
      <div class="profile-image">
        <img :src="userInfo.profilePath || '/default-profile.png'" alt="프로필 이미지">
      </div>
    </div>
    
    <div class="info-section">
      <div class="info-item">
        <label>사번</label>
        <span>{{ userInfo.code }}</span>
      </div>
      
      <div class="info-item">
        <label>비밀번호</label>
        <button @click="changePassword" class="change-btn">변경</button>
      </div>
      
      <div class="info-item">
        <label>이름</label>
        <span>{{ userInfo.name }}</span>
      </div>
      
      <div class="info-item">
        <label>연락처</label>
        <span>{{ formattedPhone }}</span>
      </div>
      
      <div class="info-item">
        <label>이메일</label>
        <span>{{ userInfo.email }}</span>
      </div>
      
      <div class="info-item">
        <label>직급</label>
        <span>{{ userInfo.level }}</span>
      </div>
      
      <div class="info-item">
        <label>입사일</label>
        <span>{{ userInfo.hireDate }}</span>
      </div>
      
      <div class="info-item">
        <label>근무지</label>
        <span>{{ userInfo.workPlace }}</span>
      </div>
      
      <div class="info-item">
        <label>부서</label>
        <span>{{ userInfo.departmentName }}</span>
      </div>
    </div>
  </div>
</template>

<script>
import axios from '@/api/auth';
import { useAuthStore } from '@/stores/auth';

export default {
  name: 'Mypage',
  data() {
    return {
      userInfo: {
        code: '',
        name: '',
        phone: '',
        email: '',
        level: '',
        hireDate: '',
        workPlace: '',
        departmentName: '',
        profilePath: ''
      }
    }
  },
  computed: {
    formattedPhone() {
      if (!this.userInfo.phone) return '';
      const phone = this.userInfo.phone.replace(/[^0-9]/g, '');
      if (phone.length !== 11) return this.userInfo.phone;
      return `${phone.slice(0, 3)}-${phone.slice(3, 7)}-${phone.slice(7)}`;
    }
  },
  methods: {
    async fetchUserInfo() {
      try {
        const auth = useAuthStore();
        const response = await axios.get('/employee/mypage', {
          headers: {
            Authorization: `Bearer ${auth.accessToken}`
          }
        });
        this.userInfo = response.data;
      } catch (error) {
        console.error('사용자 정보를 불러오는데 실패했습니다:', error);
      }
    },
    changePassword() {
      // 비밀번호 변경 로직 구현
    }
  },
  mounted() {
    this.fetchUserInfo();
  }
}
</script>

<style scoped>
.mypage-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.profile-section {
  display: flex;
  justify-content: center;
  margin-bottom: 2rem;
}

.profile-image {
  width: 200px;
  height: 200px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid #e0e0e0;
}

.profile-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.info-section {
  background: #fff;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.info-item {
  display: flex;
  align-items: center;
  padding: 1rem 0;
  border-bottom: 1px solid #e0e0e0;
}

.info-item:last-child {
  border-bottom: none;
}

.info-item label {
  width: 100px;
  font-weight: bold;
  color: #333;
}

.info-item span {
  flex: 1;
  color: #666;
}

.change-btn {
  padding: 0.5rem 1rem;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.change-btn:hover {
  background-color: #45a049;
}
</style>
