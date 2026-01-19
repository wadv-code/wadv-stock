<script setup lang="ts">
import { reactive } from 'vue';
import { format } from 'date-fns';
import { GetDataSummary } from '@renderer/api/xcdh';
import { useGlobalRefresh } from '@renderer/core/useGlobalRefresh';

const summary = reactive<{
  total: string;
  financing: string;
  trade_date: string;
}>({ total: '0', financing: '0', trade_date: '' });
const onRefresh = async () => {
  try {
    const { data } = await GetDataSummary();
    summary.total = (data.total / 10000).toFixed(2);
    summary.financing = (data.financing / 10000).toFixed(2);
    summary.trade_date = format(new Date(data.trade_date), 'yyyy-MM-dd');
  } catch (error) {
    console.error(error);
  }
};

useGlobalRefresh(onRefresh, { second: 5, key: 'global-refresh', immediate: true });
</script>
<template>
  <div class="flex flex-col justify-center items-around">
    <div class="flex flex-wrap justify-around text-xs text-primary font-bold">
      <span>成交总额</span>
      <span>{{ summary.total }}万亿</span>
    </div>
    <div class="flex flex-wrap justify-around text-xs text-blue-500 font-bold mt-2">
      <span>融资总额</span>
      <span>{{ summary.financing }}万亿</span>
    </div>
  </div>
</template>
