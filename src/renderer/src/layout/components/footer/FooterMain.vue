<script setup lang="ts">
import { GetQuote } from '@renderer/api/xcdh';
import { ref } from 'vue';
import type { Quote } from './type';
import { useGlobalRefresh } from '@renderer/core/useGlobalRefresh';
import { CountTo } from 'vue3-count-to';

const quoteItems = ref<Quote[]>([]);

const onRefresh = async () => {
  try {
    const { data: quote } = await GetQuote<Quote[]>();
    for (const item of quote) {
      const old = quoteItems.value.find((f) => f.tS_CODE === item.tS_CODE);
      if (old) {
        item.old_price = old.price * 0.8;
        item.old_amt = old.amt * 0.8;
        item.old_chg = old.chg * 0.8;
      }
      item.price = parseFloat(item.price.toFixed(2));
      item.chg = parseFloat(item.chg.toFixed(3));
      item.amt = parseFloat((item.price - item.prE_CLOSE).toFixed(2));
    }
    quoteItems.value = quote;
  } catch (error) {
    console.error(error);
  }
};

const getRiseClass = (amt: number) => {
  if (isNaN(amt)) return '';
  if (amt > 0) return 'text-red-500';
  if (amt < 0) return 'text-green-500';
  return '';
};

useGlobalRefresh(onRefresh, { second: 5, key: 'global-refresh', immediate: true });
</script>

<template>
  <div class="w-full h-7 flex flex-col gap-x-1 text-sm overflow-hidden relative">
    <div
      class="w-full absolute left-0 top-0 transition-transform hover:translate-y-0 duration-300 ease-in-out"
    >
      <div class="p-1 w-full h-7 flex items-center overflow-x-hidden text-[12px] font-bold">
        <div
          v-for="quote in quoteItems"
          :class="getRiseClass(quote.amt)"
          :key="quote.tS_CODE"
          class="flex items-center gap-x-1 border-r border-gray-300 dark:border-gray-300/30 px-1 last:border-0 shrink-0"
        >
          <span>{{ quote.name }}</span>
          <CountTo
            :end-val="quote.price"
            :start-val="quote.old_price"
            :duration="1000"
            separator=""
            :decimals="2"
          />
          <CountTo
            :end-val="quote.amt"
            :start-val="quote.old_amt"
            :duration="1000"
            separator=""
            :prefix="quote.amt > 0 ? '+' : ''"
            :decimals="2"
          />
          <CountTo
            :end-val="quote.chg"
            :start-val="quote.old_chg"
            :duration="1000"
            separator=""
            :prefix="quote.amt > 0 ? '+' : ''"
            suffix="%"
            :decimals="2"
          />
        </div>
      </div>
      <!-- <div class="p-1 w-full h-7 flex items-center gap-x-2 overflow-x-hidden font-bold">
        <span class="text-red-500">成交总额：{{ summary.total || 0 }}万亿</span>
        <span class="text-blue-500">融资总额：{{ summary.financing || 0 }}万亿</span>
      </div> -->
    </div>
    <!-- <div class="ml-auto h-8 flex items-center gap-x-1 z-10 relative px-2 cursor-pointer">
      <Switch v-model="stopScroll" id="scroll-mode" />
      <Label for="scroll-mode">停止滚动</Label>
    </div> -->
  </div>
</template>
