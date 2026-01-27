<script setup lang="ts">
import { Avatar, AvatarFallback, AvatarImage } from '@renderer/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@renderer/components/ui/dropdown-menu';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar
} from '@renderer/components/ui/sidebar';
import { isDownloaded, token, userInfo } from '@renderer/core/storage';
import { sleep } from '@renderer/lib/time';
import { $t } from '@renderer/locales';
import { BadgeCheck, Bell, ChevronsUpDown, CreditCard, LogOut, Sparkles } from 'lucide-vue-next';
import { useRouter } from 'vue-router';
import { toast } from 'vue-sonner';
import avatarImg from '@renderer/assets/image/avatar.png';
import { onMounted, ref } from 'vue';
import { useConfirm } from '@renderer/core/hooks/useConfirm';
import { GetCache } from '@renderer/api/redis';
import { VERSION_KEY } from '@renderer/lib/redis-key';

const router = useRouter();
const { isMobile } = useSidebar();
const confirm = useConfirm();

const isNewVersion = ref(false);
const currentVersion = ref('');
const remoteVersion = ref('0.0.0');
const isForce = ref(false);

const logout = async () => {
  token.value = '';
  window.api.storage.setItem('token', '');
  toast.success($t('common.logoutSuccess'));
  await sleep(1000);
  router.replace('/login');
};

// 下载更新
const downloadUpdate = async () => {
  isDownloaded.value = true;
  toast.info('正在下载更新，请耐心等待...', {
    position: 'top-center',
    duration: 3000
  });
  const res = await window.api.downloadUpdate();
  console.log(res);
};

const getHistorys = async () => {
  try {
    const { data } = await GetCache<string>(VERSION_KEY);
    const list = data ? JSON.parse(data) : [];
    return list;
  } catch {
    return [];
  }
};

const quitAndInstall = () => {
  isDownloaded.value = false;
  window.api.quitAndInstall();
};

const checkUpdates = async (force: boolean = false) => {
  isForce.value = force;
  if (isDownloaded.value) {
    toast.info('正在下载更新，请勿重复操作', { position: 'top-center' });
    return;
  }
  if (isNewVersion.value) {
    await downloadUpdate();
  } else {
    await window.api.checkForUpdates();
  }
};

onMounted(async () => {
  currentVersion.value = await window.api.getAppVersion();
  window.api.onUpdateDownloaded(() => {
    isDownloaded.value = false;
    console.log('更新包已下载完成');
    confirm({
      title: '下载完成',
      message: '更新包已下载完成，是否立即重启应用生效？'
    }).then(async (res) => {
      if (res) quitAndInstall();
      else toast.info('用户取消安装', { position: 'top-center' });
    });
  });
  window.api.onUpdateAvailable(async ({ data }) => {
    remoteVersion.value = data.version;
    const contents: string[] = [];
    const list = await getHistorys();
    if (list) {
      contents.push('<ul class="mt-2 text-sm">');
      for (const item of list) {
        contents.push(
          `<li  class="flex justify-between items-center py-1">${list.indexOf(item) + 1}.${item}</li>`
        );
      }
      contents.push('</ul>');
    }
    confirm({
      title: '版本更新提示',
      message: `检测到新版本 ${remoteVersion.value}，是否立即下载更新？`,
      content: contents.join(''),
      confirmButtonText: '下载更新',
      cancelButtonText: '稍后'
    }).then((res) => {
      if (res) downloadUpdate();
      else toast.info('已取消更新', { position: 'top-center' });
    });
    isNewVersion.value = true;
  });
  window.api.onUpdateNotAvailable(({ data }) => {
    if (isForce.value) {
      toast.success(`当前已是最新版本：${data.version}`, { position: 'top-center' });
    }
    isNewVersion.value = false;
    isDownloaded.value = false;
  });
  setTimeout(() => {
    checkUpdates();
  }, 2000);
  // 新增-搜索股票时可以点击加入自选。
});
</script>

<template>
  <SidebarMenu>
    <SidebarMenuItem>
      <DropdownMenu>
        <DropdownMenuTrigger as-child>
          <SidebarMenuButton
            size="lg"
            class="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
          >
            <Avatar class="h-8 w-8 rounded-lg relative">
              <AvatarImage :src="userInfo.avatar || avatarImg" :alt="userInfo.name" />
              <AvatarFallback class="rounded-lg">
                {{ userInfo.name }}
              </AvatarFallback>
            </Avatar>
            <div class="grid flex-1 text-left text-sm leading-tight">
              <span class="truncate font-semibold">{{ userInfo.name }}</span>
              <span class="truncate text-xs">{{ userInfo.role_name }}</span>
            </div>
            <ChevronsUpDown class="ml-auto size-4" />
            <span
              v-if="isNewVersion"
              class="absolute -top-0.5 -right-0.5 size-2.5 rounded-full bg-red-500 border border-black dark:border-white"
            ></span>
          </SidebarMenuButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          class="w-[--reka-dropdown-menu-trigger-width] min-w-56 rounded-lg"
          :side="isMobile ? 'bottom' : 'right'"
          align="end"
          :side-offset="4"
        >
          <DropdownMenuLabel class="p-0 font-normal">
            <div class="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
              <Avatar class="h-8 w-8 rounded-lg">
                <AvatarImage :src="userInfo.avatar || avatarImg" :alt="userInfo.name" />
                <AvatarFallback class="rounded-lg">
                  {{ userInfo.name }}
                </AvatarFallback>
              </Avatar>
              <div class="grid flex-1 text-left text-sm leading-tight">
                <span class="truncate font-semibold">{{ userInfo.name }}</span>
                <span class="truncate text-xs">{{ userInfo.mobile_phone }}</span>
              </div>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem
              @click="checkUpdates(true)"
              :class="{ 'text-primary font-bold': isNewVersion }"
            >
              <Sparkles />
              {{
                isNewVersion
                  ? `${$t('common.upgrade')}（${remoteVersion}）`
                  : `当前是最新版本：${currentVersion}`
              }}
              <span
                v-if="isNewVersion"
                class="size-2.5 rounded-full bg-red-500 border border-black dark:border-white"
              />
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem>
              <BadgeCheck />
              {{ $t('common.account') }}
            </DropdownMenuItem>
            <DropdownMenuItem>
              <CreditCard />
              {{ $t('common.billing') }}
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Bell />
              {{ $t('common.notice') }}
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem @click="logout">
            <LogOut />
            {{ $t('common.logout') }}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarMenuItem>
  </SidebarMenu>
</template>
