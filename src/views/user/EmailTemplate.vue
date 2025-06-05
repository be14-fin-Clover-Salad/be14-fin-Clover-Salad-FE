<template>
  <div class="email-template">
    <div class="email-content">
      <img src="/logo_text.svg" alt="logo" class="logo" />
      <h1>비밀번호 재설정</h1>
      <p class="description">
        안녕하세요. 비밀번호 재설정을 요청하셨습니다.<br />
        아래 버튼을 클릭하여 새로운 비밀번호를 설정해주세요.
      </p>
      <a :href="resetLink" class="reset-button">비밀번호 재설정하기</a>
      <p class="warning">
        * 이 링크는 24시간 동안만 유효합니다.<br />
        * 비밀번호 재설정을 요청하지 않으셨다면 이 이메일을 무시하셔도 됩니다.
      </p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  token: {
    type: String,
    required: true
  }
});

const resetLink = computed(() => {
  return `${window.location.origin}/reset-password?token=${props.token}`;
});
</script>

<style scoped>
.email-template {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}

.email-content {
  background-color: #ffffff;
  padding: 40px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.logo {
  height: 60px;
  margin-bottom: 24px;
}

h1 {
  color: #333333;
  font-size: 24px;
  margin-bottom: 16px;
}

.description {
  color: #666666;
  font-size: 16px;
  line-height: 1.5;
  margin-bottom: 24px;
}

.reset-button {
  display: inline-block;
  background-color: #d5eb97;
  color: #333333;
  padding: 12px 24px;
  border-radius: 6px;
  text-decoration: none;
  font-weight: 500;
  margin-bottom: 24px;
  transition: background-color 0.2s;
}

.reset-button:hover {
  background-color: #c5db87;
}

.warning {
  color: #666666;
  font-size: 14px;
  line-height: 1.5;
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #eeeeee;
}
</style> 