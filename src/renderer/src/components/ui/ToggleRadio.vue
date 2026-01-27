<template>
  <div class="inline-flex gap-x-1" :class="className">
    <template v-for="option in options" :key="option.value">
      <button
        class="relative min-w-10 text-[12px] transition-all duration-200 ease-in-out bg-gray-200 dark:bg-gray-700 cursor-pointer"
        :class="[
          isSelected(option.value) ? 'bg-red-500 text-white dark:bg-red-700 ' : '',
          focusRingClass
        ]"
        :aria-checked="isSelected(option.value)"
        :tabindex="isSelected(option.value) ? 0 : -1"
        @click.stop="selectOption(option.value)"
        @keydown.enter.stop="selectOption(option.value)"
        @keydown.space.stop="selectOption(option.value)"
      >
        {{ option.label }}
      </button>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

// 定义选项类型
export interface ToggleRadioOption {
  label: string;
  value: string | number;
}

// 定义props类型
const props = defineProps<{
  // 选项列表
  options: ToggleRadioOption[];
  // 当前选中值（支持v-model）
  modelValue: string | number;
  // 自定义类名
  className?: string;
  // 聚焦时的边框颜色
  focusRingColor?: string;
}>();

// 定义emit事件类型
const emit = defineEmits<{
  (e: 'update:modelValue', value: string | number): void;
  (e: 'change', value: string | number): void;
}>();

/**
 * 检查选项是否被选中
 * @param value 选项值
 * @returns 是否选中
 */
const isSelected = (value: ToggleRadioOption['value']): boolean => {
  return value === props.modelValue;
};

/**
 * 选择选项并触发事件
 * @param value 选项值
 */
const selectOption = (value: ToggleRadioOption['value']): void => {
  emit('update:modelValue', value);
  emit('change', value);
};

// 计算聚焦样式类
const focusRingClass = computed(() => {
  return `focus:${props.focusRingColor || 'ring-primary'}`;
});
</script>
