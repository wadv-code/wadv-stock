import { useGlobalRefresh } from './useGlobalRefresh';
import { GetStockRealtimes } from '@renderer/api/xcdh';
import { getObjectValue } from '@renderer/lib/object';
import { GridApi } from 'ag-grid-community';
import { ShallowRef } from 'vue';
import { AiRow } from '@renderer/views/ai/util';
import { formatPercentNumber } from '@renderer/lib/number';

/**
 * 刷新列表
 * @param rows
 */
export function useAiRefresh({
  gridApi,
  codeKey = 'ts_code'
}: {
  gridApi: ShallowRef<GridApi<AiRow> | null>;
  codeKey?: string;
}) {
  const refresh = async () => {
    try {
      if (gridApi.value) {
        const nodes = gridApi.value.getRenderedNodes();
        const codes: string[] = nodes
          .map((node) => getObjectValue(node.data, codeKey))
          .filter((f) => !!f);
        const { data } = await GetStockRealtimes(codes);
        for (const node of nodes) {
          const { data: item } = node;
          const realtime = data[getObjectValue(node.data, codeKey)];
          if (realtime && item) {
            const lastPrice = realtime.lastPrice || 0;
            let isChanged: isChanged = 'none';
            if (item.lastPrice !== undefined) {
              if (item.lastPrice > lastPrice) {
                isChanged = 'up';
              } else if (item.lastPrice < lastPrice) {
                isChanged = 'down';
              }
            }
            const lastClose = realtime.lastClose
              ? parseFloat(realtime.lastClose.toFixed(2))
              : undefined;
            node.setData({
              ...item,
              lastPrice,
              isChanged,
              rise_amt: realtime.rise_amt,
              rise_per: realtime.rise_per,
              lastClose: lastClose,
              real_price_build_high: formatPercentNumber(lastPrice, item.build_high),
              real_price_build_low: formatPercentNumber(lastPrice, item.build_low),
              real_price_avg_price: formatPercentNumber(lastPrice, item.avg_price),
              real_price_tar_price: formatPercentNumber(lastPrice, item.tar_price),
              real_price_weekly_close_avg: item.weekly_close_avg
                ? formatPercentNumber(lastPrice, item.weekly_close_avg)
                : undefined
            });
          }
        }

        setTimeout(() => {
          for (const node of nodes) {
            node.setDataValue('isChanged', 'none');
          }
          gridApi.value?.onSortChanged();
        }, 2000);
      }
    } catch {}
  };

  useGlobalRefresh(refresh, {
    key: 'global-refresh',
    second: 3
  });

  return { refresh };
}
