<script setup lang="ts">
import avatarImg from '@/assets/image/avatar.jpg';
import { Avatar, AvatarFallback, AvatarImage } from '@renderer/components/ui/avatar';
import { Button } from '@renderer/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@renderer/components/ui/popover';
import { BellOff, RefreshCcwDot } from 'lucide-vue-next';
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';

const open = ref(false);
const router = useRouter();

// 模拟消息数据，添加 title 字段表示业务标题
const messages = ref([
  {
    id: 1,
    content: '新用户注册通知',
    time: '3小时前',
    isRead: false,
    avatar: avatarImg,
    link: '/new-user',
    title: '用户管理'
  },
  {
    id: 2,
    content: '系统更新提示',
    time: '2天前',
    isRead: false,
    avatar: avatarImg,
    link: '/system-update',
    title: '系统维护'
  },
  {
    id: 3,
    content: '订单状态变更',
    time: '一个礼拜前',
    isRead: true,
    avatar: avatarImg,
    link: '/order',
    title: '订单管理'
  }
]);

// 切换消息面板的显示与隐藏
const toggle = () => {
  open.value = !open.value;
};

// 标记消息为已读
const markAsRead = (messageId: number) => {
  const message = messages.value.find((msg) => msg.id === messageId);
  if (message) {
    message.isRead = true;
  }
};

// 标记全部消息为已读
const markAsReadAll = () => {
  for (const msg of messages.value) {
    msg.isRead = true;
  }
};

// 点击消息跳转页面
const goToPage = (link: string) => {
  console.log('link', link);
  link && router.push(link);
  open.value = false;
};

const isReadAll = computed(() => {
  return messages.value.every((msg) => msg.isRead);
});
</script>
<template>
  <Popover>
    <PopoverTrigger>
      <slot :toggle="toggle" :open="open" />
    </PopoverTrigger>
    <PopoverContent side="bottom" :side-offset="5" class="w-100 p-0">
      <div class="flex items-center justify-between p-3">
        <div class="space-y-1 pr-2">
          <div class="font-semibold leading-none tracking-tight">{{ $t('common.notice') }}</div>
          <div class="text-xs text-muted-foreground mt-2">
            {{ $t('page.tips.clickToBusiness') }}
          </div>
        </div>
        <Button variant="ghost" class="ml-auto">
          <RefreshCcwDot />
        </Button>
        <Button variant="link" :disabled="isReadAll" @click="markAsReadAll">
          <BellOff />
        </Button>
      </div>
      <div class="max-h-96 overflow-y-auto">
        <div
          v-for="message in messages"
          :key="message.id"
          class="hover:bg-accent border-border relative flex w-full cursor-pointer items-start gap-5 border-t p-2"
          @click="goToPage(message.link)"
        >
          <!-- 通知红点，设置绝对定位到右上角 -->
          <span
            v-if="!message.isRead"
            class="absolute top-2 right-2 -mt-1 -mr-1 w-2 h-2 bg-red-500 rounded-full"
          />
          <Avatar class="w-10 h-10">
            <AvatarImage :src="message.avatar" alt="@avatar" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          <div>
            <div class="text-md">{{ message.title }}</div>
            <div class="text-xs text-muted-foreground my-1">{{ message.content }}</div>
            <span class="text-muted-foreground line-clamp-2 text-xs">{{ message.time }}</span>
          </div>
          <Button
            variant="link"
            class="ml-auto"
            :class="{ 'text-grey': message.isRead }"
            @click="markAsRead(message.id)"
          >
            {{ message.isRead ? $t('common.read') : $t('common.unread') }}
          </Button>
        </div>
      </div>
    </PopoverContent>
  </Popover>
</template>
