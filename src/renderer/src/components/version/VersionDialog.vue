<script setup lang="ts">
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { GetCache, SaveCache } from '@renderer/api/redis';
import { Plus, X } from 'lucide-vue-next';
import { onMounted, ref } from 'vue';
import { toast } from 'vue-sonner';
import { VERSION_KEY } from '@renderer/lib/redis-key';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';

const modelValue = defineModel<boolean>({ default: true });

const message = ref('');
const historyItems = ref<string[]>([]);

const onRefresh = async () => {
  try {
    const { data } = await GetCache<string>(VERSION_KEY);
    const list = JSON.parse(data || '[]') as string[];
    if (list) historyItems.value = list;
  } catch {}
};

const handlePlus = () => {
  if (message.value) {
    historyItems.value.unshift(message.value);
    message.value = '';
  } else {
    toast.warning('请输入日志', { position: 'top-center' });
  }
};

const handleRemove = (index: number) => {
  historyItems.value.splice(index, 1);
};

const handleSave = async () => {
  await SaveCache({
    [VERSION_KEY]: JSON.stringify(historyItems.value)
  });
  modelValue.value = false;
  toast.success('更新日志保存成功', { position: 'top-center' });
};

onMounted(() => onRefresh());
</script>

<template>
  <Dialog v-model:open="modelValue">
    <DialogContent class="sm:max-w-120">
      <DialogHeader>
        <DialogTitle>更新日志编辑</DialogTitle>
        <DialogDescription> 查看更新历史 </DialogDescription>
      </DialogHeader>
      <div class="max-h-96 overflow-auto">
        <div class="flex items-center">
          <Input v-model="message" placeholder="请输入日志" />
          <Button @click="handlePlus" class="ml-2">
            <Plus />
            <span>添加</span>
          </Button>
        </div>
        <ul class="mt-2 text-sm">
          <li
            v-for="(history, index) in historyItems"
            class="flex justify-between items-center py-1"
          >
            <span>{{ index + 1 }}. {{ history }}</span>
            <Button variant="ghost" size="sm" class="text-primary" @click="handleRemove(index)">
              <X />
            </Button>
          </li>
        </ul>
      </div>
      <DialogFooter>
        <DialogClose as-child>
          <Button variant="outline">{{ $t('common.cancel') }}</Button>
        </DialogClose>
        <Button @click="handleSave">{{ $t('common.save') }}</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
