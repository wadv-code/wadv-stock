<script setup lang="ts">
import { X } from 'lucide-vue-next';
import { ref } from 'vue';
import { useDraggable } from '@renderer/core/hooks/useDraggable';
import Time from './Time.vue';

const ts_code = defineModel<string>();
const ts_name = ref('');
// 拖拽元素Ref
const dragRef = ref<HTMLElement | null>(null);
const klineDate = ref<string>('');
const isOpen = ref(false);

// 使用拖拽Hooks
const { position } = useDraggable({ key: 'TimeDialog', drag: dragRef });

const handleClose = () => {
  isOpen.value = false;
};

const open = (date: string) => {
  klineDate.value = date;
  isOpen.value = true;
};

defineExpose({ open });
</script>

<template>
  <div
    v-if="isOpen"
    class="fixed right-px top-10 bottom-px w-[50vw] h-[50vh] border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-black z-50 shadow-2xl shadow-gray-500 dark:shadow-gray-800"
    :style="{
      top: `${position.top || 10}px`,
      left: `${position.left || 10}px`
    }"
  >
    <div
      class="flex items-center justify-between p-1 border-b border-sidebar-border cursor-move"
      ref="dragRef"
    >
      <div class="flex items-center">
        <span class="font-bold">{{ ts_name || '股票分时' }}</span>
        <span class="ml-2 text-sm bg-orange-500 text-white px-1">{{ ts_code || '--' }}</span>
      </div>
      <span
        class="cursor-pointer w-6 h-6 flex items-center justify-center"
        @click.prevent="handleClose"
      >
        <X :size="20" />
      </span>
    </div>
    <Time :code="ts_code" :date="klineDate" class="h-[calc(100%-42px)]" />
  </div>
</template>
