<script setup lang="ts">
import { GetUnsendMsgs, PutSetMsgSend, UnsendMsg } from '@renderer/api/base';
import { MsgItem, PostUserMessages, PutSetSelectedReaded } from '@renderer/api/base';
import { Avatar, AvatarFallback } from '@renderer/components/ui/avatar';
import { Button } from '@renderer/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@renderer/components/ui/popover';
import { useGlobalRefresh } from '@renderer/core/useGlobalRefresh';
import { sleep } from '@renderer/lib/time';
import { BellOff, MessageCircle, RefreshCcwDot } from 'lucide-vue-next';
import { computed, reactive, ref } from 'vue';

const open = ref(false);

const params = reactive({
  msg_read: '1',
  page: 1,
  pageSize: 50
});
const navs = [
  { text: '未读', value: '1' },
  { text: '已读', value: '2' }
];

// 模拟消息数据，添加 title 字段表示业务标题
const messages = ref<MsgItem[]>([]);

// 切换消息面板的显示与隐藏
const toggle = () => {
  open.value = !open.value;
};

// 标记消息为已读
const markAsRead = (message: MsgItem) => {
  PutSetSelectedReaded([message.id]).then(() => {
    message.isRead = true;
  });
};

// 标记全部消息为已读
const markAsReadAll = () => {
  PutSetSelectedReaded(messages.value.map((msg) => msg.id)).then(() => {
    for (const msg of messages.value) {
      msg.isRead = true;
    }
  });
};

// 点击消息跳转页面
const goToPage = (message: MsgItem) => {
  console.log('message', message);
  // message.link && router.push(message.link);
  // open.value = false;
  // window.api.sendSystemNotification('消息通知', message.msg || '');
};

const handleChecked = (nav: { text: string; value: string }) => {
  params.msg_read = nav.value;
  onRefresh();
};

const isReadAll = computed(() => {
  return messages.value.every((msg) => msg.isRead);
});

const onRefresh = async () => {
  try {
    const { data } = await PostUserMessages(params);
    messages.value = data.items || [];
  } catch {}
};

const sendNotification = async (data: UnsendMsg) => {
  await window.api.sendSystemNotification(data.title, data.msg || '');
};

const onNotification = async () => {
  try {
    const { data } = await GetUnsendMsgs();
    const list = data || [];
    for (const item of list) {
      await sendNotification(item);
      await PutSetMsgSend(item.id);
      await sleep(2000);
    }
  } catch {
    console.log('推送错误');
  }
};

useGlobalRefresh(
  () => {
    onRefresh();
    onNotification();
  },
  { second: 20, key: 'global-refresh', immediate: true }
);
</script>
<template>
  <Popover>
    <PopoverTrigger>
      <slot :toggle="toggle" :open="open" />
    </PopoverTrigger>
    <PopoverContent side="bottom" :side-offset="5" class="w-100 p-0">
      <div class="flex items-center justify-between p-2">
        <div class="space-y-1 pr-2">
          <!-- <div class="font-semibold leading-none tracking-tight">{{ $t('common.notice') }}</div> -->
          <!-- <div class="text-xs text-muted-foreground mt-2">
            {{ $t('page.tips.clickToBusiness') }}
          </div> -->
          <button
            v-for="nav in navs"
            class="min-w-10 inline-flex justify-center items-center text-sm transition-all duration-200 ease-in-out px-2 border cursor-pointer border-primary"
            :class="{ 'bg-primary text-white': params.msg_read === nav.value }"
            @click="handleChecked(nav)"
          >
            {{ nav.text }}
          </button>
        </div>
        <Button variant="ghost" class="ml-auto">
          <RefreshCcwDot />
        </Button>
        <Button variant="link" :disabled="isReadAll" @click="markAsReadAll">
          <BellOff />
        </Button>
      </div>
      <div class="max-h-96 overflow-y-auto">
        <div v-if="messages.length === 0" class="flex justify-center items-center">
          <div class="my-10 flex flex-col justify-center items-center text-muted-foreground gap-2">
            <MessageCircle :size="50" />
            <span>暂无消息</span>
          </div>
        </div>
        <div
          v-for="message in messages"
          :key="message.id"
          class="hover:bg-accent border-border relative flex w-full cursor-pointer items-start gap-5 border-t p-2"
          @click="goToPage(message)"
        >
          <!-- 通知红点，设置绝对定位到右上角 -->
          <span
            v-if="!message.isRead"
            class="absolute top-2 right-2 -mt-1 -mr-1 w-2 h-2 bg-red-500 rounded-full"
          />
          <Avatar class="w-10 h-10">
            <!-- <AvatarImage :src="message.avatar" alt="@avatar" /> -->
            <AvatarFallback>攻</AvatarFallback>
          </Avatar>
          <div>
            <div class="text-md">{{ message.msgCat }}</div>
            <div class="text-xs text-muted-foreground my-1">{{ message.msg }}</div>
            <span class="text-muted-foreground line-clamp-2 text-xs">{{ message.readTime }}</span>
          </div>
          <Button
            variant="link"
            class="ml-auto"
            :class="{ 'text-grey': message.isRead }"
            @click="markAsRead(message)"
          >
            {{ message.isRead ? $t('common.read') : $t('common.unread') }}
          </Button>
        </div>
      </div>
    </PopoverContent>
  </Popover>
</template>
