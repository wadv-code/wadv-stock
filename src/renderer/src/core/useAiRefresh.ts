import { useGlobalRefresh } from './useGlobalRefresh';
import { GetStockRealtimes } from '@renderer/api/xcdh';
import { getObjectValue } from '@renderer/lib/object';
import { executeScriptFunc, formatFieldValues } from '@renderer/lib/stock';
import { GridApi } from 'ag-grid-community';
import { Ref, ShallowRef } from 'vue';

/**
 * 刷新列表
 * @param rows
 */
export function useAiRefresh({
  onRefresh,
  gridApi,
  strategy,
  codeKey = 'stock.ts_code'
}: {
  onRefresh?: () => void;
  gridApi: ShallowRef<GridApi<StrategyRecordItem> | null>;
  strategy: Ref<StrategyRecordModel>;
  codeKey?: string;
}) {
  const refresh = async () => {
    try {
      if (gridApi.value) {
        const fields = strategy.value?.fields || [];
        const scriptFields = fields.filter((f) => !!f.scripts);
        const nodes = gridApi.value.getRenderedNodes();
        const codes: string[] = nodes
          .map((node) => getObjectValue(node.data, codeKey))
          .filter((f) => !!f);
        const { data } = await GetStockRealtimes(codes);
        const rows: StrategyRecordItem[] = [];
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
            const row = {
              ...item,
              isChanged,
              real_time: {
                ...real_time
              }
            };
            if (isChanged !== 'none') {
              executeScriptFunc(row, scriptFields);
              formatFieldValues(row, scriptFields);
            }
            rows.push(row);
          }
        }
        setTimeout(() => {
          gridApi.value?.applyTransactionAsync({ update: rows });
          onRefresh?.();
        }, 0);
      }
    } catch {}
  };

  useGlobalRefresh(refresh, {
    key: 'global-refresh',
    second: 3
  });

  return { refresh };
}
