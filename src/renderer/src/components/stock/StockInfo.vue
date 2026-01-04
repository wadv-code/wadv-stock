<script setup lang="ts">
import { GetStockInfo } from '@renderer/api/xcdh';
import { computed, ref, watch } from 'vue';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible';
import {
  ChevronsUpDown,
  CircleAlert,
  CircleDollarSign,
  Landmark,
  MoreVertical
} from 'lucide-vue-next';
import { Button } from '../ui/button';
import StockInfoItem, { CellItem } from './StockInfoItem.vue';
import { convertAmountUnit, formatToFixed } from '@renderer/lib/number';
import { getObjectValue } from '@renderer/lib/object';
import { useGlobalRefresh } from '@renderer/core/useGlobalRefresh';
import { format } from 'date-fns';

interface Props {
  getName?: (options: { name: string }) => void;
}

const { getName } = defineProps<Props>();

const collapsible = ref({ base: true, buy: true, build: true });
const loading = ref(false);
const ts_code = defineModel<string>({ default: '000001.SZ' });
const info = ref<StockInfo>();
const atacks = computed(() => (info.value?.atacks || []).slice(0, 10));

const getClassName = (info: StockInfo, _cell: CellItem) => {
  if (info.real_time.rise_amt) {
    return info.real_time.rise_amt > 0 ? 'text-red-500' : 'text-green-500';
  }
  return '';
};

const rows: CellItem[][] = [
  [
    { key: 'stock.name', label: '股票名称' },
    { key: 'stock.ts_code', label: '股票代码' }
  ],
  [
    {
      key: 'total_market_value',
      label: '总市值',
      formatter: (info, cell) => convertAmountUnit(getObjectValue(info, cell.key))
    },
    {
      key: 'unlimit_market_value',
      label: '流通市值',
      formatter: (info, cell) => convertAmountUnit(getObjectValue(info, cell.key))
    }
  ],
  [
    {
      key: 'stock.total_shares',
      label: '总股本',
      formatter: (info, cell) => convertAmountUnit(getObjectValue(info, cell.key))
    },
    {
      key: 'stock.unlimit_shares',
      label: '流通股',
      formatter: (info, cell) => convertAmountUnit(getObjectValue(info, cell.key))
    }
  ],
  [
    {
      key: 'real_time.lastPrice',
      label: '最新价',
      className: getClassName
    },
    {
      key: 'real_time.open',
      label: '开盘价'
    }
  ],
  [
    {
      key: 'real_time.rise_per',
      label: '涨幅',
      formatter: (info, cell) => `${formatToFixed(getObjectValue(info, cell.key), 2)}%`,
      className: getClassName
    },
    {
      key: 'real_time.rise_amt',
      label: '涨跌',
      formatter: (info, cell) => formatToFixed(getObjectValue(info, cell.key), 2),
      className: getClassName
    }
  ],
  [
    {
      key: 'real_time.high',
      label: '最高价'
    },
    {
      key: 'real_time.low',
      label: '最低价'
    }
  ],
  [
    {
      key: 'real_time.lastClose',
      label: '前收盘价',
      formatter: (info, cell) => formatToFixed(getObjectValue(info, cell.key), 2)
    }
  ],
  [
    {
      key: 'real_time.amount',
      label: '成交额',
      formatter: (info, cell) => convertAmountUnit(getObjectValue(info, cell.key))
    },
    {
      key: 'real_time.volume',
      label: '成交量',
      formatter: (info, cell) => convertAmountUnit(getObjectValue(info, cell.key))
    }
  ],
  [
    {
      key: 'real_time.pvolume',
      label: '原成交额',
      formatter: (info, cell) => convertAmountUnit(getObjectValue(info, cell.key))
    }
  ]
];

const onRefresh = async () => {
  try {
    loading.value = true;
    const { data } = await GetStockInfo(ts_code.value);
    info.value = data;
    console.log(data);
    getName?.({ name: data.stock?.name || '' });
    loading.value = false;
  } catch {
    loading.value = false;
  }
};

watch(
  ts_code,
  (newVal) => {
    if (newVal) onRefresh();
  },
  { immediate: true }
);

useGlobalRefresh(onRefresh, { second: 5, key: 'global-refresh' });
</script>

<template>
  <div class="h-full relative overflow-y-auto">
    <Collapsible v-model:open="collapsible.base" class="flex flex-col">
      <CollapsibleTrigger
        class="flex items-center justify-between px-2 py-1 cursor-pointer text-cyan-500"
      >
        <div class="flex items-center">
          <CircleAlert :size="20" />
          <h4 class="font-semibold ml-2">基础信息</h4>
        </div>
        <div>
          <Button variant="ghost" size="icon" class="size-8">
            <ChevronsUpDown />
            <span class="sr-only">Toggle</span>
          </Button>
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div class="py-1 px-2 text-orange-600 text-sm leading-tight">
          {{ info?.stock.concepts }}
        </div>
        <StockInfoItem v-for="columns in rows" :info="info" :columns="columns" />
      </CollapsibleContent>
    </Collapsible>
    <Collapsible v-model:open="collapsible.buy" class="flex flex-col">
      <CollapsibleTrigger
        class="flex items-center justify-between px-2 py-1 cursor-pointer text-red-500"
      >
        <div class="flex items-center">
          <CircleDollarSign :size="20" />
          <h4 class="font-semibold ml-2">买入记录</h4>
        </div>
        <div>
          <Button variant="ghost" @click.prevent.stop="">
            更多记录
            <MoreVertical />
          </Button>
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div class="flex justify-around text-gray-600 dark:text-gray-400">
          <span class="w-1/2 text-center">时间</span>
          <span class="w-1/2 text-center">平均成本</span>
        </div>
        <div v-for="item in atacks" class="flex justify-around">
          <span class="w-1/2 text-center">{{ format(new Date(item.time), 'yy/MM/dd HH:mm') }}</span>
          <span class="w-1/2 text-center">{{ formatToFixed(item.avg, 2) }}</span>
        </div>
      </CollapsibleContent>
    </Collapsible>
    <Collapsible v-model:open="collapsible.build" class="flex flex-col">
      <CollapsibleTrigger
        class="flex items-center justify-between px-2 py-1 cursor-pointer text-blue-500"
      >
        <div class="flex items-center">
          <Landmark :size="20" />
          <h4 class="font-semibold ml-2">建仓分析</h4>
        </div>
        <div>
          <Button variant="ghost" size="icon" class="size-8">
            <ChevronsUpDown />
            <span class="sr-only">Toggle</span>
          </Button>
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div class="flex justify-around text-gray-600 dark:text-gray-400">
          <span class="w-1/2 text-center">时间</span>
          <span class="w-1/2 text-center">平均成本</span>
        </div>
        <div v-for="item in atacks" class="flex justify-around">
          <span class="w-1/2 text-center">{{ format(new Date(item.time), 'yy/MM/dd HH:mm') }}</span>
          <span class="w-1/2 text-center">{{ formatToFixed(item.avg, 2) }}</span>
        </div>
      </CollapsibleContent>
    </Collapsible>
  </div>
</template>
