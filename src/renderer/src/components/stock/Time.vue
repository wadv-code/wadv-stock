<script setup lang="ts">
import { GetStockKline1M, PostStockK } from '@renderer/api/xcdh';
import { klineDate } from '@renderer/lib/style';
import { darkStyles, lightStyles } from '@renderer/lib/time-style';
import { useDark, useDebounceFn, useElementSize } from '@vueuse/core';
import { format } from 'date-fns';
import { dispose, IndicatorSeries, init, registerIndicator, type Chart } from 'klinecharts';
import { effect, onMounted, ref, watch } from 'vue';

interface Props {
  code?: string;
}

const { code = '001280.SZ' } = defineProps<Props>();

const isDark = useDark();

const refChart = ref<HTMLDivElement>();
let chart: Nullable<Chart> = null;
const dates = ref<string[]>([]);
const date = ref<string>(klineDate.value);
// const unlimit_shares = ref(0);

const { width, height } = useElementSize(refChart);

const resizeChart = useDebounceFn(() => {
  if (chart) chart.resize();
}, 300);

effect(() => {
  if (width.value && height.value) resizeChart();
});

// watch(klineDate, (info) => {
//   if (info) {
//     formatTimeDate();
//   }
// });

// const formatTimeDate = useDebounceFn(() => {
//   console.log(klineDate.value);
//   // onRefresh();
// }, 1000);

// registerKLine(unlimit_shares);

registerIndicator({
  name: 'TIME',
  shortName: '',
  series: IndicatorSeries.Price,
  figures: [
    {
      key: 'close',
      title: '分时: ',
      type: 'line',
      styles: () => {
        return {
          color: isDark.value ? '#ffffff' : '#e7000b',
          gap: 1
        };
      }
    },
    {
      // 新增均线配置（以均价线为例）
      key: 'avgPrice', // 均线数据的唯一标识，需和calc中返回的字段对应
      title: '均价: ',
      type: 'line', // 均线类型为线图
      styles: () => {
        return {
          color: isDark.value ? '#f2fa88' : '#0066ff', // 均线颜色（区分分时线）
          gap: 1,
          lineWidth: 1 // 可选：设置线宽
        };
      }
    }
  ],
  calc: (dataList) => {
    // 计算分时均价（以成交量加权平均为例，符合常规分时均价逻辑）
    let totalVolume = 0; // 累计成交量
    let totalAmount = 0; // 累计成交额（价格*成交量）

    // 遍历K线数据，计算每根K线对应的均价
    return dataList.map((item) => {
      // 累加成交量和成交额（需确保KLineData包含volume和close字段）
      totalVolume += item.volume || 0;
      totalAmount += (item.close || 0) * (item.volume || 0);

      // 计算当前均价（避免除以0）
      const avgPrice = totalVolume > 0 ? totalAmount / totalVolume : item.close || 0;

      // 返回原数据 + 新增的均线字段（key需和figures中配置的一致）
      return {
        ...item,
        avgPrice // 均价数据
      };
    });
  }
});

const initKline = () => {
  if (chart) dispose(chart);
  chart = init(refChart.value!, {
    locale: 'zh-CN',
    styles: isDark.value ? darkStyles : lightStyles,
    layout: [
      {
        // @ts-ignore
        type: 'candle',
        // content: ['MA', { name: 'EMA', calcParams: [5, 10, 20] }],
        content: [{ name: 'TIME' }],
        options: {
          order: 1
        },
        visible: false
      },
      {
        // @ts-ignore
        type: 'indicator',
        // paneId: 'indicator_pane',
        content: [{ name: 'VOL', calcParams: [] }],
        styles: () => ({
          color: isDark.value ? '#ffffff' : '#e7000b',
          gap: 1
        }),
        options: { order: 10, height: Math.ceil(height.value * 0.3) }
      }
      // { type: 'indicator', content: [{ name: 'MA', calcParams: [120] }], options: { order: 2 } },
      // { name: 'MA', calcParams: [5, 10, 20] }
      // @ts-ignore
      // { type: 'xAxis', options: { order: 9 } },
    ]
  });
  // chart?.createIndicator('TIME', false, {
  //   height: Math.ceil(height.value * 0.3),
  //   axis: { gap: { top: 0.5, bottom: 0.5 } },
  // });
  onRefresh();
};

// 格式化分时数据
const formatData = (data: TimeShare[]) => {
  return data.map((item) => ({
    date: format(new Date(item.date), 'yyyy-MM-dd hh:mm'),
    timestamp: new Date(item.date).getTime(),
    open: item.open,
    high: item.high,
    low: item.low,
    close: item.close,
    volume: item.volume,
    amount: item.amount,
    chg: item.chg,
    amp: item.amp
  }));
};

let zoom = 0;

// 刷新基本K线
const onRefresh = async () => {
  // , date: '2025-12-19'
  const { data } = await GetStockKline1M<TimeShare[]>({
    ts_code: code,
    date: date.value || klineDate.value
  });
  data.reverse();
  chart?.applyNewData(formatData(data));
  if (zoom === 0) {
    zoom = 0.2;
    chart?.zoomAtDataIndex(zoom, chart.getDataList().length - 1, 300);
  }
};

const postK = async () => {
  const { data } = await PostStockK<StockKLine[]>({
    ts_code: code,
    begin_date: '2012-01-01',
    end_date: format(new Date(), 'yyyy-MM-dd'),
    type: 1 // 0 1分钟线 1 日 2周 3 月
  });
  dates.value = data.map((item) => format(new Date(item.date), 'yyyy-MM-dd'));
};

const switchDay = async (delta: -1 | 1) => {
  const index = dates.value.indexOf(date.value);
  if (delta === 1) {
    const n = dates.value[index + 1];
    date.value = n ? n : date.value;
  } else {
    const n = dates.value[index - 1];
    date.value = n ? n : date.value;
  }
  onRefresh();
  // date.value = format(nextDay(new Date(date.value)), 'yyyy-MM-dd');
};

watch(
  () => isDark,
  () => {
    if (chart) {
      chart.setStyles(isDark.value ? darkStyles : lightStyles);
    }
  },
  { deep: true }
);

onMounted(() => {
  postK();
  initKline();
});
</script>
<template>
  <div class="flex flex-col">
    <div class="flex justify-around py-2 bg-gray-100 dark:bg-gray-800">
      <button class="px-2 text-primary text-sm" @click="switchDay(-1)">上一日</button>
      <span>{{ date }}</span>
      <button class="px-2 text-primary text-sm" @click="switchDay(1)">下一日</button>
    </div>
    <div ref="refChart" class="grow w-full"></div>
  </div>
</template>
