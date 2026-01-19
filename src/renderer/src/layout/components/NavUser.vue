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
import { token, userInfo } from '@renderer/core/storage';
import { sleep } from '@renderer/lib/time';
import { $t } from '@renderer/locales';
import { BadgeCheck, Bell, ChevronsUpDown, CreditCard, LogOut, Sparkles } from 'lucide-vue-next';
import { useRouter } from 'vue-router';
import { toast } from 'vue-sonner';
import avatarImg from '@renderer/assets/image/avatar.png';
import { checkForUpdates, getAppVersion } from '@renderer/lib/http';
import { onMounted, ref } from 'vue';

const router = useRouter();
const { isMobile } = useSidebar();

const loading = ref(false);
const version = ref('');

const logout = async () => {
  token.value = '';
  toast.success($t('common.logoutSuccess'));
  await sleep(1000);
  router.replace('/login');
};

const checkUpdates = async () => {
  try {
    loading.value = true;
    await checkForUpdates();
    loading.value = false;
  } catch {
    console.log('错误');
    loading.value = false;
  }
};

onMounted(async () => {
  version.value = await getAppVersion();
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
            <Avatar class="h-8 w-8 rounded-lg">
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
            <DropdownMenuItem @click="checkUpdates" class="text-primary">
              <Sparkles />
              {{ $t('common.upgrade') }}（{{ version }}）
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
