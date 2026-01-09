<script setup lang="ts">
import {
  DelUserCategorysV2,
  EditUserCategorysV2,
  GetUserCategorysV2,
  SortUserCategorysV2
} from '@renderer/api/xcdh';
import { Button } from '@renderer/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@renderer/components/ui/dialog';
import { Input } from '@renderer/components/ui/input';
import { useIsMobile } from '@renderer/core/hooks';
import { swapArrayElements } from '@renderer/lib/array';
import { ArrowDown, ArrowUp, Edit, Plus, SearchCode, X } from 'lucide-vue-next';
import { onMounted, ref } from 'vue';
import { toast } from 'vue-sonner';

const { isMobile } = useIsMobile();

const emit = defineEmits(['confirm']);
const open = defineModel<boolean>({ default: false });

const name = ref('');
const categorys = ref<CategoryItem[]>([]);

const onCategorys = async () => {
  try {
    const { data } = await GetUserCategorysV2();
    categorys.value = data || [];
  } catch (error) {
  } finally {
  }
};

const handleDelete = async (item: CategoryItem) => {
  await DelUserCategorysV2(item.id || '');
  onCategorys();
};

const handleSort = async (item: CategoryItem, index: 1 | -1) => {
  const currentIndex = categorys.value.findIndex((i) => i.name === item.name);
  const nextItem = categorys.value[currentIndex + index];
  if (!nextItem) {
    return;
  }
  const nextIndex = categorys.value.findIndex((i) => i.name === nextItem.name);
  const list = swapArrayElements(categorys.value, currentIndex, nextIndex);
  for (let i = 0; i < list.length; i++) {
    list[i].sort = i + 1;
  }
  categorys.value = list;
  SortUserCategorysV2(list);
};

const handleConfirm = async () => {
  emit('confirm');
};

const handlePlus = async () => {
  if (!name.value) {
    toast.warning('分组名称不能为空', { position: 'top-center' });
    return;
  }
  if (categorys.value.some((s) => s.name === name.value)) {
    toast.warning('分组名称已存在', { position: 'top-center' });
    return;
  }
  await EditUserCategorysV2({ name: name.value, sort: categorys.value.length + 1 });
  onCategorys();
  name.value = '';
};

onMounted(() => {
  onCategorys();
});
</script>

<template>
  <Dialog v-model:open="open" v-if="!isMobile">
    <DialogTrigger as-child>
      <slot />
    </DialogTrigger>
    <DialogContent class="max-w-3xl">
      <DialogHeader>
        <DialogTitle>
          <span>编辑自选分组</span>
        </DialogTitle>
        <DialogDescription>新增分组或移除你的分组</DialogDescription>
      </DialogHeader>
      <div class="max-h-64 min-h-20 overflow-y-auto">
        <div class="flex items-center justify-center text-sm mb-1">
          <Input v-model="name" type="text" placeholder="请输入分组名称" class="" />
          <Button class="ml-2 bg-primary" @click="handlePlus">
            <Plus :size="18" />
            <span>新建分组</span>
          </Button>
        </div>
        <div
          v-for="(item, index) in categorys"
          :key="item.id"
          class="px-2 py-1 flex items-center justify-between cursor-pointer border border-sidebar-border rounded-md mb-1 hover:bg-primary/10"
        >
          <span class="font-bold">{{ item.name }}</span>
          <div class="ml-auto">
            <Button
              variant="ghost"
              size="icon"
              :disabled="index === 0"
              class="cursor-pointer h-7 w-7 transition-all duration-100 hover:scale-110 hover:-translate-y-0.5"
              @click="handleSort(item, -1)"
            >
              <ArrowUp :size="14" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              :disabled="index === categorys.length - 1"
              class="cursor-pointer h-7 w-7 transition-all duration-100 hover:scale-110 hover:-translate-y-0.5"
              @click="handleSort(item, 1)"
            >
              <ArrowDown :size="14" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              class="cursor-pointer h-7 w-7 transition-all duration-100 hover:scale-110 hover:-translate-y-0.5 text-red-500"
              @click="handleDelete(item)"
            >
              <X :size="14" />
            </Button>
          </div>
        </div>
        <div v-if="categorys.length === 0" class="flex justify-center items-center">
          <div
            class="my-10 flex flex-col justify-center items-center gap-2 text-gray-400 dark:text-gray-600"
          >
            <SearchCode :size="50" />
            <span>请新增分组</span>
          </div>
        </div>
      </div>
      <DialogFooter>
        <DialogClose as-child>
          <Button variant="ghost" class="ml-auto w-20" @click="handleConfirm">
            <X :size="18" />
            {{ $t('common.close') }}
          </Button>
        </DialogClose>
        <DialogClose as-child>
          <Button class="w-20" @click="handleConfirm">
            <Edit :size="18" />
            {{ $t('common.confirm') }}
          </Button>
        </DialogClose>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
