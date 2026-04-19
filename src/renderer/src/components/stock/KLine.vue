<script setup lang="ts">
import { computed, effect, onMounted, onUnmounted, ref, watch } from 'vue';
import { init, dispose, type KLineData, type Chart, ActionType } from 'klinecharts';
import { format } from 'date-fns';
import { darkStyles, lightStyles } from '@/lib/style';
import { getBuildRow, registerKLine } from './kline';
import { useDark, useDebounceFn, useElementSize } from '@vueuse/core';
import { findClosestDate, sleep } from '@/lib/time';
// import { useGlobalRefresh } from '@/core/useGlobalRefresh';
import { GetStockKline1M, type StockKLineRequest } from '@renderer/api/xcdh';
import { Local } from '@renderer/core/win-storage';
import { GetKlineKline, GetKlineRealK, GetStockAtackRecords } from '@renderer/api/data';

interface Props {
  params: StockKLineRequest;
  info: StockInfo;
  calcParams: number[];
}

const emit = defineEmits(['crosshair-change']);

const { params, info, calcParams = [] } = defineProps<Props>();

const isDark = useDark();
const refChart = ref<HTMLDivElement>();
const unlimit_shares = ref(0);
const build = computed(() => info?.build_break || { red: [], green: [] });
let chart: Nullable<Chart> = null;

const { width, height } = useElementSize(refChart);

const resizeChart = useDebounceFn(() => {
  if (chart) chart.resize();
}, 300);

effect(() => {
  if (width.value && height.value) resizeChart();
});

// 注册K线图自定义指标
registerKLine(unlimit_shares);

const initKline = () => {
  if (chart) dispose(chart);
  chart = init(refChart.value!, {
    locale: 'zh-CN',
    styles: isDark.value ? darkStyles : lightStyles,
    customApi: {
      formatDate: (timestamp: number) =>
        format(new Date(timestamp), params.type === 0 ? 'hh:mm' : 'yy/MM/dd')
    },
    // // @ts-ignore
    // // styles: 'customTheme',
    layout: [
      {
        // @ts-ignore
        type: 'candle',
        // content: ['MA', { name: 'EMA', calcParams: [5, 10, 20] }],
        // content: [{ name: 'MA', calcParams }, ...(params.type === 1 ? [{ name: 'DKX' }] : [])],
        options: {
          order: Number.MIN_SAFE_INTEGER
        }
      },
      {
        // @ts-ignore
        type: 'indicator',
        paneId: 'indicator_pane',
        content: [
          { name: 'VOL', calcParams: params.type === 0 ? [] : [120] },
          { name: 'TIME_PRICE' }
        ],
        options: { order: 10 }
      },
      // { type: 'indicator', content: [{ name: 'MA', calcParams: [120] }], options: { order: Number.MIN_SAFE_INTEGER } },
      // { name: 'MA', calcParams: [5, 10, 20] }
      // @ts-ignore
      { type: 'xAxis', options: { order: 9 } }
    ]
  });
  // console.log(chart);
  // chart?.on('kline_click', (event) => {
  //   const klineData = event.data;
  //   console.log('点击的 K 线时间:', new Date(klineData.timestamp).toLocaleString());
  //   console.log('点击的 K 线价格:', klineData.close);
  // });
  chart?.subscribeAction(ActionType.OnCrosshairChange, (event) => {
    const { kLineData } = event as { kLineData: KLineData };
    emit('crosshair-change', kLineData);
  });
};

// 格式化分时数据
const formatData = (data: TimeShare[]) => {
  if (params.type === 0) {
    return data.map((item) => ({
      ...item,
      date: format(new Date(item.date), 'yyyy-MM-dd hh:mm'),
      timestamp: new Date(item.date).getTime()
    }));
  } else {
    return [];
  }
};

// 刷新基本K线
const onRefresh = async () => {
  if (params.type === 0) {
    // , date: '2025-12-19'
    const { data } = await GetStockKline1M<TimeShare[]>({ ts_code: params.ts_code });
    data.reverse();
    chart?.applyNewData(formatData(data));
  } else {
    const { data } = await GetKlineKline({
      type: params.type,
      ts_code: params.ts_code,
      begin_date: params.begin_date,
      end_date: format(new Date(), 'yyyy-MM-dd')
    });
    data.reverse();
    const buildRow = getBuildRow(build.value);
    const list = data.map((item) => ({
      ...item,
      date: format(new Date(item.time), 'yyyy-MM-dd'),
      timestamp: item.time,
      highest_price: buildRow?.build?.highest_price ?? 0,
      lowest_price: buildRow?.build?.lowest_price ?? 0,
      build_high: buildRow?.build?.build_high ?? 0,
      build_close: buildRow?.build?.build_close ?? 0
    }));
    chart?.applyNewData(list);
  }
  refreshOverlay();
  refreshBuild();
  refreshLimit();
  initIndicator();
  handleScale();
};

watch(
  () => info,
  async (newInfo) => {
    if (newInfo && chart) onReal();
  }
);

// 刷新实时数据
const onReal = async () => {
  try {
    if (chart) {
      const rows = chart.getDataList() || [];
      if (params.type === 0) {
        const { data } = await GetStockKline1M<TimeShare[]>({ ts_code: params.ts_code });
        const list = formatData(data);
        const newData = list.filter((f) => !rows.some((i) => i.date === f.date));
        for (const item of newData) {
          chart?.updateData(item);
        }
      } else {
        const currentDate = format(new Date(), 'yyyy-MM-dd');
        const currentRow = rows.find((f) => f.date === currentDate);
        if (currentRow) {
          const { data } = await GetKlineRealK({ ts_code: params.ts_code, type: params.type });
          const buildRow = getBuildRow(build.value);
          const newRow = {
            ...currentRow,
            ...data,
            date: format(new Date(data.time), 'yyyy-MM-dd'),
            timestamp: data.time,
            highest_price: buildRow?.build?.highest_price ?? 0,
            lowest_price: buildRow?.build?.lowest_price ?? 0,
            build_high: buildRow?.build?.build_high ?? 0,
            build_close: buildRow?.build?.build_close ?? 0
          };
          chart.updateData(newRow);
          refreshLimit(newRow);
          refreshOverlay();
        }
      }
    }
  } catch {}
};

/**
 * 攻击标注
 */
const refreshOverlay = async () => {
  if (params.type === 1) {
    if (chart) {
      const { data: atacks } = await GetStockAtackRecords(params);
      const items = chart.getDataList() || [];
      const overlays = chart.getOverlays({ name: 'diamondAnnotation' }) || [];
      // 需要新增的标注
      const newAtacks = atacks.filter((f) => !overlays.some((i) => i.id === f._id));
      // 需要移除的标注
      const delAtacks = overlays.filter((f) => !atacks.some((i) => i._id === f.id));
      // 新增标注
      newAtacks.forEach((item) => {
        const date = format(new Date(item.date), 'yyyy-MM-dd');
        const row = items.find((f) => f.date === date);
        if (row) {
          chart?.createOverlay({
            id: item._id,
            extendData: { color: item.is_valid ? '#ffd230' : isDark.value ? '#b4b4b4' : '#cccccc' },
            name: 'diamondAnnotation',
            points: [{ timestamp: row.timestamp, value: item.avg }]
          });
        }
      });
      // 移除标注
      delAtacks.forEach((item) => {
        chart?.removeOverlay({ name: 'diamondAnnotation', id: item.id });
      });
    }
  } else {
    chart?.removeOverlay({ name: 'diamondAnnotation' });
  }
};

// 建仓标注
const refreshBuild = async () => {
  if (chart) {
    chart.removeOverlay({ name: 'buildAnnotation' });
    await sleep(300);
    const rows = chart.getDataList() || [];
    const names: Record<number, string> = { 2: '周', 3: '月', 4: '季' };
    const buildRows = build.value.red.filter((f) => f.cycle === names[params.type]) || [];
    buildRows.forEach((v) => {
      // 建仓高点
      const highest = findClosestDate(rows, v.build?.highest_price_date || '');
      if (highest) {
        chart?.createOverlay({
          name: 'buildAnnotation',
          extendData: { color: '#51a2ff' },
          points: [{ timestamp: highest.timestamp, value: v.build?.highest_price }]
        });
      }
      // 建仓低点
      const lowest = findClosestDate(rows, v.build?.lowest_price_date || '');
      if (lowest) {
        chart?.createOverlay({
          name: 'buildAnnotation',
          extendData: { color: '#99a1af' },
          points: [{ timestamp: lowest.timestamp, value: v.build?.lowest_price }]
        });
      }
    });
  }
};

// 涨停、炸板标注
const refreshLimit = async (row?: KLineData) => {
  if (chart) {
    if (row) {
      chart?.removeOverlay({ name: 'rectangleAnnotation', id: row.timestamp.toString() });
      if (params.type !== 1) return;
      if (row.zhang_ting || row.zha_ban) {
        chart?.createOverlay({
          id: row.timestamp.toString(),
          name: 'rectangleAnnotation',
          extendData: { ...row },
          points: [{ timestamp: row.timestamp, value: row.high * 1.009 }]
        });
      }
    } else {
      chart.removeOverlay({ name: 'rectangleAnnotation' });
      if (params.type !== 1) return;
      await sleep(300);
      const rows = chart.getDataList() || [];
      const list = rows.filter((f) => f.zhang_ting || f.zha_ban);
      if (list) {
        for (const row of list) {
          chart?.createOverlay({
            id: row.timestamp.toString(),
            name: 'rectangleAnnotation',
            extendData: { ...row },
            points: [{ timestamp: row.timestamp, value: row.high * 1.009 }]
          });
        }
      }
    }
  }
};

const isIndicator = (name: string) => chart?.getIndicators().some((f) => f.name === name);

const initIndicator = () => {
  if (chart) {
    if (params.type === 1) {
      const buildRow = getBuildRow(build.value);
      const calcParams = ['dkx', 'madkx'];
      // console.log('buildRow', buildRow);
      if (buildRow.build?.highest_price) calcParams.push('highest_price');
      if (buildRow.build?.build_close) calcParams.push('build_close');
      if (!isIndicator('DKX'))
        chart.createIndicator({ name: 'DKX', calcParams }, false, { id: 'candle_pane' });
      // if (!isIndicator('BUILD')) chart.createIndicator('BUILD', false, { id: 'candle_pane' });
      if (!isIndicator('FEILONG')) chart.createIndicator('FEILONG');
    } else {
      if (isIndicator('DKX')) chart.removeIndicator({ name: 'DKX' });
      // if (isIndicator('BUILD')) chart.removeIndicator({ name: 'BUILD' });
      if (isIndicator('FEILONG')) chart.removeIndicator({ name: 'FEILONG' });
    }
    if (params.type === 0) {
      chart.overrideIndicator({
        name: 'TIME_PRICE',
        shortName: '流通股',
        visible: true
      });
      if (isIndicator('VOL'))
        chart.overrideIndicator({
          name: 'VOL',
          calcParams: []
        });
      if (isIndicator('MA')) chart.removeIndicator({ name: 'MA' });
      if (!isIndicator('TIME'))
        chart.createIndicator('TIME', false, {
          height: Math.ceil(height.value * 0.4),
          axis: { gap: { top: 0.5, bottom: 0.5 } }
        });
    } else {
      chart.overrideIndicator({
        name: 'TIME_PRICE',
        shortName: '',
        visible: false
      });
      if (isIndicator('VOL'))
        chart.overrideIndicator({
          name: 'VOL',
          calcParams: [120]
        });
      if (!isIndicator('MA'))
        chart.createIndicator({ name: 'MA', calcParams }, true, { id: 'candle_pane' });
      if (isIndicator('TIME')) chart.removeIndicator({ name: 'TIME' });
    }

    // if (params.type !== 1) {
    //   chart.removeIndicator({ name: 'DKX' });
    // } else {
    //   chart.createIndicator('DKX', false, { id: 'candle_pane' });
    // }
    // chart.createIndicator('DKX', false, { id: 'candle_pane' });
    // console.log(chart.getIndicators());
    // if (params.type === 0) {
    //   chart.removeIndicator({ name: 'MA' });
    //   chart.createIndicator('TIME', false, {
    //     height: Math.ceil(height.value * 0.3),
    //     axis: { gap: { top: 0.5, bottom: 0.5 } },
    //   });
    // } else {
    //   chart.removeIndicator({ name: 'TIME' });
    //   chart.createIndicator({ name: 'MA', calcParams }, true, { id: 'candle_pane' });
    // }
  }
};

watch(
  () => calcParams,
  () => {
    if (params.type !== 0) {
      chart?.overrideIndicator({
        name: 'MA',
        calcParams
      });
    }
  },
  { deep: true }
);

watch(
  () => info.stock.unlimit_shares,
  (value) => {
    unlimit_shares.value = value;
  },
  { deep: true, immediate: true }
);

// useGlobalRefresh(onReal, { second: 2, key: 'global-refresh' });

onMounted(() => {
  initKline();
});

let index = 3.25;
const handleScale = () => {
  setTimeout(() => {
    if (params.type === 0 && index === 3.25) {
      index = 0.3;
      chart?.zoomAtDataIndex(index, chart.getDataList().length - 1, 100);
    } else if (index === 0.3) {
      index = 3.25;
      chart?.zoomAtDataIndex(index, chart.getDataList().length - 1, 100);
    }
  }, 100);
};

watch(
  () => params,
  () => {
    Local.set('klineType', params.type);
    onRefresh();
  },
  { immediate: true, deep: true }
);

watch(
  () => isDark,
  () => {
    if (chart) {
      chart.setStyles(isDark.value ? darkStyles : lightStyles);
    }
  },
  { deep: true }
);

onUnmounted(() => {
  if (chart) dispose(chart);
});
</script>

<template>
  <div ref="refChart" class="h-full w-full" />
</template>
