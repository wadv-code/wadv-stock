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
import { Local } from '@renderer/core/win-storage';
import ToggleRadio, { ToggleRadioOption } from '@renderer/components/ui/ToggleRadio.vue';
import { unref } from 'vue';

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

const type = ref<0 | 1 | 2 | 3>(Local.get('klineType') ?? 1);
// K线选项
const themeOptions: ToggleRadioOption[] = [
  { label: '分时', value: 0 },
  { label: '日K', value: 1 },
  { label: '周K', value: 2 },
  { label: '月K', value: 3 },
  { label: '季K', value: 4 }
];
// 线选项
const klines = [5, 10, 20, 30, 60];
const calcParams = ref<number[]>(Local.get('CalcParams') || [5, 10, 20]);

const handleCalcParams = (value: number) => {
  if (calcParams.value.includes(value)) {
    calcParams.value = calcParams.value.filter((f) => f !== value);
  } else {
    calcParams.value.push(value);
  }
  Local.set('CalcParams', unref(calcParams));
};

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
    riseBgClass.value = lastPrice >= oldPrice.value ? 'from-red-500/30' : 'from-green-500/30';
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
        class="w-full transition-bg duration-500 relative p-2"
        :class="
          showGradient ? `bg-linear-to-b ${riseBgClass}  to-transparent animate-gradient` : ''
        "
      >
        <div class="flex items-center gap-x-2">
          <h1 class="text-2xl font-bold text-primary shrink-0">
            {{ info.stock?.name || '股票名称' }}
          </h1>
          <h2 class="text-xl">
            {{ info.stock?.ts_code || '股票代码' }}
          </h2>
          <div class="flex items-end" :class="rise">
            <h1 class="text-2xl font-bold">{{ lastPrice }}</h1>
            <div class="flex items-center justify-between text-lg ml-2 gap-x-0.5">
              <span>
                {{ info.real_time.rise_per > 0 ? '+' : '' }}{{ info.real_time.rise_per }}%
              </span>
              <span>/</span>
              <span>{{ info.real_time.rise_amt > 0 ? '+' : '' }}{{ info.real_time.rise_amt }}</span>
            </div>
            <div
              class="flex items-end ml-3 transition-opacity duration-500 text-lg gap-x-1"
              :class="showGradient ? 'opacity-100' : 'opacity-0'"
            >
              <span v-if="riseValue > 0" class="text-red-500">↑{{ riseValue }}</span>
              <span v-else class="text-green-500">↓{{ riseValue }}</span>
            </div>
          </div>
        </div>
        <h3 class="text-sm leading-tight text-gray-600 dark:text-gray-400">
          {{ info.stock?.concepts || '概念' }}
        </h3>
        <div
          class="flex flex-wrap text-sm gap-x-3 mt-1 p-1 border bg-gray-300/20 dark:bg-gray-500/30"
        >
          <div class="flex justify-between">
            <span class="text-gray-500 dark:text-gray-300">今开：</span>
            <span class="">{{ formatToFixed(info.real_time.open) }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-500 dark:text-gray-300">昨收：</span>
            <span class="">{{ formatToFixed(info.real_time.lastClose) }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-500 dark:text-gray-300">时间：</span>
            <span class="">{{ formatDate(info.real_time.time) }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-500 dark:text-gray-300">主板：</span>
            <span class="">{{ info.stock?.plate || '--' }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-500 dark:text-gray-300">最高：</span>
            <span class="text-red-500">{{ formatToFixed(info.real_time.high) }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-500 dark:text-gray-300">最低：</span>
            <span class="text-green-500">{{ formatToFixed(info.real_time.low) }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-500 dark:text-gray-300">金额：</span>
            <span class="">{{ convertAmountUnit(info.real_time.amount) }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-500 dark:text-gray-300">总手：</span>
            <span class="">{{ convertAmountUnit(info.real_time.volume || 0) }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-500 dark:text-gray-300">市值：</span>
            <span class="">{{ convertAmountUnit(info.total_market_value || 0) }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-500 dark:text-gray-300">流值：</span>
            <span class="">{{ convertAmountUnit(info.unlimit_market_value || 0) }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-500 dark:text-gray-300">总股本：</span>
            <span class="">{{ convertAmountUnit(info.stock?.total_shares || 0) }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-500 dark:text-gray-300">流通股：</span>
            <span class="">{{ convertAmountUnit(info.stock?.unlimit_shares || 0) }}</span>
          </div>
        </div>

        <div class="flex items-center gap-x-3 mt-2">
          <div class="flex items-center gap-x-1">
            <span class="text-sm text-gray-600 dark:text-gray-400">K线：</span>
            <ToggleRadio :options="themeOptions" v-model="type" />
          </div>
          <div v-show="![0].includes(type)" class="flex items-center justify-start">
            <div class="flex items-center gap-x-1">
              <span class="text-sm text-gray-600 dark:text-gray-400">MA：</span>
              <button
                v-for="value in klines"
                class="min-w-10 inline-flex justify-center items-center text-sm transition-all duration-200 ease-in-out bg-gray-200 dark:bg-gray-700 cursor-pointer"
                :class="{ 'bg-red-500 text-white dark:bg-red-700': calcParams.includes(value) }"
                @click="handleCalcParams(value)"
              >
                {{ value }}日
              </button>
            </div>
          </div>
          <div class="flex flex-col ml-auto">
            <div class="flex items-center" v-if="type === 1">
              <div class="flex items-center mr-2">
                <div class="w-3 flex justify-center">
                  <span class="w-2 h-2 flex bg-amber-300 transform-3d rotate-45"></span>
                </div>
                <span class="text-xs ml-1">攻击标注</span>
              </div>
              <div class="flex items-center mr-2">
                <div class="w-3 flex justify-center">
                  <span class="w-3 h-1.5 flex bg-red-500 border border-black dark:border-white" />
                </div>
                <span class="text-xs ml-1">涨停标注</span>
              </div>
              <div class="flex items-center mr-2">
                <div class="w-3 flex justify-center">
                  <span class="w-3 h-1.5 flex bg-green-500 border border-black dark:border-white" />
                </div>
                <span class="text-xs ml-1">炸板标注</span>
              </div>
            </div>
            <div class="flex items-center" v-else-if="[2, 3, 4].includes(type)">
              <div class="flex items-center mr-2">
                <span class="w-2 h-2 flex bg-blue-400"></span>
                <span class="text-xs ml-1">建仓高点</span>
              </div>
              <div class="flex items-center mr-2">
                <span class="w-2 h-2 flex bg-gray-400"></span>
                <span class="text-xs ml-1">建仓低点</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
    <div class="flex items-center h-full">
      <div
        class="h-full grow border-l border-t border-b border-gray-300 dark:border-gray-800 shrink-0 p-1"
      >
        <StockKline v-model="code" hide-tool :info="info" :type="type" :calcParams="calcParams" />
      </div>
      <div
        class="h-full w-[40%] max-w-180 border-l border-t border-b border-gray-300 dark:border-gray-800 shrink-0 p-1"
      >
        <StockInfo :info="info" />
      </div>
    </div>
  </PageContainer>
</template>
