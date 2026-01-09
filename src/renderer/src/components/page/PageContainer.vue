<script setup lang="ts">
import { useElementSize } from '@vueuse/core';
import { ref } from 'vue';

const headerRef = ref<HTMLElement | null>(null);
const contentRef = ref<HTMLElement | null>(null);
const rightRef = ref<HTMLElement | null>(null);
const { height: headerHeight } = useElementSize(headerRef);
const { height: contentHeight, width: contentWidth } = useElementSize(contentRef);
const { width: rightWidth } = useElementSize(rightRef);
</script>

<template>
  <div ref="contentRef" class="relative w-full h-full flex flex-col bg-gray-100 dark:bg-gray-900">
    <div ref="headerRef" v-if="$slots.header">
      <slot name="header" />
    </div>
    <div
      v-if="$slots.right"
      class="grow overflow-y-auto absolute left-0 right-0 bottom-0 flex"
      :style="{
        height: `${contentHeight - headerHeight}px`,
        top: `${headerHeight}px`
      }"
    >
      <div
        class=""
        :style="{
          width: `${contentWidth - rightWidth}px`
        }"
      >
        <slot />
      </div>
      <div
        ref="rightRef"
        class="w-[35%] max-w-[600px] h-[calc(100%-1px)] shrink-0 border-b border-gray-200 dark:border-gray-800"
      >
        <slot name="right" />
      </div>
    </div>
    <div
      v-else
      class="grow overflow-y-auto absolute left-0 right-0 bottom-0"
      :style="{ height: `${contentHeight - headerHeight}px`, top: `${headerHeight}px` }"
    >
      <slot />
    </div>
  </div>
</template>
