<script setup lang="ts">
import { GetStockInfo } from '@renderer/api/xcdh';
import { computed, ref, watch } from 'vue';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible';
import { ChevronsUpDown, CircleDollarSign, Landmark, MoonStar, Sun } from 'lucide-vue-next';
import { Button } from '../ui/button';
import StockInfoItem, { CellItem } from './StockInfoItem.vue';
import { calculatePercent, formatToFixed, suffixPercent } from '@renderer/lib/number';
import { useGlobalRefresh } from '@renderer/core/useGlobalRefresh';
import { format } from 'date-fns';
import { formatDate } from '@renderer/lib/time';

interface Props {
  info?: StockInfo;
  getName?: (options: { name: string; concepts?: string }) => void;
}

const { getName, info } = defineProps<Props>();

watch(
  () => info,
  (newVal) => {
    if (newVal && newVal.id) stockInfo.value = newVal;
  }
);

const collapsible = ref({ base: true, buy: true, build: true });
const loading = ref(false);
const ts_code = defineModel<string>({ default: '000001.SZ' });
const stockInfo = ref<StockInfo>();
const atacks = computed(() => (stockInfo.value?.atacks || []).slice(0, 10));
const build = ref<'red' | 'green'>('red');

// const getClassName = (info: TypedAny, _cell: CellItem) => {
//   if (info.real_time.rise_amt) {
//     return info.real_time.rise_amt > 0 ? 'text-red-500' : 'text-green-500';
//   }
//   return '';
// };

// const rows: CellItem[][] = [
//   [
//     { key: 'stock.name', label: '股票名称' },
//     { key: 'stock.ts_code', label: '股票代码' }
//   ],
//   [
//     {
//       key: 'total_market_value',
//       label: '总市值',
//       formatter: (row, cell) => convertAmountUnit(getObjectValue(row, cell.key))
//     },
//     {
//       key: 'unlimit_market_value',
//       label: '流通市值',
//       formatter: (row, cell) => convertAmountUnit(getObjectValue(row, cell.key))
//     }
//   ],
//   [
//     {
//       key: 'stock.total_shares',
//       label: '总股本',
//       formatter: (row, cell) => convertAmountUnit(getObjectValue(row, cell.key))
//     },
//     {
//       key: 'stock.unlimit_shares',
//       label: '流通股',
//       formatter: (row, cell) => convertAmountUnit(getObjectValue(row, cell.key))
//     }
//   ],
//   [
//     {
//       key: 'real_time.lastPrice',
//       label: '最新价',
//       className: getClassName
//     },
//     {
//       key: 'real_time.open',
//       label: '开盘价'
//     }
//   ],
//   [
//     {
//       key: 'real_time.rise_per',
//       label: '涨幅',
//       formatter: (row, cell) => `${formatToFixed(getObjectValue(row, cell.key), 2)}%`,
//       className: getClassName
//     },
//     {
//       key: 'real_time.rise_amt',
//       label: '涨跌',
//       formatter: (row, cell) => formatToFixed(getObjectValue(row, cell.key), 2),
//       className: getClassName
//     }
//   ],
//   [
//     {
//       key: 'real_time.high',
//       label: '最高价',
//       formatter: (row, cell) => formatToFixed(getObjectValue(row, cell.key), 2)
//     },
//     {
//       key: 'real_time.low',
//       label: '最低价',
//       formatter: (row, cell) => formatToFixed(getObjectValue(row, cell.key), 2)
//     }
//   ],
//   [
//     {
//       key: 'real_time.lastClose',
//       label: '前收盘价',
//       formatter: (row, cell) => formatToFixed(getObjectValue(row, cell.key), 2)
//     }
//   ],
//   [
//     {
//       key: 'real_time.amount',
//       label: '成交额',
//       formatter: (row, cell) => convertAmountUnit(getObjectValue(row, cell.key))
//     },
//     {
//       key: 'real_time.volume',
//       label: '成交量',
//       formatter: (row, cell) => convertAmountUnit(getObjectValue(row, cell.key))
//     }
//   ],
//   [
//     {
//       key: 'real_time.pvolume',
//       label: '原成交额',
//       formatter: (row, cell) => convertAmountUnit(getObjectValue(row, cell.key))
//     }
//   ]
// ];

const buildRows: CellItem[][] = [
  [
    {
      key: 'build.build_low',
      label: '建仓低点',
      formatter: ({ cellValue }) => formatToFixed(cellValue, 2)
    },
    {
      key: 'build.build_high',
      label: '建仓高点',
      formatter: ({ cellValue }) => formatToFixed(cellValue, 2)
    }
  ],
  [
    {
      key: 'build.build_low',
      label: '低点比值',
      className: () => 'text-blue-500',
      formatter: ({ cellValue }) =>
        calculatePercent(stockInfo.value?.real_time.lastPrice, cellValue) + '%'
    },
    {
      key: 'build.build_high',
      label: '高点比值',
      className: () => 'text-blue-500',
      formatter: ({ cellValue }) =>
        calculatePercent(stockInfo.value?.real_time.lastPrice, cellValue) + '%'
    }
  ],
  [
    {
      key: 'build.build_close',
      label: '建仓收盘价'
    },
    {
      key: 'build.higher_date',
      label: '过高点',
      formatter: ({ cellValue }) => formatDate(cellValue)
    }
  ],
  [
    {
      key: 'build.build_start_date',
      label: '建仓开始',
      formatter: ({ cellValue }) => formatDate(cellValue)
    },
    {
      key: 'build.build_date',
      label: '建仓日期',
      formatter: ({ cellValue }) => formatDate(cellValue)
    }
  ],
  [
    {
      key: 'build.lastPrice',
      label: '实时价格',
      formatter: () => formatToFixed(stockInfo?.value?.real_time.lastPrice || 0, 2)
    },
    {
      key: 'build.tar_price',
      label: '目标价格'
    }
  ],
  [
    {
      key: 'build.tar_price',
      label: '目标进度',
      className: () => 'text-orange-500',
      formatter: ({ cellValue }) =>
        calculatePercent(stockInfo.value?.real_time.lastPrice, cellValue) + '%',
      visible: ({ row }) => row.cycle === '月'
    }
  ],
  [
    {
      key: 'build.avg_price',
      label: '建仓均价',
      visible: ({ row }) => row.cycle === '周'
    },
    {
      key: 'build.avg_price',
      label: '最新/均价',
      className: () => 'text-orange-500',
      formatter: ({ cellValue }) =>
        calculatePercent(stockInfo.value?.real_time.lastPrice, cellValue) + '%',
      visible: ({ row }) => row.cycle === '周'
    }
  ],
  [
    {
      key: 'break_high.break_high_rate',
      label: '破高点涨幅',
      formatter: ({ cellValue }) => suffixPercent(cellValue)
    },
    {
      key: 'break_high.break_date',
      label: '突破日期',
      formatter: ({ cellValue }) => formatDate(cellValue)
    }
  ],
  [
    {
      key: 'break_close.break_close_rate',
      label: '破收盘涨幅',
      formatter: ({ cellValue }) => suffixPercent(cellValue)
    },
    {
      key: 'break_close.break_date',
      label: '突破收盘',
      formatter: ({ cellValue }) => formatDate(cellValue)
    }
  ]
];

const onRefresh = async () => {
  try {
    loading.value = true;
    const { data } = await GetStockInfo(ts_code.value);
    stockInfo.value = data;
    getName?.({ name: data.stock?.name || '', concepts: data.stock?.concepts || '' });
    loading.value = false;
  } catch {
    loading.value = false;
  }
};

watch(
  ts_code,
  (newVal) => {
    if (newVal) {
      if (info?.id) {
        stockInfo.value = info;
      } else {
        onRefresh();
      }
    }
  },
  { immediate: true }
);

if (!info) useGlobalRefresh(onRefresh, { second: 5, key: 'global-refresh' });
</script>

<template>
  <div class="h-full relative overflow-y-auto">
    <!-- <Collapsible v-model:open="collapsible.base" class="flex flex-col">
      <CollapsibleTrigger
        class="flex items-center justify-between px-2 py-1 cursor-pointer text-cyan-500"
      >
        <div class="flex items-center">
          <CircleAlert :size="16" />
          <h4 class=" ml-2">基础信息</h4>
        </div>
        <div>
          <Button variant="ghost" size="icon" class="size-8">
            <ChevronsUpDown />
            <span class="sr-only">Toggle</span>
          </Button>
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <StockInfoItem v-for="columns in rows" :info="info" :columns="columns" />
      </CollapsibleContent>
    </Collapsible> -->
    <Collapsible v-model:open="collapsible.buy" class="flex flex-col">
      <CollapsibleTrigger
        class="flex items-center justify-between px-2 cursor-pointer text-red-500 border-b border-gray-200 dark:border-gray-800"
      >
        <div class="flex items-center">
          <CircleDollarSign :size="16" />
          <h4 class="ml-2">买入记录</h4>
        </div>
        <!-- <div>
          <Button variant="ghost" @click.prevent.stop="">
            更多记录
            <MoreVertical />
          </Button>
        </div> -->
        <div>
          <Button variant="ghost" size="icon" class="size-8">
            <ChevronsUpDown />
            <span class="sr-only">Toggle</span>
          </Button>
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div class="flex items-center flex-wrap leading-5 my-1">
          <div class="w-1/2 flex justify-around text-gray-600 dark:text-gray-400">
            <span class="w-1/2 text-center">时间</span>
            <span class="w-1/2 text-center">平均成本</span>
          </div>
          <div class="w-1/2 flex justify-around text-gray-600 dark:text-gray-400">
            <span class="w-1/2 text-center">时间</span>
            <span class="w-1/2 text-center">平均成本</span>
          </div>
          <div v-for="item in atacks" class="w-1/2 flex items-center">
            <span class="w-1/2 text-center">
              {{ format(new Date(item.time), 'yy/MM/dd HH:mm') }}
            </span>
            <span class="w-1/2 text-center">{{ formatToFixed(item.avg, 2) }}</span>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
    <Collapsible v-model:open="collapsible.build" class="flex flex-col">
      <CollapsibleTrigger
        class="flex items-center justify-between px-2 cursor-pointer text-blue-500 border-b border-t border-gray-200 dark:border-gray-800"
      >
        <div class="flex items-center">
          <Landmark :size="16" />
          <h4 class="ml-2">建仓分析</h4>
        </div>
        <div>
          <Button variant="ghost" size="icon" class="size-8">
            <ChevronsUpDown />
            <span class="sr-only">Toggle</span>
          </Button>
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div
          class="px-3 flex justify-around text-gray-400 font-bold border-b border-gray-200 dark:border-gray-800 py-1"
        >
          <div
            :class="build === 'red' ? 'text-primary' : ''"
            class="w-1/2 flex items-center justify-center"
            @click="build = 'red'"
          >
            <Sun :size="16" />
            <span class="ml-1">阳</span>
          </div>
          <div
            :class="build === 'green' ? 'text-green-500' : ''"
            class="w-1/2 flex items-center justify-center border-l border-gray-200 dark:border-gray-800"
            @click="build = 'green'"
          >
            <MoonStar :size="16" />
            <span class="ml-1">阴</span>
          </div>
        </div>
        <div v-for="item in stockInfo?.build_break[build]" class="text-sm">
          <div class="font-bold px-7 py-1">{{ item.cycle }}</div>
          <StockInfoItem v-for="columns in buildRows" :info="item" :columns="columns" />
          <div v-if="item?.build?.amp_chg_datas" class="flex flex-wrap">
            <div class="w-1/2 flex justify-around text-gray-400">
              <span class="w-[40%] text-center">日期</span>
              <span class="w-[30%] text-center">涨幅</span>
              <span class="w-[30%] text-center">振幅</span>
            </div>
            <div class="w-1/2 flex justify-around text-gray-400">
              <span class="w-[40%] text-center">日期</span>
              <span class="w-[30%] text-center">涨幅</span>
              <span class="w-[30%] text-center">振幅</span>
            </div>
            <div
              v-for="amp in item.build.amp_chg_datas"
              class="w-1/2 flex justify-around leading-4"
            >
              <span class="text-gray-400 w-[40%] text-center">{{ formatDate(amp.date) }}</span>
              <span
                class="w-[30%] text-center"
                :class="amp.chg_alter ? 'text-white bg-primary' : ''"
              >
                {{ suffixPercent(amp.chg) }}
              </span>
              <span
                class="w-[30%] text-center"
                :class="amp.amp_alter ? 'text-white bg-orange-500' : ''"
              >
                {{ suffixPercent(amp.amp) }}
              </span>
            </div>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  </div>
</template>
