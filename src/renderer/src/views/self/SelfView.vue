<script setup lang="ts">
import { AgGridVue } from 'ag-grid-vue3';
import { ref, shallowRef, unref } from 'vue';
import PageContainer from '@renderer/components/page/PageContainer.vue';
import { columnDefs } from './util';
import { Local } from '@renderer/core/win-storage';
import { Edit, Plus, RefreshCcw, Trash2 } from 'lucide-vue-next';
import { StockAttrDownMenuItem } from '../stock/components/type';
import { toast } from 'vue-sonner';
import { useRouter } from 'vue-router';
import { useSelfRefresh } from '@renderer/core/useSelfRefresh';
import { customTheme } from './grid-theme';
import CategoryModal from './components/CategoryModal.vue';
import PageStockInfo from '@renderer/components/page/PageStockInfo.vue';
import StockAttrDownMenu from '../stock/components/StockAttrDownMenu.vue';
import SearchMenu from '@renderer/layout/components/header/SearchMenu.vue';
import { GetUserCategorysV2, GetUserStocksV2, PostBatchDelUserStockV2 } from '@renderer/api/xcdh';
import {
  ColDef,
  RowSelectionOptions,
  GridReadyEvent,
  GridApi,
  RowClickedEvent,
  RowDoubleClickedEvent
} from 'ag-grid-community';
import { useGridScrollTop } from '@renderer/core/hooks/useGridScrollTop';

const router = useRouter();

const open = ref(false);
const loading = ref(false);
const category = ref('');
const categorys = ref<CategoryItem[]>([]);
const code = ref<string>('');
const checkbox = ref<string[]>([]);
const checkedOption = ref(Local.get('StockInfoDialogChecked') || 0);
// 选项
const options = [
  { label: '股票K线', value: 0 },
  { label: '股票详情', value: 1 }
];

const gridApi = shallowRef<GridApi<StockInfo> | null>(null);
const gridData = ref<StockInfo[]>([]);
const rowSelection = ref<RowSelectionOptions | 'single' | 'multiple'>({
  mode: 'multiRow',
  enableClickSelection: true
  //   checkboxes: (params) => params.data?.year === 2012
});

// 表格默认配置
const defaultColDef: ColDef<StockInfo> = {
  //   cellStyle: {
  //     textAlign: 'right'
  //     // 可选：设置单元格内边距，优化显示效果
  //   },
  //   // 表头也右对齐（可选）
  //   headerClass: 'ag-header-right-align'
};

const onCategorys = async () => {
  try {
    const { data } = await GetUserCategorysV2();
    const list = data || [];
    list.forEach((item) => {
      item.id = item.name || '';
    });
    list.unshift({
      id: '',
      sort: 0,
      name: '自选股'
    });
    const selected = Local.get('AiCategoryChecked') || '';
    category.value = list.some((item) => item.id === selected) ? selected : '';
    categorys.value = list;
  } catch (error) {
  } finally {
  }
};

const onRefresh = async () => {
  try {
    loading.value = true;
    const { data } = await GetUserStocksV2({ category: category.value });
    const list = (data || []).filter((item) => {
      item.isChanged = 'none';
      item.attribute = [
        ...(item.stock_user_set || []),
        ...(item.user_collects.length ? [100] : [])
      ].length;
      return !!item.stock;
    });
    gridData.value = list;
    if (!code.value && gridData.value.length > 0) {
      code.value = gridData.value[0].stock.ts_code || '';
    }
  } catch (error) {
  } finally {
    loading.value = false;
  }
};

const handleChecked = (item: CategoryItem) => {
  category.value = item.id;
  checkbox.value = [];
  Local.set('AiCategoryChecked', unref(category));
  onRefresh();
};

const handleEditCategory = () => {};

const handlePlus = () => {
  if (category.value) {
    open.value = true;
  } else {
    toast.warning('请先选择分组后添加。', { position: 'top-center' });
  }
};

const handleRemove = async () => {
  if (category.value) {
    if (checkbox.value.length) {
      await PostBatchDelUserStockV2({ category: category.value, ts_codes: checkbox.value });
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

const handleAttr = async (item: StockAttrDownMenuItem) => {
  const selected = gridApi.value?.getSelectedRows() || [];
  for (const row of selected) {
    row.stock_user_set = row.stock_user_set || [];
    if (item.type === 'add') {
      if (row.stock_user_set.includes(item.value)) {
        continue;
      }
      row.stock_user_set.push(item.value);
    } else if (item.type === 'del') {
      if (!row.stock_user_set.includes(item.value)) {
        continue;
      }
      row.stock_user_set = row.stock_user_set.filter((v) => v !== item.value);
    }
  }
};

const handleOptionChecked = (option: (typeof options)[0]) => {
  checkedOption.value = Number(option.value);
  Local.set('StockInfoDialogChecked', checkedOption.value);
};

const onGridReady = (params: GridReadyEvent<StockInfo>) => {
  gridApi.value = params.api;
  onCategorys().then(onRefresh);
  //   fetch('https://www.ag-grid.com/example-assets/small-olympic-winners.json')
  //     .then((resp) => resp.json())
  //     .then((data) => updateData(data));
};

const onSelectionChanged = () => {
  const selected = gridApi.value?.getSelectedRows() || [];
  checkbox.value = selected.map((item) => item.stock.ts_code || '');
};

const handleRowClicked = (params: RowClickedEvent<StockInfo>) => {
  const ts_code = params.data?.stock.ts_code || '';
  if (ts_code) {
    code.value = ts_code;
  }
};

const handleDoubleClick = ({ data }: RowDoubleClickedEvent<StockInfo>) => {
  router.push({
    path: '/stock',
    query: {
      code: data?.stock?.ts_code || '000001.SZ'
    }
  });
};

useGridScrollTop<StockInfo>(gridApi);

useSelfRefresh({
  gridApi,
  codeKey: 'stock.ts_code'
});
</script>

<template>
  <PageContainer>
    <template #header>
      <div
        class="flex border-b border-sidebar-border items-center text-xs bg-gray-100 dark:bg-gray-900"
      >
        <button
          v-for="item in categorys"
          class="min-w-10 px-2 py-1 inline-flex justify-center items-center transition-all duration-200 ease-in-out border-r cursor-pointer hover:bg-primary hover:text-white"
          :class="{ 'bg-primary text-white': category === item.id }"
          @click="handleChecked(item)"
        >
          {{ item.name }}
        </button>
        <button class="flex items-center px-2 cursor-pointer hover:text-primary" @click="onRefresh">
          <RefreshCcw :size="12" />
          <span class="ml-1">刷新</span>
        </button>
        <CategoryModal @confirm="onCategorys">
          <button
            class="flex items-center justify-center cursor-pointer border border-gray-800 dark:border-gray-300 rounded-[2px] px-1 ml-1"
            @click="handleEditCategory"
          >
            <Edit :size="12" />
            <span class="ml-px">编辑分组</span>
          </button>
        </CategoryModal>
        <div v-show="!!checkbox.length" class="px-1 flex items-center gap-x-1">
          <StockAttrDownMenu v-model="checkbox" @confirm="handleAttr">
            <div
              class="flex items-center justify-center cursor-pointer text-blue-500 border border-blue-500 rounded-[2px] px-1"
            >
              <Edit :size="12" />
              <span class="ml-px">编辑属性</span>
            </div>
          </StockAttrDownMenu>
          <div
            class="flex items-center justify-center cursor-pointer text-red-500 border border-red-500 rounded-[2px] px-1"
            @click="handleRemove"
          >
            <Trash2 :size="12" />
            <span class="ml-px">移出自选</span>
          </div>
        </div>
        <div class="ml-auto flex items-center">
          <span class="mr-2">共：{{ gridData.length }} 只</span>
          <button
            class="px-2 py-1 inline-flex justify-center items-center border-l cursor-pointer border-gray-300 dark:border-gray-700 text-green-500"
            @click="handlePlus"
          >
            <Plus :size="14" />
            添加股票
          </button>
          <button
            v-for="option in options"
            class="px-5 py-1 font-medium mr-px cursor-pointer flex items-center justify-center hover:[&_.close]:opacity-100 hover:bg-gray-300/80 hover:dark:bg-gray-700"
            :class="{ 'bg-gray-300/80 dark:bg-gray-700': checkedOption === option.value }"
            @click="handleOptionChecked(option)"
          >
            {{ option.label }}
          </button>
        </div>
      </div>
      <SearchMenu v-model="open" :trigger="false" @confirm="onRefresh" />
    </template>
    <template #right>
      <PageStockInfo v-if="code" v-model:code="code" v-model:checked="checkedOption" />
    </template>
    <AgGridVue
      :loading="loading"
      :theme="customTheme"
      :defaultColDef="defaultColDef"
      :rowData="gridData"
      :columnDefs="columnDefs"
      :rowSelection="rowSelection"
      :get-row-id="({ data }) => data.id"
      :row-class-rules="{
        'bg-linear-to-r from-red-700/14 dark:from-red-500/15 to-transparent ': ({ data }) =>
          data.isChanged === 'up',
        'bg-linear-to-r from-green-700/14 dark:from-green-500/15 to-transparent': ({ data }) =>
          data.isChanged === 'down'
      }"
      class="h-full"
      @grid-ready="onGridReady"
      @selection-changed="onSelectionChanged"
      @row-clicked="handleRowClicked"
      @row-double-clicked="handleDoubleClick"
    />
  </PageContainer>
</template>
