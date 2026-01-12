<script setup lang="ts">
import { GetDataSummary, GetQuote } from '@renderer/api/xcdh';
import { reactive, ref } from 'vue';
import type { Quote } from './type';
import { useGlobalRefresh } from '@renderer/core/useGlobalRefresh';
import { useTimeIntervalFn } from '@renderer/core/useTimeIntervalFn';
import { format } from 'date-fns';

const quoteItems = ref<Quote[]>([]);
const summary = reactive<{
  total: string;
  financing: string;
  trade_date: string;
}>({ total: '0', financing: '0', trade_date: '' });
const checked = ref(0);

const onRefresh = async () => {
  try {
    const { data } = await GetDataSummary();
    summary.total = (data.total / 10000).toFixed(2);
    summary.financing = (data.financing / 10000).toFixed(2);
    summary.trade_date = format(new Date(data.trade_date), 'yyyy-MM-dd');
    const { data: quote } = await GetQuote<Quote[]>();
    quoteItems.value = quote.slice(0, 5);
  } catch (error) {
    console.error(error);
  }
};

const getRiseClass = (chg: number) => {
  if (isNaN(chg)) return '';
  if (chg > 0) return 'text-red-500';
  if (chg < 0) return 'text-green-500';
  return '';
};

useGlobalRefresh(onRefresh, { second: 5, key: 'global-refresh', immediate: true });

const { pause, resume } = useTimeIntervalFn(
  () => {
    checked.value = checked.value === 0 ? 1 : 0;
  },
  { time: 5000 }
);
</script>

<template>
  <div
    class="w-full h-8 flex flex-col gap-x-1 text-sm overflow-hidden relative"
    @mouseenter="pause"
    @mouseleave="resume"
  >
    <div
      class="w-full absolute left-0 top-0 transition-transform hover:translate-y-0 duration-300 ease-in-out"
      :class="{ '-translate-y-8': checked === 1 }"
    >
      <div class="p-1 w-full h-8 flex items-center overflow-x-hidden font-bold text-[13px]">
        <div
          v-for="quote in quoteItems"
          :class="getRiseClass(quote.chg)"
          :key="quote.tS_CODE"
          class="flex items-center gap-x-1 border-r border-gray-300 dark:border-gray-300/30 px-1 last:border-0 shrink-0"
        >
          <span>{{ quote.name }}</span>
          <span class="font-bold">{{ quote.price.toFixed(2) }}</span>
          <span class="text-xs">
            {{ quote.chg > 0 ? '+' : '' }}{{ (quote.price - quote.prE_CLOSE).toFixed(2) }}
          </span>
          <span class="text-xs">{{ quote.chg > 0 ? '+' : '' }}{{ quote.chg.toFixed(2) }}%</span>
        </div>
      </div>
      <div class="p-1 w-full h-8 flex items-center gap-x-2 overflow-x-hidden font-bold">
        <span class="text-red-500">成交总额：{{ summary.total || 0 }}万亿</span>
        <span class="text-blue-500">融资总额：{{ summary.financing || 0 }}万亿</span>
        <span>我是增量更新的结果</span>
      </div>
    </div>
    <!-- <div class="ml-auto h-8 flex items-center gap-x-1 z-10 relative px-2 cursor-pointer">
      <Switch v-model="stopScroll" id="scroll-mode" />
      <Label for="scroll-mode">停止滚动</Label>
    </div> -->
  </div>
</template>
