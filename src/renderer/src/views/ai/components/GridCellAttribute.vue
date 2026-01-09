<script setup lang="ts">
import { stock_user_set } from '@renderer/lib';
import { ICellRendererParams } from 'ag-grid-community';
import { AiRow } from '../util';
interface Props {
  params: ICellRendererParams<AiRow>;
}
const { params } = defineProps<Props>();
</script>
<template>
  <div class="gap-x-0.5 h-full flex items-center text-xs">
    <template v-for="item in stock_user_set.slice(1)">
      <span
        v-if="params.data?.stock_user_set?.includes(item.value)"
        class="text-white px-0.5 rounded-[2px]"
        :class="item.className"
      >
        {{ item.name }}
      </span>
    </template>
  </div>
</template>
