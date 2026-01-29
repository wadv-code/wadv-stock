<script setup lang="ts">
import { watch } from 'vue';
import { AgGridVue } from 'ag-grid-vue3';
import { computed, reactive, ref, shallowRef, unref } from 'vue';
import { Local } from '@renderer/core/win-storage';
import { Delete, Edit, RefreshCcw } from 'lucide-vue-next';
import { StockAttrDownMenuItem } from '../stock/components/type';
import { useRouter } from 'vue-router';
import { customTheme } from '../self/grid-theme';
import { useAiRefresh } from '@renderer/core/useAiRefresh';
import { GetStockRealtimes, PostUserStockStatusDels } from '@renderer/api/xcdh';
import PageContainer from '@renderer/components/page/PageContainer.vue';
import PageStockInfo from '@renderer/components/page/PageStockInfo.vue';
import StockAttrDownMenu from '../stock/components/StockAttrDownMenu.vue';
import StockSelfDownMenu from '../stock/components/StockSelfDownMenu.vue';
import SearchMenu from '@renderer/layout/components/header/SearchMenu.vue';
import { toast } from 'vue-sonner';
import {
  AiNav,
  aiNavs,
  AiRow,
  defaultParams,
  formatAiData,
  getMethods,
  prefixColumns,
  suffixColumns
} from './util';
import {
  ColDef,
  RowSelectionOptions,
  GridReadyEvent,
  GridApi,
  RowClickedEvent,
  RowDoubleClickedEvent
} from 'ag-grid-community';
import { useGridScrollTop } from '@renderer/core/hooks/useGridScrollTop';
import { sumNumberArray } from '@renderer/lib/number';
import { userInfo } from '@renderer/core/storage';

const router = useRouter();

const checked = ref<number>(Local.get('ai_checked') || 1);
const params = reactive(defaultParams());
const table_name = ref('');
const gridData = ref<AiRow[]>([]);

const gridApi = shallowRef<GridApi<AiRow> | null>(null);

const open = ref(false);
const loading = ref(false);
const code = ref<string>('');
const checkbox = ref<string[]>([]);
const checkedOption = ref(Local.get('StockInfoDialogChecked') || 0);
// 选项
const options = [
  { label: '股票K线', value: 0 },
  { label: '股票详情', value: 1 }
];

const rowSelection = ref<RowSelectionOptions | 'single' | 'multiple'>({
  mode: 'multiRow',
  enableClickSelection: true
  //   checkboxes: (params) => params.data?.year === 2012
});

const nav = computed(() => aiNavs.find((f) => f.id === checked.value) || aiNavs[0]);
const columnDefs = computed(() => {
  const cols = [...prefixColumns, ...nav.value.columns];
  if (![6, 7].includes(checked.value)) cols.push(...suffixColumns);
  return cols;
});

const rise_per = computed(() => {
  const prices = gridData.value.map((v) => v.rise_per || 0);
  return parseFloat(sumNumberArray(prices).toFixed(2));
});

const getRiseClassName = (value: number) => {
  if (value > 0) {
    return 'text-red-500';
  } else if (value < 0) {
    return 'text-green-500';
  } else {
    return 'text-gray-500';
  }
};

// 表格默认配置
const defaultColDef: ColDef<StockInfo> = {
  //   cellStyle: {
  //     textAlign: 'right'
  //     // 可选：设置单元格内边距，优化显示效果
  //   },
  //   // 表头也右对齐（可选）
  //   headerClass: 'ag-header-right-align'
};

const onRefresh = async () => {
  try {
    loading.value = true;
    const { data } = await getMethods(unref(checked), params);
    const list = data.items || [];
    table_name.value = data.table_name;
    const { data: realtimes } = await GetStockRealtimes(list.map((v) => v.ts_code));
    for (const row of list) {
      const realtime = realtimes[row.ts_code || ''];
      if (realtime) {
        row.rise_amt = realtime.rise_amt;
        row.rise_per = realtime.rise_per;
        row.lastPrice = realtime.lastPrice;
        row.lastClose = parseFloat(realtime.lastClose.toFixed(2));
      }
    }
    gridData.value = formatAiData(list, unref(nav));
    if (!code.value && gridData.value.length > 0) {
      code.value = gridData.value[0].ts_code || '';
    }
  } catch (error) {
  } finally {
    loading.value = false;
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

const onGridReady = (params: GridReadyEvent<AiRow>) => {
  gridApi.value = params.api;
  onRefresh();
  //   fetch('https://www.ag-grid.com/example-assets/small-olympic-winners.json')
  //     .then((resp) => resp.json())
  //     .then((data) => updateData(data));
};

const onSelectionChanged = () => {
  const selected = gridApi.value?.getSelectedRows() || [];
  checkbox.value = selected.map((item) => item.ts_code || '');
};

const handleRowClicked = (params: RowClickedEvent<AiRow>) => {
  const ts_code = params.data?.ts_code || '';
  if (ts_code) {
    code.value = ts_code;
  }
};

const handleDoubleClick = ({ data }: RowDoubleClickedEvent<AiRow>) => {
  router.push({
    path: '/stock',
    query: {
      code: data?.ts_code || '000001.SZ'
    }
  });
};

// const getRowClass = ({ data }: RowClassParams<AiRow>) => data?.rowClassName;

const handleChecked = (ai: AiNav) => {
  checked.value = ai.id;
  Local.set('ai_checked', ai.id);
};

const handleRemove = async () => {
  await PostUserStockStatusDels({
    table_name: table_name.value,
    ts_codes: checkbox.value
  });
  gridData.value = gridData.value.filter((item) => !checkbox.value.includes(item.ts_code || ''));
  toast.success(`移除 ${checkbox.value.length} 条股票成功。`, { position: 'top-center' });
};

watch(checked, () => {
  // gridData.value = [];
  checkbox.value = [];
  onRefresh();
  console.log(userInfo.value);
});

useGridScrollTop<AiRow>(gridApi);

useAiRefresh({
  gridApi
});
</script>

<template>
  <PageContainer>
    <template #header>
      <div class="flex items-center text-xs">
        <button
          v-for="ai in aiNavs"
          class="px-2 py-1 inline-flex justify-center items-center transition-all duration-200 ease-in-out border-r cursor-pointer hover:bg-primary hover:text-white"
          :class="{ 'bg-red-500 text-white dark:bg-red-700': checked === ai.id }"
          @click="handleChecked(ai)"
        >
          <component v-if="ai.icon" :is="ai.icon" class="w-3 h-3" />
          <span class="ml-1">{{ ai.title }}</span>
        </button>
        <button class="flex items-center px-2 cursor-pointer hover:text-primary" @click="onRefresh">
          <RefreshCcw :size="12" />
          <span class="ml-1">刷新</span>
        </button>
        <div v-show="!!checkbox.length" class="px-2 flex items-center gap-x-1">
          <StockAttrDownMenu v-model="checkbox" @confirm="handleAttr">
            <div
              class="flex items-center justify-center cursor-pointer text-blue-500 border border-blue-500 rounded-[2px] px-1"
            >
              <Edit :size="14" />
              <span class="ml-px">编辑属性</span>
            </div>
          </StockAttrDownMenu>
          <StockSelfDownMenu v-model="checkbox" @confirm="onRefresh">
            <div
              class="flex items-center justify-center cursor-pointer text-orange-500 border border-orange-500 rounded-[2px] px-1"
            >
              <Edit :size="14" />
              <span class="ml-px">编辑自选</span>
            </div>
          </StockSelfDownMenu>
          <button
            class="flex items-center justify-center cursor-pointer text-red-500 border border-red-500 rounded-[2px] px-1"
            @click="handleRemove"
          >
            <Delete :size="12" />
            <span class="ml-1">移出{{ nav.title }}</span>
          </button>
        </div>
        <div class="ml-auto flex items-center">
          <span class="mr-2" :class="getRiseClassName(rise_per)">
            整体涨幅 {{ rise_per }}% 共{{ gridData.length }}只
          </span>
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
      <SearchMenu v-model:open="open" :trigger="false" />
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
      :row-class-rules="{
        'bg-linear-to-r from-red-700/14 dark:from-red-500/15 to-transparent ': ({ data }) =>
          data.isChanged === 'up',
        'bg-linear-to-r from-green-700/14 dark:from-green-500/15 to-transparent': ({ data }) =>
          data.isChanged === 'down'
      }"
      :get-row-id="({ data }) => data?.ts_code"
      class="h-full"
      @grid-ready="onGridReady"
      @selection-changed="onSelectionChanged"
      @row-clicked="handleRowClicked"
      @row-double-clicked="handleDoubleClick"
    />
  </PageContainer>
</template>
