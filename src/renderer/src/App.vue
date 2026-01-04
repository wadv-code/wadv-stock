<script setup lang="ts">
import { Toaster } from './components/ui/sonner';
import { useDarkWatch } from './core/hooks/use';
import { useGlobalIntervalFn } from './core/useGlobalIntervalFn';

// import Versions from './components/Versions.vue'
// import { cn } from '@/lib/utils';
// import Versions from '@/components/Versions.vue';
// import { Button } from './components/ui/button';

// // const ipcHandle = (): void => window.electron.ipcRenderer.send('ping')

// console.log(cn('logo', 'animate-pulse'));

// 全局时间通知器(1秒)
useGlobalIntervalFn(1000);

// 主题模式
useDarkWatch();
</script>

<template>
  <Toaster rich-colors />
  <RouterView />
  <!-- <img alt="logo" class="logo" src="./assets/electron.svg" />
  <div class="creator">Powered by electron-vite</div>
  <div class="text">
    Build an Electron app with
    <span class="vue">Vue</span>
    and
    <span class="ts">TypeScript</span>
  </div>
  <p class="tip">Please try pressing <code>F12</code> to open the devTool</p>
  <div class="actions">
    <div class="action">
      <a href="https://electron-vite.org/" target="_blank" rel="noreferrer">Documentation</a>
    </div>
    <div class="action">
      <a target="_blank" rel="noreferrer" @click="ipcHandle">Send IPC</a>
    </div>
  </div> -->
  <!-- <h1 class="text-3xl font-bold underline">Hello world!</h1>
  <Button size="sm">Click me</Button>
  <Versions /> -->
</template>
