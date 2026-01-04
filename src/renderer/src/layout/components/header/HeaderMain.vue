<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { SidebarTrigger } from '@renderer/components/ui/sidebar';
import { Separator } from '@renderer/components/ui/separator';
import { ThemeDark } from '@renderer/components/theme';
import { Button } from '@renderer/components/ui/button';
import HeaderBreadcrumb from './HeaderBreadcrumb.vue';
import HeaderLanguage from './HeaderLanguage.vue';
import HeaderNotice from './HeaderNotice.vue';
import SearchMenu from './SearchMenu.vue';
import {
  Bell,
  BellRing,
  Languages,
  Maximize,
  Minimize,
  Minus,
  MoonStar,
  RefreshCcw,
  Settings2,
  Sun,
  X
} from 'lucide-vue-next';
import { useRoute } from 'vue-router';
import { useTitle } from '@renderer/lib/title';

const route = useRoute();

const whiteList = ['login'];

const title = ref(document.title);
const isMaximized = ref(false);

// 最小化窗口
const minimizeWindow = () => {
  window.electron.ipcRenderer.send('minimize-window');
};

// 最大化/还原窗口
const maximizeWindow = () => {
  window.electron.ipcRenderer.send('maximize-window');
};

// 关闭窗口
const closeWindow = () => {
  window.electron.ipcRenderer.send('close-window');
};

const handleRefresh = () => {
  location.reload();
};

// 监听窗口最大化状态变化
window.electron.ipcRenderer.on('window-maximized', () => {
  isMaximized.value = true;
});

window.electron.ipcRenderer.on('window-unmaximized', () => {
  isMaximized.value = false;
});

// 初始化时获取窗口状态
window.electron.ipcRenderer.send('get-window-state');

// 监听窗口状态返回
window.electron.ipcRenderer.on('window-state', (_event, state) => {
  isMaximized.value = state.isMaximized;
});

onMounted(() => {
  // 设置title
  useTitle(route.meta?.title);
});
</script>
<template>
  <header
    class="flex h-9 shrink-0 items-center gap-1 pr-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-10 border-b drag"
  >
    <div v-if="whiteList.includes(String(route.name))" class="px-2">
      <h1 class="text-xs font-bold">{{ title }}</h1>
    </div>
    <div v-else class="flex items-center px-1 no-drag">
      <SidebarTrigger />
      <Separator orientation="vertical" style="height: 15px" class="ml-1" />
      <HeaderBreadcrumb />
    </div>
    <div class="grow"></div>
    <ThemeDark #="{ dark, toggle }">
      <div class="no-drag flex items-center gap-x-1">
        <SearchMenu />
        <HeaderNotice #="{ toggle, open }">
          <Button
            @click="toggle"
            variant="ghost"
            size="icon"
            class="cursor-pointer h-7 w-7 transition-all duration-100 hover:scale-110 hover:-translate-y-0.5"
          >
            <component :is="open ? BellRing : Bell" />
          </Button>
        </HeaderNotice>
        <Button
          variant="ghost"
          size="icon"
          class="cursor-pointer h-7 w-7 transition-all duration-100 hover:scale-110 hover:-translate-y-0.5"
        >
          <Settings2 />
        </Button>
        <HeaderLanguage>
          <Button
            variant="ghost"
            size="icon"
            class="cursor-pointer h-7 w-7 transition-all duration-100 hover:scale-110 hover:-translate-y-0.5"
          >
            <Languages />
          </Button>
        </HeaderLanguage>
        <Button
          @click="toggle"
          variant="ghost"
          size="icon"
          class="cursor-pointer h-7 w-7 transition-all duration-100 hover:scale-110 hover:-translate-y-0.5"
        >
          <component :is="dark ? MoonStar : Sun" />
        </Button>
        <Button
          @click="handleRefresh"
          variant="ghost"
          size="icon"
          class="cursor-pointer h-7 w-7 transition-all duration-100 hover:scale-110 hover:-translate-y-0.5"
        >
          <component :is="RefreshCcw" />
        </Button>
        <Button
          @click="minimizeWindow"
          variant="ghost"
          size="icon"
          class="cursor-pointer h-7 w-7 transition-all duration-100 hover:scale-110 hover:-translate-y-0.5"
        >
          <component :is="Minus" />
        </Button>
        <Button
          @click="maximizeWindow"
          variant="ghost"
          size="icon"
          class="cursor-pointer h-7 w-7 transition-all duration-100 hover:scale-110 hover:-translate-y-0.5"
        >
          <component :is="isMaximized ? Minimize : Maximize" />
        </Button>
        <Button
          @click="closeWindow"
          variant="ghost"
          size="icon"
          class="cursor-pointer h-7 w-7 transition-all duration-100 hover:scale-110 hover:-translate-y-0.5"
        >
          <component :is="X" />
        </Button>
      </div>
    </ThemeDark>
  </header>
</template>

<style>
.no-drag {
  -webkit-app-region: no-drag;
}
.drag {
  -webkit-app-region: drag;
}
</style>
