<script setup lang="ts">
import { ArrowBigUpDash } from 'lucide-vue-next';
import { VxeGridInstance } from 'vxe-table';

interface Props {
  grid: VxeGridInstance<any> | undefined;
}

const { grid } = defineProps<Props>();

const onScrollBackUp = () => {
  if (grid) grid.scrollTo(0, 0);
};
</script>

<template>
  <div
    @click="onScrollBackUp"
    class="absolute bottom-8 right-8 z-1 bg-primary/40 p-1 cursor-pointer rounded box-shadow transition-transform duration-200 ease-in-out active:scale-95 hover:scale-105 hover:bg-primary"
  >
    <ArrowBigUpDash class="text-white" />
  </div>
</template>
