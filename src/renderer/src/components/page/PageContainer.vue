<script setup lang="ts">
import { useElementSize } from '@vueuse/core';
import { ref } from 'vue';

const headerRef = ref<HTMLElement | null>(null);
const contentRef = ref<HTMLElement | null>(null);
const { height: headerHeight } = useElementSize(headerRef);
const { height: contentHeight } = useElementSize(contentRef);
</script>

<template>
  <div ref="contentRef" class="relative w-full h-full flex flex-col">
    <div ref="headerRef" v-if="$slots.header">
      <slot name="header" />
    </div>
    <div
      class="p-1 grow overflow-y-auto absolute left-0 right-0 bottom-0"
      :style="{ height: `${contentHeight - headerHeight}px`, top: `${headerHeight}px` }"
    >
      <slot />
    </div>
  </div>
</template>
