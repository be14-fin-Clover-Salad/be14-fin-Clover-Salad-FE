<template>
  <div class="qna-view">
    <h1>문의사항</h1>
    <QnaList />
  </div>
</template>

<script setup>
import QnaList from '@/components/qna/QnaList.vue'
</script>

<style scoped>
.qna-view {
  padding: 2rem;
}
</style>
