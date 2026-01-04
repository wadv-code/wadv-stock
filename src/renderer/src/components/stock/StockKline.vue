<script setup lang="ts">
import { GetStockInfo, GetStockSimpleInfo, type StockKLineRequest } from '@/api/xcdh';

import { useGlobalRefresh } from '@/core/useGlobalRefresh';
import { convertAmountUnit, formatToFixed } from '@/lib/number';
import { useElementSize } from '@vueuse/core';
import { format } from 'date-fns';
import { computed, onMounted, reactive, ref, unref, watch } from 'vue';
import ToggleRadio, { ToggleRadioOption } from '../ui/ToggleRadio.vue';
import { Local } from '@renderer/core/win-storage';
import KLine from './KLine.vue';

interface Props {
  type?: 0 | 1 | 2 | 3;
  calcParams?: number[];
  hideTool?: boolean;
  getName?: (options: { name: string }) => void;
}

const { calcParams: calc, type, hideTool = false, getName } = defineProps<Props>();

watch([() => calc, () => type], () => {
  params.type = type ?? Local.get('klineType') ?? 1;
  calcParams.value = calc || [];
});

const ts_code = defineModel<string>({
  default: '000001.SZ'
});

const show = ref(true);
const loading = ref(false);
const showGradient = ref(false);
const info = ref<StockInfo>({
  id: '',
  total_market_value: 0,
  unlimit_market_value: 0,
  stock: {
    _id: '',
    ts_code: '',
    symbol: 0,
    name: '加载中...',
    area: '',
    industry: '',
    concepts: '',
    plate: '',
    total_shares: 0,
    unlimit_shares: 0,
    stock_user_set: []
  },
  real_time: {
    ts_code: '',
    rise_per: 0,
    rise_amt: 0,
    time: 0,
    timetag: '',
    lastPrice: 0,
    open: 0,
    high: 0,
    low: 0,
    lastClose: 0,
    amount: 0,
    volume: 0,
    pvolume: 0,
    stockStatus: 0,
    openInt: 0,
    settlementPrice: 0,
    lastSettlementPrice: 0,
    askPrice: [],
    bidPrice: [],
    askVol: [],
    bidVol: [],
    chg: 0
  },
  user_collects: [],
  build_break: {
    red: [],
    green: []
  },
  atacks: []
});
// K线选项
const themeOptions: ToggleRadioOption[] = [
  { label: '分时', value: 0 },
  { label: '日K', value: 1 },
  { label: '周K', value: 2 },
  { label: '月K', value: 3 },
  { label: '季K', value: 4 }
];
const oldPrice = ref(0);
// 线选项
const klines = [5, 10, 20, 30, 60];
const calcParams = ref<number[]>(Local.get('CalcParams') || [5, 10, 20]);
// 请求参数
const params = reactive<StockKLineRequest>({
  type: Local.get('klineType') ?? 1,
  ts_code: '000001.SZ',
  begin_date: '2012-01-01',
  end_date: format(new Date(), 'yyyy-MM-dd')
});
const rise = ref('text-red-600');
const riseValue = ref(0);
const riseBgClass = ref('');
const refChart = ref<HTMLDivElement>();
const build = ref<BuildBreak>({
  red: [],
  green: []
});

const lastPrice = computed(() => info.value.real_time.lastPrice.toFixed(2));

const { height } = useElementSize(refChart);

const handleCalcParams = (value: number) => {
  if (calcParams.value.includes(value)) {
    calcParams.value = calcParams.value.filter((f) => f !== value);
  } else {
    calcParams.value.push(value);
  }
  Local.set('CalcParams', unref(calcParams));
};

const onInfoDetail = async () => {
  const { data } = await GetStockInfo(params.ts_code);
  build.value = data.build_break;
};

const onInfo = async () => {
  try {
    if (loading.value) return;
    loading.value = true;
    const { data } = await GetStockSimpleInfo(params.ts_code);
    info.value = data;
    setClassName(data);
    getName?.({ name: data.stock?.name || '' });
    loading.value = false;
  } catch {
    loading.value = false;
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

watch(
  ts_code,
  (newVal) => {
    show.value = false;
    oldPrice.value = 0;
    params.ts_code = newVal;
    onInfoDetail().then(onInfo);
    setTimeout(() => {
      show.value = true;
    }, 300);
  },
  { immediate: true }
);

useGlobalRefresh(onInfo, { second: 5, key: 'global-refresh' });

onMounted(() => {
  onInfoDetail().then(onInfo);
});
</script>
<template>
  <div class="h-full w-full flex flex-col">
    <div class="flex flex-col justify-between items-center w-full">
      <!-- <div class="w-full text-center py-1">
        <h1 class="text-lg leading-6 font-bold">{{ info.stock?.name }}</h1>
        <div class="text-xs text-gray-600 dark:text-gray-400 leading-3 gap-x-1 flex items-center justify-center">
          <span>{{ format(new Date(info.real_time.time || Date.now()), 'yyyyMMdd') }}</span>
          <span>{{ info.stock?.ts_code }}</span>
        </div>
      </div> -->
      <div
        class="w-full py-1 transition-bg duration-500 relative"
        :class="
          showGradient ? `bg-linear-to-b ${riseBgClass}  to-transparent animate-gradient` : ''
        "
      >
        <div class="flex items-end px-3 mb-1" :class="rise">
          <h1 class="text-3xl font-bold">{{ lastPrice }}</h1>
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
            <span class="">{{
              format(new Date(info.real_time.time || Date.now()), 'yy/MM/dd')
            }}</span>
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
      <div
        v-if="!hideTool"
        class="w-full border-b border-t border-gray-200 dark:border-gray-500 p-1 min-h-17 flex items-center justify-between"
      >
        <div>
          <div class="flex items-center gap-x-1 mb-2">
            <span class="text-sm text-gray-600 dark:text-gray-400">K线 </span>
            <ToggleRadio :options="themeOptions" v-model="params.type" />
          </div>
          <div class="flex items-center justify-start">
            <div class="flex items-center gap-x-1">
              <span class="text-sm text-gray-600 dark:text-gray-400">MA </span>
              <button
                v-for="value in klines"
                class="min-w-10 inline-flex justify-center items-center text-sm transition-all duration-200 ease-in-out"
                :class="{ 'bg-red-500 text-white dark:bg-red-700': calcParams.includes(value) }"
                @click="handleCalcParams(value)"
              >
                {{ value }}日
              </button>
            </div>
          </div>
        </div>
        <div class="flex flex-col">
          <div v-if="params.type === 1">
            <div class="flex items-center mr-2">
              <div class="w-3 flex justify-center">
                <span class="w-2 h-2 flex bg-amber-300 transform-3d rotate-45"></span>
              </div>
              <span class="text-xs ml-1">攻击标注</span>
            </div>
            <div class="flex items-center mr-2">
              <div class="w-3 flex justify-center">
                <span
                  class="w-3 h-1.5 flex bg-red-500 border border-black dark:border-white"
                ></span>
              </div>
              <span class="text-xs ml-1">涨停标注</span>
            </div>
            <div class="flex items-center mr-2">
              <div class="w-3 flex justify-center">
                <span
                  class="w-3 h-1.5 flex bg-green-500 border border-black dark:border-white"
                ></span>
              </div>
              <span class="text-xs ml-1">炸板标注</span>
            </div>
            <!-- <span class="text-xs bg-red-500 text-white px-1 rounded"></span>
            <span class="text-xs bg-green-500 text-white px-1 rounded ml-1"></span> -->
          </div>
          <div v-else-if="[2, 3, 4].includes(params.type)">
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
    <div ref="refChart" class="relative grow">
      <KLine
        v-if="height && show"
        :info="info"
        :build="build"
        :params="params"
        :calc-params="calcParams"
        class="absolute left-0 top-0"
        :style="{ height: `${height}px` }"
      />
    </div>
  </div>
</template>
