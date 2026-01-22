<script lang="ts" setup>
import { getObjectValue } from '@renderer/lib/object';

export interface CellItemParams {
  cellValue: any;
  row: TypedAny;
  column: CellItem;
}

export interface CellItem {
  key: string;
  label: string;
  visible?: (option: CellItemParams) => boolean;
  formatter?: (option: CellItemParams) => string;
  className?: (option: CellItemParams) => string;
}

interface Props {
  columns?: CellItem[];
  info?: TypedAny;
}

const { columns = [] } = defineProps<Props>();

const getCellItemParams = (info: TypedAny, cell: CellItem) => ({
  cellValue: getObjectValue(info, cell.key),
  row: info,
  column: cell
});
</script>

<template>
  <div v-if="info" class="flex items-center">
    <template v-for="cell in columns">
      <div
        v-if="cell.visible ? cell.visible?.(getCellItemParams(info, cell)) : true"
        class="text-sm max-w-1/2"
        :class="cell.className?.(getCellItemParams(info, cell)) || ''"
        :style="{ width: `${100 / columns.length}%` }"
      >
        <div class="flex items-center gap-1">
          <span class="text-gray-400 w-5/12 text-center">{{ cell.label }}：</span>
          <span class="w-7/12">
            {{
              cell.formatter
                ? cell.formatter(getCellItemParams(info, cell))
                : getObjectValue(info, cell.key)
            }}
          </span>
        </div>
      </div>
    </template>
  </div>
</template>
