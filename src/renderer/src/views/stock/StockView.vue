<script setup lang="ts">
import PageContainer from '@renderer/components/page/PageContainer.vue';
import StockInfo from '@renderer/components/stock/StockInfo.vue';
import StockKline from '@renderer/components/stock/StockKline.vue';
import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { GetStockInfo } from '@renderer/api/xcdh';
import { convertAmountUnit, formatToFixed } from '@renderer/lib/number';
import { formatDate } from '@renderer/lib/time';
import { useUserInfo } from '@renderer/store/modules/user';
import { useGlobalRefresh } from '@renderer/core/useGlobalRefresh';
import { defaultStockInfo } from '@renderer/lib';

const showGradient = ref(false);
const rise = ref('text-red-600');
const riseValue = ref(0);
const riseBgClass = ref('');
const oldPrice = ref(0);
const info = ref<StockInfo>(defaultStockInfo());

const route = useRoute();
const { setTagViewName } = useUserInfo();
const code = computed(() => route.query.code as string);
const lastPrice = computed(() => info.value.real_time.lastPrice.toFixed(2));

const onInfo = async () => {
  if (!code.value) return;
  try {
    const { data } = await GetStockInfo(code.value);
    info.value = data;
    setTagViewName(
      route,
      `${info.value.stock?.name || '股票名称'}-${info.value.stock?.ts_code || '股票代码'}`
    );
    setClassName(data);
  } catch {
    console.log('获取股票实时数据失败');
  }
};

const setClassName = (data: StockInfo) => {
  const rise_amt = data.real_time.rise_amt || 0;
  rise.value = rise_amt > 0 ? 'text-red-600' : 'text-green-600';
  const lastPrice = data.real_time.lastPrice;
  if (!oldPrice.value) oldPrice.value = lastPrice;
  if (lastPrice !== oldPrice.value) {
    riseBgClass.value = lastPrice >= oldPrice.value ? 'from-red-500/50' : 'from-green-500/50';
    showGradient.value = true;
    const value = formatToFixed(lastPrice - oldPrice.value, 2);
    riseValue.value = Number(value);
    setTimeout(() => {
      oldPrice.value = lastPrice;
      showGradient.value = false;
    }, 2000);
  }
};

onMounted(() => {
  onInfo();
});

useGlobalRefresh(onInfo, { second: 5, key: 'global-refresh' });
</script>
<template>
  <PageContainer>
    <template #header>
      <div
        class="w-full transition-bg duration-500 relative px-3 py-1"
        :class="
          showGradient ? `bg-linear-to-b ${riseBgClass}  to-transparent animate-gradient` : ''
        "
      >
        <div class="flex items-end">
          <h1 class="text-3xl font-bold text-primary shrink-0">
            {{ info.stock?.name || '股票名称' }}
          </h1>
          <h2 class="text-sm ml-2 mb-1">
            {{ info.stock?.ts_code || '股票代码' }}
          </h2>
          <h3 class="text-sm leading-tight ml-auto px-2">
            {{ info.stock?.concepts || '概念' }}
          </h3>
        </div>
        <div class="flex items-end" :class="rise">
          <h1 class="text-3xl font-bold">{{ lastPrice }}</h1>
          <div class="flex items-center justify-between text-lg ml-2 gap-x-0.5">
            <span>
              {{ info.real_time.rise_per > 0 ? '+' : '' }}{{ info.real_time.rise_per }}%
            </span>
            <span>/</span>
            <span>{{ info.real_time.rise_amt > 0 ? '+' : '' }}{{ info.real_time.rise_amt }}</span>
          </div>
          <div
            class="flex items-end ml-auto transition-opacity duration-500 text-lg font-bold gap-x-1"
            :class="showGradient ? 'opacity-100' : 'opacity-0'"
          >
            <span v-if="riseValue > 0" class="text-red-500">↑{{ riseValue }}</span>
            <span v-else class="text-green-500">↓{{ riseValue }}</span>
          </div>
        </div>
        <div class="flex flex-wrap text-sm">
          <div class="w-1/5 flex justify-between px-3">
            <span class="text-gray-500 dark:text-gray-300">今开</span>
            <span class="">{{ formatToFixed(info.real_time.open) }}</span>
          </div>
          <div class="w-1/5 flex justify-between px-3">
            <span class="text-gray-500 dark:text-gray-300">昨收</span>
            <span class="">{{ formatToFixed(info.real_time.lastClose) }}</span>
          </div>
          <div class="w-1/5 flex justify-between px-3">
            <span class="text-gray-500 dark:text-gray-300">时间</span>
            <span class="">{{ formatDate(info.real_time.time) }}</span>
          </div>
          <div class="w-1/5 flex justify-between px-3">
            <span class="text-gray-500 dark:text-gray-300">主板</span>
            <span class="">{{ info.stock?.plate || '--' }}</span>
          </div>
          <div class="w-1/5 flex justify-between px-3">
            <span class="text-gray-500 dark:text-gray-300">最高</span>
            <span class="text-red-500">{{ formatToFixed(info.real_time.high) }}</span>
          </div>
          <div class="w-1/5 flex justify-between px-3">
            <span class="text-gray-500 dark:text-gray-300">最低</span>
            <span class="text-green-500">{{ formatToFixed(info.real_time.low) }}</span>
          </div>
          <div class="w-1/5 flex justify-between px-3">
            <span class="text-gray-500 dark:text-gray-300">金额</span>
            <span class="">{{ convertAmountUnit(info.real_time.amount) }}</span>
          </div>
          <div class="w-1/5 flex justify-between px-3">
            <span class="text-gray-500 dark:text-gray-300">总手</span>
            <span class="">{{ convertAmountUnit(info.real_time.volume || 0) }}</span>
          </div>
          <div class="w-1/5 flex justify-between px-3">
            <span class="text-gray-500 dark:text-gray-300">市值</span>
            <span class="">{{ convertAmountUnit(info.total_market_value || 0) }}</span>
          </div>
          <div class="w-1/5 flex justify-between px-3">
            <span class="text-gray-500 dark:text-gray-300">流值</span>
            <span class="">{{ convertAmountUnit(info.unlimit_market_value || 0) }}</span>
          </div>
          <div class="w-1/5 flex justify-between px-3">
            <span class="text-gray-500 dark:text-gray-300">总股本</span>
            <span class="">{{ convertAmountUnit(info.stock?.total_shares || 0) }}</span>
          </div>
          <div class="w-1/5 flex justify-between px-3">
            <span class="text-gray-500 dark:text-gray-300">流通股</span>
            <span class="">{{ convertAmountUnit(info.stock?.unlimit_shares || 0) }}</span>
          </div>
        </div>
      </div>
    </template>
    <div class="flex items-center h-full">
      <div
        class="h-full w-[60%] border-l border-t border-b border-gray-300 dark:border-gray-800 shrink-0 p-1"
      >
        <StockKline v-model="code" :info="info" />
      </div>
      <div
        class="h-full w-[40%] border-l border-t border-b border-gray-300 dark:border-gray-800 shrink-0 p-1"
      >
        <StockInfo :info="info" />
      </div>
    </div>
  </PageContainer>
</template>
