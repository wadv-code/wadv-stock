<script setup lang="ts">
import {
  AddBatchUserStocksV2,
  GetUserCategorysV2,
  GetUserStocksV2,
  PostBatchDelUserStockV2,
  PostBatchUserStockSetfAdd,
  PostBatchUserStockSetfRemove
} from '@renderer/api/xcdh';
import PageContainer from '@renderer/components/page/PageContainer.vue';
import { Delete, LocateFixed, Plus, PlusCircle } from 'lucide-vue-next';
import { onMounted, ref } from 'vue';
import { formatQuantifyData, GridItem, selfItems, stock_user_set } from './util';
import { VxeGridDefines, VxeGridInstance, VxeGridPropTypes } from 'vxe-table';
import { useRealtimeRefresh } from '@renderer/core/useRealtimeRefresh';
import PageStockInfo from '@renderer/components/page/PageStockInfo.vue';
import SearchMenu from '@renderer/layout/components/header/SearchMenu.vue';
import { toast } from 'vue-sonner';
import { useRouter } from 'vue-router';
// import StockInfoDialog from '@renderer/components/stock/StockInfoDialog.vue';

const router = useRouter();

const open = ref(false);
const gridRef = ref<VxeGridInstance<StockInfo>>();
const loading = ref(false);
const categorys = ref<CategoryItem[]>([]);
const checked = ref<string>('');
const current = ref<string>();
const gridColumns = ref<VxeGridPropTypes.Columns>([]);
const gridData = ref<StockInfo[]>([]);
const quantify = ref<GridItem>(selfItems[0]);
const checkbox = ref<string[]>([]);

const onCategorys = async () => {
  try {
    const { data } = await GetUserCategorysV2();
    const list = data || [];
    list.forEach((item) => {
      item.id = item.name || '';
    });
    list.unshift({
      id: '',
      name: '自选股'
    });
    categorys.value = list;
  } catch (error) {
  } finally {
  }
};

const onRefresh = async () => {
  try {
    loading.value = true;
    const { data } = await GetUserStocksV2({ category: checked.value });
    const list = (data || []).filter((item) => !!item.stock);
    gridData.value = formatQuantifyData(quantify, list);
  } catch (error) {
  } finally {
    loading.value = false;
  }
};

const handlePlus = () => {
  if (checked.value) {
    open.value = true;
  } else {
    toast.warning('请先选择分组后添加。', { position: 'top-center' });
  }
};

const handleConfirm = async (code: string) => {
  await AddBatchUserStocksV2({ category: checked.value, ts_codes: [code] });
  toast.success(`加入 ${checked.value} 成功。`);
  onRefresh();
};

const handleRemove = async () => {
  if (checked.value) {
    if (checkbox.value.length) {
      await PostBatchDelUserStockV2({ category: checked.value, ts_codes: checkbox.value });
      toast.success(`移除 ${checkbox.value.length} 条股票成功。`, { position: 'top-center' });
      onRefresh();
      checkbox.value = [];
    } else {
      toast.warning('请勾选移除项。', { position: 'top-center' });
    }
  } else {
    toast.warning('未选择分组。', { position: 'top-center' });
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

const handleChecked = (category: CategoryItem) => {
  checked.value = category.id;
  onRefresh();
};

const rowClassName = ({ row }: { row: StockInfo }) => {
  return row.rowClassName;
};

const initGridOptions = () => {
  gridColumns.value = [...quantify.value.columns];
};

const handleCurrentChange = ({ row }: { row: StockInfo }) => {
  current.value = row.stock.ts_code;
};

const handleDbClick = ({ row }: { row: StockInfo }) => {
  router.push({
    path: '/stock',
    query: {
      code: row.stock.ts_code
    }
  });
};

const onCheckboxChange = ({ records }: VxeGridDefines.CheckboxChangeEventParams<StockInfo>) => {
  checkbox.value = records.map((v) => v.stock.ts_code);
};

useRealtimeRefresh({
  gridData,
  gridRef,
  codeKey: 'stock.ts_code'
});

onMounted(() => {
  initGridOptions();
  onCategorys().then(onRefresh);
});
</script>

<template>
  <PageContainer>
    <template #header>
      <div class="flex gap-x-1 border-b border-sidebar-border items-center p-1">
        <button
          v-for="category in categorys"
          class="min-w-10 inline-flex justify-center items-center text-sm transition-all duration-200 ease-in-out px-2 border cursor-pointer border-primary"
          :class="{ 'bg-primary text-white': checked === category.id }"
          @click="handleChecked(category)"
        >
          {{ category.name }}
        </button>
        <button
          class="min-w-10 inline-flex justify-center items-center text-sm transition-all duration-200 ease-in-out px-2 border cursor-pointer border-gray-500 dark:border-gray-300"
          @click="handlePlus"
        >
          <Plus :size="16" />
          添加股票
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
          <div
            class="flex items-center justify-center cursor-pointer text-red-500"
            @click="handleRemove"
          >
            <Delete :size="16" />
            <span class="ml-1">移出自选</span>
          </div>
        </div>
      </div>
      <SearchMenu
        v-model:open="open"
        :trigger="false"
        :codes="gridData.map((v) => v.stock.ts_code)"
        @confirm="handleConfirm"
      />
    </template>
    <template #right>
      <PageStockInfo v-if="current" v-model="current" />
    </template>
    <vxe-grid
      ref="gridRef"
      :columns="gridColumns"
      :data="gridData"
      :row-class-name="rowClassName"
      :row-config="{
        isCurrent: true
      }"
      :virtual-y-config="{
        enabled: true
      }"
      height="auto"
      @checkbox-all="onCheckboxChange"
      @checkbox-change="onCheckboxChange"
      @cell-click="handleCurrentChange"
      @cell-dblclick="handleDbClick"
    >
      <template #attribute="{ row }">
        <div class="gap-x-0.5 flex items-center justify-end text-xs">
          <template v-for="item in stock_user_set.slice(1)">
            <span
              v-if="row.stock_user_set?.includes(item.value)"
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
    <!-- <StockInfoDialog v-model="current" /> -->
  </PageContainer>
</template>
