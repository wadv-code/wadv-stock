<script setup lang="ts">
import { reactive } from 'vue';
import { format } from 'date-fns';
import { GetDataSummary } from '@renderer/api/xcdh';
import { useGlobalRefresh } from '@renderer/core/useGlobalRefresh';
import { CountTo } from 'vue3-count-to';

const summary = reactive<{
  total: number;
  financing: number;
  trade_date: string;
}>({ total: 0, financing: 0, trade_date: '' });
const onRefresh = async () => {
  try {
    const { data } = await GetDataSummary();
    summary.total = parseFloat((data.total / 10000).toFixed(2));
    summary.financing = parseFloat((data.financing / 10000).toFixed(2));
    summary.trade_date = format(new Date(data.trade_date), 'yyyy-MM-dd');
  } catch (error) {
    console.error(error);
  }
};

useGlobalRefresh(onRefresh, { second: 5, key: 'global-refresh', immediate: true });
</script>
<template>
  <div class="flex flex-col justify-center items-around text-center">
    <div class="flex flex-wrap justify-around text-xs text-primary font-bold">
      <span>成交总额</span>
      <CountTo :end-val="summary.total" :duration="1000" separator="" suffix="万亿" :decimals="2" />
    </div>
    <div class="flex flex-wrap justify-around text-xs text-blue-500 font-bold mt-2">
      <span>融资总额</span>
      <CountTo
        :end-val="summary.financing"
        :duration="1000"
        separator=""
        suffix="万亿"
        :decimals="2"
      />
    </div>
  </div>
</template>
