<script setup lang="ts">
import { CountTo } from 'vue3-count-to';
import PageContainer from '@renderer/components/page/PageContainer.vue';
import { onMounted, ref } from 'vue';

const count = ref(1234);

onMounted(() => {
  setInterval(() => {
    count.value++;
  }, 5000);
});
</script>
<template>
  <PageContainer>
    <template #header>
      <div>
        <h1 class="text-2xl font-bold text-amber-500">股票监控</h1>
      </div>
    </template>
    <div>
      <CountTo :end-val="count" :duration="1000" separator="" />
    </div>
  </PageContainer>
</template>
