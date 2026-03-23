<script setup lang="ts">
import { Toaster } from './components/ui/sonner';
import { useAGridModule } from './core/useAGridModule';
import { useGlobalIntervalFn } from './core/useGlobalIntervalFn';

// 全局时间通知器(1秒)
useGlobalIntervalFn(1000);

// a-grid module
useAGridModule();
</script>

<template>
  <Toaster rich-colors />
  <RouterView />
</template>
