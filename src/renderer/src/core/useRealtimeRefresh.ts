import { Ref, unref } from 'vue';
import { useGlobalRefresh } from './useGlobalRefresh';
import { GetStockRealtimes } from '@renderer/api/xcdh';
import { convertAmountUnit, formatPercent } from '@renderer/lib/number';
import { watch } from 'vue';
import { getObjectValue } from '@renderer/lib/object';
import { VxeGridInstance } from 'vxe-table';

/**
 * 刷新列表
 * @param rows
 */
export function useRealtimeRefresh({
  gridData,
  gridRef,
  codeKey = 'ts_code'
}: {
  gridData: Ref<any[]>;
  gridRef: Ref<VxeGridInstance<any> | undefined, VxeGridInstance<any> | undefined>;
  codeKey?: string;
}) {
  const refresh = async (change?: boolean) => {
    try {
      let codes = gridData.value.map((v) => getObjectValue(v, codeKey)).filter((f) => f);
      if (gridRef && !change) {
        const $grid = unref(gridRef);
        if ($grid) {
          const visibleData = $grid.getTableData().tableData;
          if (visibleData.length)
            codes = visibleData.map((v) => getObjectValue(v, codeKey)).filter((f) => f);
        }
      }
      const { data } = await GetStockRealtimes(codes);
      for (const item of gridData.value) {
        const realtime = data[getObjectValue(item, codeKey)];
        if (realtime) {
          const lastPrice = item.lastPrice || 0;
          if (item.lastPrice !== undefined) {
            if (realtime.lastPrice > lastPrice) {
              item.rowClassName = 'bg-linear-to-r from-transparent to-red-700/50';
            } else if (realtime.lastPrice < lastPrice) {
              item.rowClassName = 'bg-linear-to-r from-transparent to-green-700/50';
            }
          }
          item.rise_amt = realtime.rise_amt;
          item.rise_per = realtime.rise_per ? `${convertAmountUnit(realtime.rise_per, 2)}%` : '';
          item.lastPrice = realtime.lastPrice;
          item.lastClose = realtime.lastClose ? realtime.lastClose.toFixed(2) : '';
          item.real_price_build_high = formatPercent(realtime.lastPrice, item.build_high);
          item.real_price_build_low = formatPercent(realtime.lastPrice, item.build_low);
          item.real_price_avg_price = formatPercent(realtime.lastPrice, item.avg_price);
          item.real_price_tar_price = formatPercent(realtime.lastPrice, item.tar_price);
          if (item.weekly_close_avg) {
            item.real_price_weekly_close_avg = formatPercent(
              realtime.lastPrice,
              item.weekly_close_avg
            );
          }
        }
      }
      setTimeout(() => {
        for (const item of gridData.value) {
          item.rowClassName = '';
        }
      }, 2000);
    } catch {}
  };

  watch(
    () => gridData.value.length,
    () => refresh(true)
  );

  useGlobalRefresh(refresh, {
    key: 'global-refresh',
    second: 5
  });

  return { refresh };
}
