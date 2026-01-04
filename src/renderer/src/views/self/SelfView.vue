<script setup lang="ts">
import { GetUserCategorysV2, GetUserStocksV2 } from '@renderer/api/xcdh';
import PageContainer from '@renderer/components/page/PageContainer.vue';
import { LocateFixed, Plus } from 'lucide-vue-next';
import { onMounted, ref } from 'vue';
import StockInfoDialog from '@renderer/components/stock/StockInfoDialog.vue';
import { formatQuantifyData, GridItem, selfItems, stock_user_set } from './util';
import { VxeGridInstance, VxeGridPropTypes } from 'vxe-table';
import { useRealtimeRefresh } from '@renderer/core/useRealtimeRefresh';

const gridRef = ref<VxeGridInstance<StockInfo>>();
const loading = ref(false);
const categorys = ref<CategoryItem[]>([]);
const checked = ref<string>('');
const current = ref<string>();
const gridColumns = ref<VxeGridPropTypes.Columns>([]);
const gridData = ref<StockInfo[]>([]);
const quantify = ref<GridItem>(selfItems[0]);

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

const handleChecked = (category: CategoryItem) => {
  if (checked.value === category.id) {
    checked.value = '';
  } else {
    checked.value = category.id;
  }
  onRefresh().then(refresh);
};

const rowClassName = ({ row }: { row: StockInfo }) => {
  return row.rowClassName;
};

const initGridOptions = () => {
  gridColumns.value = [...quantify.value.columns];
};

const onCurrentChange = ({ row }) => {
  current.value = row.stock.ts_code === current.value ? '' : row.stock.ts_code;
};

const { refresh } = useRealtimeRefresh({
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
      <div class="flex gap-x-1 p-2 border-b border-sidebar-border items-center">
        <span>分组：</span>
        <button
          v-for="category in categorys"
          class="min-w-10 inline-flex justify-center items-center text-sm transition-all duration-200 ease-in-out px-2 border cursor-pointer border-primary"
          :class="{ 'bg-red-500 text-white dark:bg-red-700': checked === category.id }"
          @click="handleChecked(category)"
        >
          {{ category.name }}
        </button>
        <button
          class="min-w-10 inline-flex justify-center items-center text-sm transition-all duration-200 ease-in-out px-2 border cursor-pointer border-gray-500 dark:border-gray-300"
        >
          <Plus :size="16" />
          添加股票
        </button>
      </div>
    </template>
    <vxe-grid
      ref="gridRef"
      :loading="loading"
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
      @cell-click="onCurrentChange"
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
    <StockInfoDialog v-model="current" />
  </PageContainer>
</template>
