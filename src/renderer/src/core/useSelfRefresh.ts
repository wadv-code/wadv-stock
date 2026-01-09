import { useGlobalRefresh } from './useGlobalRefresh';
import { GetStockRealtimes } from '@renderer/api/xcdh';
import { getObjectValue } from '@renderer/lib/object';
import { GridApi } from 'ag-grid-community';
import { ShallowRef } from 'vue';

/**
 * 刷新列表
 * @param rows
 */
export function useSelfRefresh({
  gridApi,
  codeKey = 'ts_code'
}: {
  gridApi: ShallowRef<GridApi<StockInfo> | null>;
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
            if (item.real_time.lastPrice !== undefined) {
              if (item.real_time.lastPrice > lastPrice) {
                isChanged = 'up';
              } else if (item.real_time.lastPrice < lastPrice) {
                isChanged = 'down';
              }
            }
            const lastClose = realtime.lastClose
              ? parseFloat(realtime.lastClose.toFixed(2))
              : undefined;
            node.setData({
              ...item,
              isChanged,
              real_time: {
                ...item.real_time,
                rise_amt: realtime.rise_amt,
                rise_per: realtime.rise_per,
                lastPrice: realtime.lastPrice,
                lastClose: lastClose
              }
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
    second: 5
  });

  return { refresh };
}
