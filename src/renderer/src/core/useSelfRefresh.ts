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
  onRefresh,
  gridApi,
  codeKey = 'stock.ts_code'
}: {
  onRefresh?: () => void;
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
          const { real_time } = realtime || {};
          if (real_time && item) {
            const lastPrice = real_time.lastPrice || 0;
            const oldLastPrice = item.real_time.lastPrice || 0;
            let isChanged: isChanged = 'none';
            if (oldLastPrice !== undefined) {
              if (oldLastPrice > lastPrice) {
                isChanged = 'up';
              } else if (oldLastPrice < lastPrice) {
                isChanged = 'down';
              }
            }
            node.setData({
              ...item,
              isChanged,
              real_time: {
                ...real_time
              }
            });
          }
        }

        setTimeout(() => {
          for (const node of nodes) {
            node.setDataValue('isChanged', 'none');
          }
          gridApi.value?.onSortChanged();
        }, 1000);
      }
      onRefresh?.();
    } catch {}
  };

  useGlobalRefresh(refresh, {
    key: 'global-refresh',
    second: 5
  });

  return { refresh };
}
