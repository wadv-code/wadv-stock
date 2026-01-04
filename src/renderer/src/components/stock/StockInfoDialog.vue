<script setup lang="ts">
import { X } from 'lucide-vue-next';
import { ref } from 'vue';
import StockInfo from './StockInfo.vue';
import StockKline from './StockKline.vue';
import { Local } from '@renderer/core/win-storage';

const checked = ref(Local.get('StockInfoDialogChecked') || 0);
const ts_code = defineModel<string>();
const ts_name = ref('');
// K线选项
const options = [
  { label: '股票详情', value: 0 },
  { label: '股票K线', value: 1 }
];
// 拖拽元素Ref
// const dragRef = ref<HTMLElement | null>(null);

// 使用拖拽Hooks
// const { position } = useDraggable({ key: 'StockInfoDialog', drag: dragRef });

const handleChecked = (option: (typeof options)[0]) => {
  checked.value = Number(option.value);
  Local.set('StockInfoDialogChecked', checked.value);
};

const getName = ({ name }: { name: string }) => {
  console.log('name', name);
  ts_name.value = name;
};
</script>

<template>
  <div
    v-if="ts_code"
    class="fixed right-px top-10 bottom-px w-[35vw] h-[calc(100vh-75px)] border-2 border-primary/30 bg-white dark:bg-black z-50 shadow-2xl shadow-gray-500 dark:shadow-gray-800"
  >
    <div class="flex items-center justify-between p-2 border-b border-sidebar-border" ref="dragRef">
      <div class="flex items-end">
        <span class="font-bold">{{ ts_name || '股票详情' }}</span>
        <span class="ml-2 text-sm bg-orange-500 text-white px-1">{{ ts_code || '--' }}</span>
      </div>
      <span class="cursor-pointer" @click.prevent="ts_code = ''"><X /></span>
    </div>
    <div class="flex items-center gap-x-2 p-2 border-b border-sidebar-border">
      <button
        v-for="option in options"
        class="min-w-10 inline-flex justify-center items-center text-sm transition-all duration-200 ease-in-out px-2 border cursor-pointer border-primary"
        :class="{ 'bg-red-500 text-white dark:bg-red-700': checked === option.value }"
        @click="handleChecked(option)"
      >
        {{ option.label }}
      </button>
    </div>
    <StockInfo
      v-if="checked === 0"
      v-model="ts_code"
      :getName="getName"
      style="height: calc(100% - 80px)"
    />
    <StockKline
      v-else-if="checked === 1"
      v-model="ts_code"
      :getName="getName"
      style="height: calc(100% - 80px)"
    />
  </div>
</template>
