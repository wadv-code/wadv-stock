<script setup lang="ts">
import PageContainer from '@renderer/components/page/PageContainer.vue';
import { computed, onMounted, reactive, ref, unref, watch } from 'vue';
import { VxeGridDefines, VxeGridInstance, VxeGridProps, type VxeGridPropTypes } from 'vxe-table';
import { defaultParams, formatQuantifyData, quantifyItems, QuantifyNav, QuantifyRow } from './util';
import { useRealtimeRefresh } from '@renderer/core/useRealtimeRefresh';
import { stock_user_set } from '../self/util';
import { Delete, LocateFixed, Plus, PlusCircle } from 'lucide-vue-next';
import BackupButton from '@renderer/components/ui/BackupButton.vue';
import { Local } from '@renderer/core/win-storage';
import PageStockInfo from '@renderer/components/page/PageStockInfo.vue';
import SearchMenu from '@renderer/layout/components/header/SearchMenu.vue';
import { toast } from 'vue-sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@renderer/components/ui/dropdown-menu';
import {
  AddBatchUserStocksV2,
  GetUserCategorysV2,
  PostBatchDelUserStockV2,
  PostBatchUserStockSetfAdd,
  PostBatchUserStockSetfRemove,
  PostDataQueryBbg,
  PostDataQueryCtl,
  PostDataQueryData,
  PostDataQueryEmo,
  PostDataQueryPbqy
} from '@renderer/api/xcdh';
import { useRouter } from 'vue-router';
// import StockInfoDialog from '@renderer/components/stock/StockInfoDialog.vue';

interface RequestQuantifyData {
  items: QuantifyRow[];
  table_name: string;
}

const router = useRouter();

const gridOptions = reactive<VxeGridProps<QuantifyRow>>({
  height: 'auto',
  rowConfig: {
    keyField: 'id',
    isCurrent: true
  },
  virtualYConfig: {
    enabled: true
  },
  virtualXConfig: {
    enabled: true,
    gt: 15
  },
  cellConfig: {
    height: 40
  }
});

const open = ref(false);
const gridRef = ref<VxeGridInstance<QuantifyRow>>();
const loading = ref<boolean>(false);
const checked = ref<number>(Local.get('quantify_checked') || 1);
const current = ref<string>();
const table_name = ref<string>('');
const params = reactive(defaultParams());
const gridColumns = ref<VxeGridPropTypes.Columns>([]);
const gridData = ref<QuantifyRow[]>([]);
const checkbox = ref<string[]>([]);
const categorys = ref<CategoryItem[]>([]);
const quantify = computed(
  () => quantifyItems.find((f) => f.id === checked.value) || quantifyItems[0]
);

const getMethods = async () => {
  if (checked.value === 1) {
    return PostDataQueryData<RequestQuantifyData>({
      ...params,
      time_type: 1
    });
  } else if (checked.value === 2) {
    return PostDataQueryData<RequestQuantifyData>({
      ...params,
      time_type: 2
    });
  } else if (checked.value === 3) {
    return PostDataQueryData<RequestQuantifyData>({
      ...params,
      time_type: 3
    });
  } else if (checked.value === 4) {
    return PostDataQueryEmo<RequestQuantifyData>(params);
  } else if (checked.value === 5) {
    return PostDataQueryCtl<RequestQuantifyData>({
      ...params,
      type: 'build'
    });
  } else if (checked.value === 6) {
    return PostDataQueryPbqy<RequestQuantifyData>(params);
  } else if (checked.value === 7) {
    return PostDataQueryBbg<RequestQuantifyData>(params);
    // return PostDataQueryUserBbg(params);
  } else {
    return { data: { items: [], table_name: '' } };
  }
};

const onRefresh = async () => {
  try {
    loading.value = true;
    const { data } = await getMethods();
    const items = data.items || [];
    table_name.value = data.table_name;
    gridData.value = formatQuantifyData(unref(quantify), items);
    loading.value = false;
  } catch {
    loading.value = false;
  }
};

const initGridOptions = () => {
  const quantify = quantifyItems.find((f) => f.id === checked.value);
  if (quantify) {
    gridColumns.value = [...quantify.prefixColumns, ...quantify.columns, ...quantify.suffixColumns];
  }
};

const rowClassName = ({ row }: { row: QuantifyRow }) => {
  return row.rowClassName;
};

const handlePlus = async (category: CategoryItem) => {
  if (checkbox.value.length) {
    await AddBatchUserStocksV2({ category: category.name, ts_codes: checkbox.value });
    toast.success(`加入 ${category.name} 成功。`);
    onRefresh();
  } else {
    toast.warning('请勾选股票项。', { position: 'top-center' });
  }
};

const handleDel = async (category: CategoryItem) => {
  if (checkbox.value.length) {
    await PostBatchDelUserStockV2({ category: category.name, ts_codes: checkbox.value });
    toast.success(`移除 ${checkbox.value.length} 条股票成功。`, { position: 'top-center' });
    onRefresh();
  } else {
    toast.warning('请勾选股票项。', { position: 'top-center' });
  }
};

const handleAttrAdd = async (type: number) => {
  if (checkbox.value.length) {
    PostBatchUserStockSetfAdd({ ts_codes: checkbox.value, type });
    toast.success(`添加 ${checkbox.value.length} 条股票成功。`, { position: 'top-center' });
    const data = gridRef.value?.getCheckboxRecords() || [];
    for (const row of data) {
      row.stock_user_set = row.stock_user_set || [];
      if (row.stock_user_set.includes(type)) {
        continue;
      }
      row.stock_user_set.push(type);
    }
  } else {
    toast.warning('未选择分组。', { position: 'top-center' });
  }
};

const handleAttrDel = async (type: number) => {
  if (checkbox.value.length) {
    PostBatchUserStockSetfRemove({ ts_codes: checkbox.value, type });
    toast.success(`移除 ${checkbox.value.length} 条股票成功。`, { position: 'top-center' });
    const data = gridRef.value?.getCheckboxRecords() || [];
    for (const row of data) {
      row.stock_user_set = row.stock_user_set || [];
      if (row.stock_user_set.includes(type)) {
        row.stock_user_set = row.stock_user_set.filter((f) => f !== type);
      }
    }
  } else {
    toast.warning('未选择分组。', { position: 'top-center' });
  }
};

const handleChecked = (quantify: QuantifyNav) => {
  checked.value = quantify.id;
  Local.set('quantify_checked', quantify.id);
};

const handleDbClick = ({ row }: { row: QuantifyRow }) => {
  router.push({
    path: '/stock',
    query: {
      code: row.ts_code
    }
  });
};

const onCurrentChange = ({ row }) => {
  current.value = row.ts_code;
};

const onCheckboxChange = ({ records }: VxeGridDefines.CheckboxChangeEventParams<QuantifyRow>) => {
  checkbox.value = records.map((v) => v.ts_code);
};

const onCategorys = async () => {
  try {
    const { data } = await GetUserCategorysV2();
    categorys.value = data;
  } catch (error) {
  } finally {
  }
};

watch(checked, () => {
  gridData.value = [];
  checkbox.value = [];
  initGridOptions();
  onRefresh();
});

onMounted(() => {
  initGridOptions();
  onCategorys();
  onRefresh();
});

useRealtimeRefresh({
  gridData,
  gridRef
});
</script>
<template>
  <PageContainer>
    <template #header>
      <div class="flex items-center gap-x-1 pt-1 px-1">
        <button
          v-for="quantify in quantifyItems"
          class="min-w-10 inline-flex justify-center items-center text-sm transition-all duration-200 ease-in-out px-2 py-1 border cursor-pointer"
          :class="{ 'bg-red-500 text-white dark:bg-red-700': checked === quantify.id }"
          @click="handleChecked(quantify)"
        >
          <component v-if="quantify.icon" :is="quantify.icon" class="w-3 h-3" />
          <span class="ml-1">{{ quantify.title }}</span>
        </button>
        <span class="text-sm ml-2">共：{{ gridData.length }} 只</span>
        <div v-show="!!checkbox.length" class="ml-auto px-2 text-sm flex items-center gap-x-2">
          <div
            class="flex items-center justify-center cursor-pointer text-primary"
            @click="handleAttrAdd(1)"
          >
            <PlusCircle :size="16" />
            <span class="ml-1">加攻击</span>
          </div>
          <div
            class="flex items-center justify-center cursor-pointer text-gray-500"
            @click="handleAttrDel(1)"
          >
            <Delete :size="16" />
            <span class="ml-1">移攻击</span>
          </div>
          <div
            class="flex items-center justify-center cursor-pointer text-green-500"
            @click="handleAttrAdd(10)"
          >
            <PlusCircle :size="16" />
            <span class="ml-1">加待买</span>
          </div>
          <div
            class="flex items-center justify-center cursor-pointer text-gray-500"
            @click="handleAttrDel(10)"
          >
            <Delete :size="16" />
            <span class="ml-1">移待买</span>
          </div>
          <div
            class="flex items-center justify-center cursor-pointer text-blue-500"
            @click="handleAttrAdd(20)"
          >
            <PlusCircle :size="16" />
            <span class="ml-1">加持仓</span>
          </div>
          <div
            class="flex items-center justify-center cursor-pointer text-gray-500"
            @click="handleAttrDel(20)"
          >
            <Delete :size="16" />
            <span class="ml-1">移持仓</span>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger>
              <div class="flex items-center justify-center cursor-pointer text-orange-500">
                <Plus :size="16" />
                <span class="ml-1">加自选</span>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent class="w-48 rounded-lg" side="right" align="start">
              <DropdownMenuItem
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
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <SearchMenu v-model:open="open" :trigger="false" />
    </template>
    <template #right>
      <PageStockInfo v-model="current" />
    </template>
    <div class="h-full relative">
      <vxe-grid
        ref="gridRef"
        v-bind="gridOptions"
        :columns="gridColumns"
        :data="gridData"
        :row-class-name="rowClassName"
        @cell-click="onCurrentChange"
        @checkbox-all="onCheckboxChange"
        @checkbox-change="onCheckboxChange"
        @cell-dblclick="handleDbClick"
      >
        <template #attribute="{ row }">
          <div class="gap-x-0.5 flex items-center justify-end text-xs">
            <template v-for="item in stock_user_set">
              <span
                v-if="
                  item.value === 0
                    ? !!row.user_collects?.length
                    : row.stock_user_set?.includes(item.value)
                "
                class="text-white px-0.5 rounded-[2px]"
                :class="item.className"
              >
                {{ item.name }}
              </span>
            </template>
          </div>
        </template>
        <template #today_atack="{ row }">
          <div v-if="row.today_atack" class="flex justify-center items-center text-red-500">
            <LocateFixed :size="16" />
          </div>
        </template>
      </vxe-grid>
      <BackupButton :grid="gridRef" />
    </div>
    <!-- <StockInfoDialog v-model="current" /> -->
  </PageContainer>
</template>
