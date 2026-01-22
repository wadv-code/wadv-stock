<script setup lang="ts">
import { GetStockInfo, GetStockSimpleInfo, type StockKLineRequest } from '@/api/xcdh';

import { useGlobalRefresh } from '@/core/useGlobalRefresh';
import { formatToFixed } from '@/lib/number';
import { useElementSize } from '@vueuse/core';
import { format } from 'date-fns';
import { onMounted, reactive, ref, unref, watch } from 'vue';
import ToggleRadio, { ToggleRadioOption } from '../ui/ToggleRadio.vue';
import { Local } from '@renderer/core/win-storage';
import KLine from './KLine.vue';
import TimeDialog from './TimeDialog.vue';
import { defaultStockInfo } from '@renderer/lib';
import { KLineData } from 'klinecharts';
// import { stockInfo } from '@renderer/lib/style';

interface Props {
  info?: StockInfo;
  type?: 0 | 1 | 2 | 3;
  calcParams?: number[];
  hideTool?: boolean;
  getName?: (options: { name: string; concepts?: string }) => void;
}

const emit = defineEmits(['crosshair-change']);

const { calcParams: calc, type, info, hideTool = false, getName } = defineProps<Props>();

watch(
  () => info,
  (newVal) => {
    if (newVal) stockInfo.value = newVal;
  }
);

watch([() => calc, () => type], () => {
  params.type = type ?? Local.get('klineType') ?? 1;
  calcParams.value = calc || [];
});

const ts_code = defineModel<string>({
  default: '000001.SZ'
});

const timeDialogRef = ref<InstanceType<typeof TimeDialog>>();
const date = ref('');
const timeCode = ref('');
const stockInfo = ref<StockInfo>(defaultStockInfo());
const show = ref(true);
const loading = ref(false);
const showGradient = ref(false);
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
    stockInfo.value = data;
    setClassName(data);
    getName?.({ name: data.stock?.name || '', concepts: data.stock?.concepts });
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

const handleDblClick = () => {
  timeCode.value = params.ts_code;
  timeDialogRef.value?.open(date.value);
};

const handleCrosshairChange = (data: KLineData) => {
  date.value = data.date as string;
  emit('crosshair-change', data);
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

if (!info) useGlobalRefresh(onInfo, { second: 5, key: 'global-refresh' });

onMounted(() => {
  onInfoDetail().then(onInfo);
});
</script>
<template>
  <div class="h-full w-full flex flex-col">
    <div class="flex flex-col justify-between items-center w-full">
      <slot name="header" :info="stockInfo" />
      <div
        v-if="!hideTool"
        class="w-full h-14 border-b border-gray-200 dark:border-gray-700 px-1 flex items-center justify-between"
      >
        <div>
          <div class="flex items-center gap-x-1 mb-1">
            <span class="text-sm text-gray-600 dark:text-gray-400">K线 </span>
            <ToggleRadio :options="themeOptions" v-model="params.type" />
          </div>
          <div class="flex items-center justify-start">
            <div class="flex items-center gap-x-1">
              <span class="text-sm text-gray-600 dark:text-gray-400">MA </span>
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
        v-if="height && show && stockInfo.id"
        :info="stockInfo"
        :build="build"
        :params="params"
        :calc-params="calcParams"
        class="absolute left-0 top-0"
        :style="{ height: `${height}px` }"
        @dblclick="handleDblClick"
        @crosshair-change="handleCrosshairChange"
      />
    </div>
    <TimeDialog ref="timeDialogRef" v-model="timeCode" />
  </div>
</template>
