<script setup lang="ts">
import { PostBatchUserStockSetfAdd, PostBatchUserStockSetfRemove } from '@renderer/api/xcdh';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@renderer/components/ui/dropdown-menu';
import { PlusCircle, Trash2 } from 'lucide-vue-next';
import { toast } from 'vue-sonner';
import { StockAttrDownMenuItem } from './type';

const codes = defineModel<string[]>({
  default: () => []
});

const emit = defineEmits(['confirm']);

const items: StockAttrDownMenuItem[] = [
  { type: 'add', name: '加入攻击提醒', value: 1, icon: PlusCircle, className: 'text-primary' },
  { type: 'add', name: '加入待买', value: 10, icon: PlusCircle, className: 'text-green-500' },
  { type: 'add', name: '加入持仓', value: 20, icon: PlusCircle, className: 'text-blue-500' },
  { type: 'separator', name: '', value: 0, icon: PlusCircle, className: '' },
  { type: 'del', name: '移出攻击提醒', value: 1, icon: Trash2, className: 'text-primary' },
  { type: 'del', name: '移出待买', value: 10, icon: Trash2, className: 'text-green-500' },
  { type: 'del', name: '移出持仓', value: 20, icon: Trash2, className: 'text-blue-500' }
];

const handleAttr = (item: StockAttrDownMenuItem) => {
  if (item.type === 'add') {
    handleAttrAdd(item);
  } else if (item.type === 'del') {
    handleAttrDel(item);
  }
};

const handleAttrAdd = async (item: StockAttrDownMenuItem) => {
  if (codes.value.length) {
    PostBatchUserStockSetfAdd({ ts_codes: codes.value, type: item.value });
    toast.success(`添加 ${codes.value.length} 条股票成功。`, { position: 'top-center' });
    emit('confirm', { value: item.value, type: item.type });
  } else {
    toast.warning('未选择分组。', { position: 'top-center' });
  }
};

const handleAttrDel = async (item: StockAttrDownMenuItem) => {
  if (codes.value.length) {
    PostBatchUserStockSetfRemove({ ts_codes: codes.value, type: item.value });
    toast.success(`移除 ${codes.value.length} 条股票成功。`, { position: 'top-center' });
    emit('confirm', { value: item.value, type: item.type });
  } else {
    toast.warning('未选择分组。', { position: 'top-center' });
  }
};
</script>

<template>
  <DropdownMenu>
    <DropdownMenuTrigger>
      <slot />
    </DropdownMenuTrigger>
    <DropdownMenuContent class="w-48 rounded-lg" side="right" align="start">
      <template v-for="item in items">
        <DropdownMenuItem
          v-if="item.name"
          :key="item.name"
          :class="item.className"
          @click="handleAttr(item)"
        >
          <component :is="item.icon" :size="16" />
          <span>{{ item.name }}</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator v-else-if="item.type === 'separator'" />
      </template>
      <!-- <DropdownMenuItem
        v-for="category in categorys"
        :key="`add_${category.id}`"
        class="text-orange-500"
        @click="handlePlus(category)"
      >
        <Plus />
        <span>加入{{ category.name }}</span>
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem
        v-for="category in categorys"
        :key="`del_${category.id}`"
        class="text-red-500"
        @click="handleDel(category)"
      >
        <Delete />
        <span>移出{{ category.name }}</span>
      </DropdownMenuItem> -->
    </DropdownMenuContent>
  </DropdownMenu>
</template>
