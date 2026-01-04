<script setup lang="ts">
import PageContainer from '@renderer/components/page/PageContainer.vue';
import { ref } from 'vue';
const search = ref('');
</script>
<template>
  <PageContainer>
    <template #header>
      <div>
        <h1 class="text-2xl font-bold text-amber-500">股票监控</h1>
      </div>
    </template>
    <div>
      <input v-model="search" type="text" placeholder="请输入股票代码" />
      <div>
        <h1 v-for="value in 50" :key="value">啊啊啊啊</h1>
      </div>
    </div>
  </PageContainer>
</template>
