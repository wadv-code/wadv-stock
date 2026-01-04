<script lang="ts" setup>
import { getObjectValue } from '@renderer/lib/object';

export interface CellItem {
  key: string;
  label: string;
  formatter?: (info: StockInfo, cell: CellItem) => string;
  className?: (info: StockInfo, cell: CellItem) => string;
}

interface Props {
  columns?: CellItem[];
  info?: StockInfo;
}

const { columns = [] } = defineProps<Props>();
</script>

<template>
  <div v-if="info" class="rounded-md border flex items-center font-bold">
    <div
      v-for="cell in columns"
      class="py-1 text-sm max-w-1/2"
      :class="cell.className?.(info, cell) || ''"
      :style="{ width: `${100 / columns.length}%` }"
    >
      <div class="flex items-center gap-1">
        <span class="text-gray-500 w-5/12 text-center">{{ cell.label }}：</span>
        <span class="w-7/12">
          {{ cell.formatter?.(info, cell) || getObjectValue(info, cell.key) || '' }}
        </span>
      </div>
    </div>
  </div>
</template>
