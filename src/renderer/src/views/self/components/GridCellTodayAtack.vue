<script setup lang="ts">
import { ICellRendererParams } from 'ag-grid-community';
import { LocateFixed } from 'lucide-vue-next';
interface Props {
  params: ICellRendererParams<StockInfo>;
}
const { params } = defineProps<Props>();
</script>
<template>
  <div v-if="params.data?.today_atack" class="flex h-full justify-center items-center text-red-500">
    <LocateFixed :size="16" />
  </div>
</template>
