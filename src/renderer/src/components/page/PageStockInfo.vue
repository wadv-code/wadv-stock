<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import StockKline from '../stock/StockKline.vue';
import { useDebounceFn } from '@vueuse/core';
import StockInfo from '../stock/StockInfo.vue';
import { convertAmountUnit, formatToFixed } from '@renderer/lib/number';
import { formatDate } from '@renderer/lib/time';
import { GetStockInfo, PostAddReaded } from '@renderer/api/xcdh';
import { useGlobalRefresh } from '@renderer/core/useGlobalRefresh';
import { defaultStockInfo } from '@renderer/lib';

interface Props {
  table_name?: string;
}

const { table_name } = defineProps<Props>();

const checked = defineModel<number>('checked');
const current = defineModel<string>('code');
const ts_name = ref('');
const ts_concepts = ref('');
const code = ref('');
// const checked = ref(Local.get('StockInfoDialogChecked') || 0);
const showGradient = ref(false);
const rise = ref('text-red-600');
const riseValue = ref(0);
const riseBgClass = ref('');
const oldPrice = ref(0);
const info = ref<StockInfo>(defaultStockInfo());

const lastPrice = computed(() => info.value.real_time.lastPrice.toFixed(2));

const getName = ({ name, concepts }: { name: string; concepts?: string }) => {
  ts_name.value = name;
  ts_concepts.value = concepts || '';
};

const onInfo = async () => {
  if (!current.value) return;
  try {
    const { data } = await GetStockInfo(current.value);
    info.value = data;
    setClassName(data);
    getName?.({ name: data.stock?.name || '', concepts: data.stock?.concepts });
    if (table_name) PostAddReaded({ table_name: table_name || '', ts_codes: [current.value] });
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

const setCode = useDebounceFn((newVal?: string) => {
  oldPrice.value = 0;
  code.value = newVal || '';
  onInfo();
}, 500);

watch(current, setCode, { immediate: true });

useGlobalRefresh(onInfo, { second: 5, key: 'global-refresh', immediate: true });
</script>

<template>
  <div class="w-full h-full">
    <div
      class="flex flex-col justify-between pb-1 border-b border-t border-gray-200 dark:border-gray-700"
    >
      <div
        class="w-full pb-1 transition-bg duration-500 relative"
        :class="
          showGradient ? `bg-linear-to-b ${riseBgClass}  to-transparent animate-gradient` : ''
        "
      >
        <div class="flex items-center border-b border-gray-200 dark:border-gray-700 leading-tight">
          <div
            class="min-w-35 shrink-0 flex flex-col items-center border-r border-gray-200 dark:border-gray-700"
          >
            <h1 class="text-2xl font-bold text-primary">
              {{ ts_name || '股票名称' }}
            </h1>
            <h2 class="text-sm">
              {{ code }}
            </h2>
          </div>
          <span
            class="grow h-full text-xs px-1 leading-tight text-gray-500 dark:text-gray-300 text-ellipsis line-clamp-3"
          >
            {{ ts_concepts || '概念' }}
          </span>
        </div>
        <div class="flex items-end px-2 mb-1" :class="rise">
          <h1 class="text-3xl font-semibold">{{ lastPrice }}</h1>
          <div class="flex items-center justify-between text-lg ml-2 gap-x-0.5">
            <span>{{ info.real_time.rise_per > 0 ? '+' : '' }}{{ info.real_time.rise_per }}%</span>
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
        <div class="flex flex-wrap text-xs">
          <div class="w-1/3 flex justify-between px-3">
            <span class="text-gray-500 dark:text-gray-300">今开</span>
            <span class="">{{ formatToFixed(info.real_time.open) }}</span>
          </div>
          <div class="w-1/3 flex justify-between px-3">
            <span class="text-gray-500 dark:text-gray-300">昨收</span>
            <span class="">{{ formatToFixed(info.real_time.lastClose) }}</span>
          </div>
          <div class="w-1/3 flex justify-between px-3">
            <span class="text-gray-500 dark:text-gray-300">时间</span>
            <span class="">{{ formatDate(info.real_time.time) }}</span>
          </div>
          <div class="w-1/3 flex justify-between px-3">
            <span class="text-gray-500 dark:text-gray-300">主板</span>
            <span class="">{{ info.stock?.plate || '--' }}</span>
          </div>
          <div class="w-1/3 flex justify-between px-3">
            <span class="text-gray-500 dark:text-gray-300">最高</span>
            <span class="text-red-500">{{ formatToFixed(info.real_time.high) }}</span>
          </div>
          <div class="w-1/3 flex justify-between px-3">
            <span class="text-gray-500 dark:text-gray-300">最低</span>
            <span class="text-green-500">{{ formatToFixed(info.real_time.low) }}</span>
          </div>
          <div class="w-1/3 flex justify-between px-3">
            <span class="text-gray-500 dark:text-gray-300">金额</span>
            <span class="">{{ convertAmountUnit(info.real_time.amount) }}</span>
          </div>
          <div class="w-1/3 flex justify-between px-3">
            <span class="text-gray-500 dark:text-gray-300">总手</span>
            <span class="">{{ convertAmountUnit(info.real_time.volume || 0) }}</span>
          </div>
          <div class="w-1/3 flex justify-between px-3">
            <span class="text-gray-500 dark:text-gray-300">市值</span>
            <span class="">{{ convertAmountUnit(info.total_market_value || 0) }}</span>
          </div>
          <div class="w-1/3 flex justify-between px-3">
            <span class="text-gray-500 dark:text-gray-300">流值</span>
            <span class="">{{ convertAmountUnit(info.unlimit_market_value || 0) }}</span>
          </div>
          <div class="w-1/3 flex justify-between px-3">
            <span class="text-gray-500 dark:text-gray-300">总股本</span>
            <span class="">{{ convertAmountUnit(info.stock?.total_shares || 0) }}</span>
          </div>
          <div class="w-1/3 flex justify-between px-3">
            <span class="text-gray-500 dark:text-gray-300">流通股</span>
            <span class="">{{ convertAmountUnit(info.stock?.unlimit_shares || 0) }}</span>
          </div>
        </div>
      </div>
    </div>
    <div v-if="code" style="height: calc(100% - 210px)">
      <StockKline v-if="checked === 0" v-model="code" :info="info" :getName="getName" />
      <StockInfo v-else-if="checked === 1" v-model="code" :info="info" :getName="getName" />
    </div>
    <!-- <StockKline v-if="code" v-model="code" :get-name="getName" style="height: calc(60% - 80px)" /> -->
  </div>
</template>
