<template>
  <div class="mypage-container">
    <div class="profile-section">
      <div class="profile-image" @click="openProfileModal">
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
        <button @click="showPasswordModal = true" class="change-btn">변경</button>
      </div>
      
      <div class="info-item">
        <label>이름</label>
        <span v-if="!isEditMode">{{ userInfo.name }}</span>
        <div v-else class="input-wrapper">
          <input 
            type="text" 
            v-model="tempUserInfo.name" 
            class="edit-input"
            @input="validateName"
            @keypress="onlyKorean"
          >
          <span v-if="nameError" class="error-message name-error">{{ nameError }}</span>
        </div>
      </div>
      
      <div class="info-item">
        <label>연락처</label>
        <span v-if="!isEditMode">{{ formattedPhone }}</span>
        <div v-else class="input-wrapper">
          <input 
            type="text" 
            v-model="tempUserInfo.phone" 
            class="edit-input"
            @keypress="onlyNumbers"
            @input="validatePhone"
            maxlength="11"
          >
          <span v-if="phoneError" class="error-message phone-error">{{ phoneError }}</span>
        </div>
      </div>
      
      <div class="info-item">
        <label>이메일</label>
        <span v-if="!isEditMode">{{ userInfo.email }}</span>
        <div v-else class="input-wrapper">
          <input type="email" v-model="tempUserInfo.email" class="edit-input">
        </div>
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

      <div class="edit-buttons" v-if="!isEditMode">
        <button @click="startEdit" class="edit-btn">수정</button>
      </div>
      <div class="edit-buttons" v-else>
        <button @click="saveChanges" class="save-btn">저장</button>
        <button @click="cancelEdit" class="cancel-btn">취소</button>
      </div>
    </div>
  </div>

  <div v-if="showPasswordModal" class="modal-overlay">
    <div class="modal-content">
      <h2>비밀번호 변경</h2>
      <div class="input-group">
        <label>현재 비밀번호</label>
        <input type="password" v-model="passwordForm.currentPassword" />
      </div>
      <div class="input-group">
        <label>새 비밀번호</label>
        <input type="password" v-model="passwordForm.newPassword" />
        <span v-if="lengthError" class="error-message">{{ lengthError }}</span>
      </div>
      <div class="input-group">
        <label>새 비밀번호 확인</label>
        <input type="password" v-model="passwordForm.confirmPassword" />
        <span v-if="passwordError" class="error-message">{{ passwordError }}</span>
      </div>
      <div class="modal-buttons">
        <button @click="handlePasswordChange" class="confirm-btn" :disabled="!isPasswordValid">확인</button>
        <button @click="closePasswordModal" class="cancel-btn">취소</button>
      </div>
    </div>
  </div>

  <div v-if="showProfileModal" class="modal-overlay">
    <div class="modal-content profile-modal">
      <h2>프로필 이미지 변경</h2>
      
      <div class="profile-options">
        <div class="url-input">
          <label>이미지 URL</label>
          <input type="text" v-model="profileUrl" placeholder="이미지 URL을 입력하세요">
        </div>
        
        <div class="file-upload">
          <label>파일 업로드</label>
          <div 
            class="upload-box" 
            @click="$refs.fileInput.click()"
            @dragover.prevent="handleDragOver"
            @dragleave.prevent="handleDragLeave"
            @drop.prevent="handleDrop"
            :class="{ 'drag-over': isDragOver }"
          >
            <svg v-if="!selectedFile" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 5V19M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span v-if="selectedFile">{{ selectedFile.name }}</span>
            <span v-else class="upload-text">클릭하거나 파일을 드래그하세요</span>
          </div>
          <input 
            type="file" 
            ref="fileInput" 
            @change="handleFileSelect" 
            accept="image/*" 
            multiple="false"
            style="display: none"
          >
        </div>
      </div>

      <div class="modal-buttons">
        <button @click="saveProfile" class="save-btn">저장</button>
        <button @click="closeProfileModal" class="cancel-btn">취소</button>
      </div>
    </div>
  </div>
</template>

<script>
import api from '@/api/auth';
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
      },
      showPasswordModal: false,
      showProfileModal: false,
      passwordForm: {
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      },
      passwordError: '',
      lengthError: '',
      isEditMode: false,
      tempUserInfo: {},
      profileUrl: '',
      selectedFile: null,
      phoneError: '',
      nameError: '',
      isDragOver: false
    }
  },
  computed: {
    formattedPhone() {
      if (!this.userInfo.phone) return '';
      const phone = this.userInfo.phone.replace(/[^0-9]/g, '');
      if (phone.length !== 11) return this.userInfo.phone;
      return `${phone.slice(0, 3)}-${phone.slice(3, 7)}-${phone.slice(7)}`;
    },
    isPasswordValid() {
      return this.passwordForm.newPassword.length >= 8 && !this.passwordError;
    }
  },
  watch: {
    'passwordForm.confirmPassword': function(newVal) {
      if (newVal && this.passwordForm.newPassword !== newVal) {
        this.passwordError = '비밀번호가 일치하지 않습니다.';
      } else {
        this.passwordError = '';
      }
    },
    'passwordForm.newPassword': function(newVal) {
      if (this.passwordForm.confirmPassword && newVal !== this.passwordForm.confirmPassword) {
        this.passwordError = '비밀번호가 일치하지 않습니다.';
      } else {
        this.passwordError = '';
      }
      
      if (newVal && newVal.length < 8) {
        this.lengthError = '비밀번호는 8자 이상이어야 합니다.';
      } else {
        this.lengthError = '';
      }
    }
  },
  methods: {
    async fetchUserInfo() {
      try {
        const auth = useAuthStore();
        const response = await api.get('/employee/mypage', {
          headers: {
            Authorization: `Bearer ${auth.accessToken}`
          },
          withCredentials: true
        });
        this.userInfo = response.data;
      } catch (error) {
        console.error('사용자 정보를 불러오는데 실패했습니다:', error);
      }
    },
    async handlePasswordChange() {
      if (!this.isPasswordValid) {
        return;
      }

      try {
        const auth = useAuthStore();
        const response = await api.post('/employee/password-change', {
          currentPassword: this.passwordForm.currentPassword,
          newPassword: this.passwordForm.newPassword
        }, {
          headers: {
            Authorization: `Bearer ${auth.accessToken}`
          }
        });
        
        if (response.data && response.data.message) {
          alert(response.data.message);
        } else {
          alert('비밀번호가 성공적으로 변경되었습니다.');
        }
        this.closePasswordModal();
      } catch (error) {
        console.error('비밀번호 변경에 실패했습니다:', error);
        if (error.response && error.response.data) {
          alert(error.response.data);
        } else {
          alert('비밀번호 변경에 실패했습니다.');
        }
      }
    },
    closePasswordModal() {
      this.showPasswordModal = false;
      this.passwordForm = {
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      };
      this.passwordError = '';
      this.lengthError = '';
    },
    startEdit() {
      this.isEditMode = true;
      this.tempUserInfo = { ...this.userInfo };
    },
    cancelEdit() {
      this.isEditMode = false;
      this.tempUserInfo = {};
    },
    async saveChanges() {
      try {
        const auth = useAuthStore();
        console.log('정보 수정 요청 시작:', {
          url: '/employee/mypage',
          data: this.tempUserInfo
        });

        const response = await api.patch('/employee/mypage', this.tempUserInfo, {
          headers: {
            Authorization: `Bearer ${auth.accessToken}`
          }
        });
        
        console.log('정보 수정 응답:', response);
        
        if (response.data) {
          this.userInfo = { ...this.tempUserInfo };
          const auth = useAuthStore();
          auth.updateUserName(this.tempUserInfo.name);
          this.isEditMode = false;
          alert('정보가 성공적으로 수정되었습니다.');
        }
      } catch (error) {
        console.error('정보 수정에 실패했습니다:', error);
        console.error('에러 상세:', {
          status: error.response?.status,
          data: error.response?.data,
          headers: error.response?.headers
        });
        if (error.response && error.response.data) {
          alert(error.response.data);
          this.isEditMode = false;
        } else {
          alert('정보 수정에 실패했습니다.');
        }
      }
    },
    openProfileModal() {
      this.showProfileModal = true;
      this.profileUrl = this.userInfo.profilePath || '';
    },
    closeProfileModal() {
      this.showProfileModal = false;
      this.profileUrl = '';
      this.selectedFile = null;
    },
    handleFileSelect(event) {
      const files = event.target.files;
      if (files.length > 1) {
        alert('하나의 이미지 파일만 선택 가능합니다. 첫 번째 파일이 선택됩니다.');
      }
      this.selectedFile = files[0];
    },
    async saveProfile() {
      try {
        const auth = useAuthStore();
        
        if (this.selectedFile) {
          const formData = new FormData();
          formData.append('file', this.selectedFile);
          formData.append('type', 'PROFILE');
          
          console.log('파일 업로드 요청 시작:', {
            url: '/api/command/file/upload',
            file: this.selectedFile.name
          });

          const uploadResponse = await api.post('/api/command/file/upload', formData, {
            headers: {
              Authorization: `Bearer ${auth.accessToken}`,
              'Content-Type': 'multipart/form-data'
            }
          });
          
          console.log('파일 업로드 응답:', uploadResponse);

          if (uploadResponse.data && uploadResponse.data.id) {
            console.log('프로필 업데이트 요청 시작:', {
              url: '/employee/mypage/profile',
              fileId: uploadResponse.data.id
            });

            const profileResponse = await api.patch('/employee/mypage/profile', {
              fileId: uploadResponse.data.id
            }, {
              headers: {
                Authorization: `Bearer ${auth.accessToken}`
              }
            });
            
            console.log('프로필 업데이트 응답:', profileResponse);

            if (profileResponse.data) {
              this.userInfo.profilePath = uploadResponse.data.url;
              const auth = useAuthStore();
              auth.updateProfileImage(uploadResponse.data.url);
              alert('프로필 이미지가 변경되었습니다.');
              this.closeProfileModal();
            }
          }
        } else if (this.profileUrl) {

          try {
            new URL(this.profileUrl);
          } catch (e) {
            alert('유효한 URL을 입력해주세요.');
            return;
          }

          console.log('프로필 이미지 변경 요청 시작:', {
            url: '/employee/mypage/profile-path',
            data: { path: this.profileUrl }
          });

          const response = await api.patch('/employee/mypage/profile-path', {
            path: this.profileUrl
          }, {
            headers: {
              Authorization: `Bearer ${auth.accessToken}`
            }
          });
          
          console.log('프로필 이미지 변경 응답:', response);

          if (response.data) {
            this.userInfo.profilePath = this.profileUrl;
            const auth = useAuthStore();
            auth.updateProfileImage(this.profileUrl);
            alert('프로필 이미지가 변경되었습니다.');
            this.closeProfileModal();
          }
        } else {
          alert('이미지 파일을 선택하거나 URL을 입력해주세요.');
        }
      } catch (error) {
        console.error('프로필 이미지 변경에 실패했습니다:', error);
        console.error('에러 상세:', {
          status: error.response?.status,
          data: error.response?.data,
          headers: error.response?.headers
        });
        if (error.response && error.response.data) {
          alert(error.response.data);
        } else if (error.response && error.response.status === 400) {
          alert('유효하지 않은 이미지 URL입니다.');
        } else {
          alert('프로필 이미지 변경에 실패했습니다.');
        }
      }
    },
    validatePhone(event) {
      const value = event.target.value;
      if (!/^\d*$/.test(value)) {
        this.phoneError = '숫자만 입력하실 수 있습니다.';
        this.tempUserInfo.phone = value.replace(/[^\d]/g, '');
      } else if (value.length > 11) {
        this.phoneError = '연락처는 11자리만 입력 가능합니다.';
        this.tempUserInfo.phone = value.slice(0, 11);
      } else {
        this.phoneError = '';
      }
    },
    onlyNumbers(event) {
      const keyCode = event.keyCode;
      const currentValue = this.tempUserInfo.phone || '';
      
      if (keyCode < 48 || keyCode > 57) {
        event.preventDefault();
        this.phoneError = '숫자만 입력하실 수 있습니다.';
      } else if (currentValue.length >= 11) {
        event.preventDefault();
        this.phoneError = '연락처는 11자리만 입력 가능합니다.';
      } else {
        this.phoneError = '';
      }
    },
    validateName(event) {
      const value = event.target.value;
      if (!/^[가-힣]*$/.test(value)) {
        this.nameError = '한글만 입력하실 수 있습니다.';
        this.tempUserInfo.name = value.replace(/[^가-힣]/g, '');
      } else {
        this.nameError = '';
      }
    },
    onlyKorean(event) {
      const keyCode = event.keyCode;
      if (!((keyCode >= 12593 && keyCode <= 12643) ||
            (keyCode >= 44032 && keyCode <= 55203) ||
            keyCode === 8 ||
            keyCode === 46)) {
        event.preventDefault();
        this.nameError = '한글만 입력하실 수 있습니다.';
      } else {
        this.nameError = '';
      }
    },
    handleDragOver(event) {
      event.preventDefault();
      this.isDragOver = true;
    },
    handleDragLeave(event) {
      event.preventDefault();
      this.isDragOver = false;
    },
    handleDrop(event) {
      event.preventDefault();
      this.isDragOver = false;
      const files = event.dataTransfer.files;
      if (files.length > 1) {
        alert('하나의 이미지 파일만 업로드 가능합니다. 첫 번째 파일이 선택됩니다.');
      }
      if (files.length > 0) {
        const file = files[0];
        if (file.type.startsWith('image/')) {
          this.selectedFile = file;
        } else {
          alert('이미지 파일만 업로드 가능합니다.');
        }
      }
    }
  },
  mounted() {
    this.fetchUserInfo();
  }
}
</script>

<style scoped>
.mypage-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 2rem;
}

.profile-section {
  display: flex;
  justify-content: center;
  margin-bottom: 2rem;
}

.profile-image {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid #e0e0e0;
  cursor: pointer;
  transition: border-color 0.3s;
}

.profile-image:hover {
  border-color: #2196F3;
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
}

.info-item {
  display: flex;
  align-items: center;
  padding: 1rem 0;
  border-bottom: 1px solid #e0e0e0;
  min-height: 48px;
  max-width: 700px;
  margin: 0 auto;
}

.info-item:last-child {
  border-bottom: none;
}

.info-item label {
  width: 120px;
  font-weight: bold;
  color: #333;
  margin-right: 20px;
}

.info-item span {
  flex: 1;
  color: #666;
  line-height: 1.5;
  padding-left: 10px;
}

.change-btn {
  padding: 0.5rem 1rem;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
  margin-left: 10px;
}

.change-btn:hover {
  background-color: #45a049;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  width: 380px;
}

.modal-content h2 {
  margin-bottom: 3rem;
  text-align: center;
}

.input-group {
  margin-bottom: 1rem;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

.input-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: normal;
  width: 100%;
  text-align: left;
  padding-left: 1rem;
}

.input-group input {
  width: calc(100% - 2rem);
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin: 0 auto;
}

.modal-buttons {
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  margin-top: 1.5rem;
}

.confirm-btn, .cancel-btn {
  padding: 0.5rem 1.25rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  min-width: 80px;
}

.confirm-btn {
  background-color: #a6ce39;
  color: white;
}

.cancel-btn {
  background-color: #e53935;
  color: white;
}

.confirm-btn:hover {
  background-color: #94b933;
}

.cancel-btn:hover {
  background-color: #c62828;
}

.error-message {
  color: #ff0000;
  font-size: 0.6rem;
  margin-top: 3px;
  margin-left: 20px;
  display: block;
  font-weight: 500;
  margin-bottom: -17px;
  margin-top: 3px;
}

.phone-error {
  color: #ff0000 !important;
}

.confirm-btn:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.confirm-btn:disabled:hover {
  background-color: #cccccc;
}

.edit-buttons {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 2rem;
}

.edit-btn, .save-btn {
  padding: 0.5rem 1.25rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  min-width: 80px;
}

.edit-btn {
  background-color: #4791ff;
  color: white;
}

.save-btn {
  background-color: #a6ce39;
  color: white;
}

.edit-input {
  width: calc(100% - 130px);
  padding: 0.3rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.9rem;
  height: 24px;
  line-height: 24px;
  margin-left: 30px;
}

.edit-btn:hover {
  background-color: #317ae0;
}

.save-btn:hover {
  background-color: #94b933;
}

.profile-modal {
  width: 400px;
}

.profile-options {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin: 1.5rem 0;
}

.url-input {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.url-input input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.file-upload {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.upload-box {
  border: 2px dashed #ddd;
  border-radius: 4px;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: border-color 0.3s;
}

.upload-box:hover {
  border-color: #2196F3;
}

.upload-box svg {
  color: #666;
}

.upload-box span {
  color: #666;
  font-size: 0.9rem;
}

.input-wrapper {
  display: flex;
  flex-direction: column;
  width: 100%;
  position: relative;
}

.name-error {
  color: #ff0000 !important;
}

.drag-over {
  border-color: #2196F3 !important;
  background-color: rgba(33, 150, 243, 0.1);
}

.upload-text {
  color: #666;
  font-size: 0.9rem;
  margin-top: 0.5rem;
}
</style>
