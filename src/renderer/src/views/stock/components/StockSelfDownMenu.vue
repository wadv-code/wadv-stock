<script setup lang="ts">
import { Plus, Trash2 } from 'lucide-vue-next';
import { onMounted, ref } from 'vue';
import { toast } from 'vue-sonner';
import {
  AddBatchUserStocksV2,
  GetUserCategorysV2,
  PostBatchDelUserStockV2
} from '@renderer/api/xcdh';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@renderer/components/ui/dropdown-menu';

interface Props {
  categorys?: CategoryItem[];
}

const codes = defineModel<string[]>({
  default: () => []
});

const emit = defineEmits(['confirm']);

defineProps<Props>();

const items = ref<CategoryItem[]>([]);

const onRefresh = async () => {
  try {
    const { data } = await GetUserCategorysV2();
    const list = data || [];
    list.forEach((item) => {
      item.id = item.name || '';
    });
    items.value = list;
  } catch (error) {
  } finally {
  }
};

const handlePlus = async (category: CategoryItem) => {
  if (codes.value.length) {
    await AddBatchUserStocksV2({ category: category.name, ts_codes: codes.value });
    toast.success(`加入 ${category.name} 成功。`);
    emit('confirm');
  } else {
    toast.warning('请勾选股票项。', { position: 'top-center' });
  }
};

const handleDel = async (category: CategoryItem) => {
  if (codes.value.length) {
    await PostBatchDelUserStockV2({ category: category.name, ts_codes: codes.value });
    toast.success(`移除 ${codes.value.length} 条股票成功。`, { position: 'top-center' });
    emit('confirm');
  } else {
    toast.warning('请勾选股票项。', { position: 'top-center' });
  }
};

onMounted(() => {
  onRefresh();
});
</script>
<template>
  <DropdownMenu>
    <DropdownMenuTrigger>
      <slot />
    </DropdownMenuTrigger>
    <DropdownMenuContent class="w-48 rounded-lg" side="right" align="start">
      <DropdownMenuItem
        v-for="category in items"
        :key="`add_${category.id}`"
        class="text-green-500"
        @click="handlePlus(category)"
      >
        <Plus />
        <span>加入{{ category.name }}</span>
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem
        v-for="category in items"
        :key="`del_${category.id}`"
        class="text-red-500"
        @click="handleDel(category)"
      >
        <Trash2 />
        <span>移出{{ category.name }}</span>
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
