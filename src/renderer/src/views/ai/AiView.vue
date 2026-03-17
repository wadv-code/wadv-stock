<script setup lang="ts">
import { watch } from 'vue';
import { AgGridVue } from 'ag-grid-vue3';
import { computed, reactive, ref, shallowRef, unref } from 'vue';
import { Local } from '@renderer/core/win-storage';
import { Delete, Edit, RefreshCcw, X } from 'lucide-vue-next';
import { StockAttrDownMenuItem } from '../stock/components/type';
import { useRouter } from 'vue-router';
import { customTheme } from '../self/grid-theme';
import { useAiRefresh } from '@renderer/core/useAiRefresh';
import { GetMyPermission, GetStockRealtimes, PostUserStockStatusDels } from '@renderer/api/xcdh';
import PageContainer from '@renderer/components/page/PageContainer.vue';
import PageStockInfo from '@renderer/components/page/PageStockInfo.vue';
import StockAttrDownMenu from '../stock/components/StockAttrDownMenu.vue';
import StockSelfDownMenu from '../stock/components/StockSelfDownMenu.vue';
import SearchMenu from '@renderer/layout/components/header/SearchMenu.vue';
import { toast } from 'vue-sonner';
import { useGridScrollTop } from '@renderer/core/hooks/useGridScrollTop';
import { getArrayAverage } from '@renderer/lib/number';
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
import { userInfo } from '@renderer/core/storage';
import { RadioGroup, RadioGroupItem } from '@renderer/components/ui/radio-group';
import { Label } from '@renderer/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@renderer/components/ui/select';
import { formatDate } from '@renderer/lib/time';
import { Button } from '@renderer/components/ui/button';
import { Input } from '@renderer/components/ui/input';

const router = useRouter();

const checked = ref<number>(Local.get('ai_checked') || 1);
const params = reactive(defaultParams());
const table_name = ref('');
const gridData = ref<AiRow[]>([]);
const permission = ref<string[]>([]);

const gridApi = shallowRef<GridApi<AiRow> | null>(null);

const dkx = ref(0);
const open = ref(false);
const loading = ref(false);
const code = ref<string>('');
const checkbox = ref<string[]>([]);
const checkedOption = ref(Local.get('StockInfoDialogChecked') || 0);
const dates = ref<string[]>([]);
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
  if (nav.value.suffix) cols.push(...suffixColumns);
  return cols;
});

const rise_avg = ref(0);

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

const getMyPermission = async () => {
  let hasPermission = false;
  const permissionNames = nav.value.permissionNames ?? [];
  if (permission.value.length === 0) {
    const { data } = await GetMyPermission();
    const list = data || [];
    permission.value = list.map((v) => v.model_name);
    hasPermission = permission.value.some((name) => permissionNames.includes(name));
  } else {
    hasPermission = permission.value.some((name) => permissionNames.includes(name));
  }
  if (['wangji'].includes(userInfo.value.id)) {
    return true;
  }
  return hasPermission;
};

const onRefresh = async () => {
  try {
    loading.value = true;
    const hasPermission = await getMyPermission();
    if (hasPermission) {
      const { data } = await getMethods(unref(checked), {
        ...params,
        type: [8, 9].includes(checked.value) ? dkx.value : params.type
      });
      const list = data.items || [];
      if (data.dates) {
        dates.value = (data.dates || []).map((v) => formatDate(v));
      }
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
      setTimeout(onRefreshRiseAvg, 300);
    } else {
      gridData.value = [];
      toast.warning(`您没有权限访问[${nav.value.title}]`, { position: 'top-right' });
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

const onRefreshRiseAvg = () => {
  const prices: number[] = [];
  gridApi.value?.forEachNode((node) => {
    prices.push(node.data?.rise_per || 0);
  });
  rise_avg.value = parseFloat(getArrayAverage(prices).toFixed(2));
};

// 输入框事件处理函数
const onQuickFilterChange = (event: InputEvent) => {
  if (gridApi.value) {
    // 关键：设置快速过滤文本
    gridApi.value.setGridOption('quickFilterText', (event.target as HTMLInputElement).value);
  }
};

watch(dkx, () => {
  onRefresh();
});

watch(
  () => params.select_date,
  () => {
    onRefresh();
  }
);

watch(checked, () => {
  checkbox.value = [];
  onRefresh();
});

useGridScrollTop<AiRow>(gridApi);

useAiRefresh({
  onRefresh: onRefreshRiseAvg,
  gridApi
});
</script>

<template>
  <PageContainer>
    <template #header>
      <div class="flex items-center text-xs h-8">
        <div class="flex items-center overflow-x-auto overflow-y-hidden">
          <button
            v-for="ai in aiNavs"
            class="px-2 py-1 inline-flex justify-center items-center transition-all duration-200 ease-in-out border-r cursor-pointer hover:bg-primary hover:text-white shrink-0"
            :class="{ 'bg-red-500 text-white dark:bg-red-700': checked === ai.id }"
            @click="handleChecked(ai)"
          >
            <component v-if="ai.icon" :is="ai.icon" class="w-3 h-3" />
            <span class="ml-1">{{ ai.title }}</span>
          </button>
        </div>
        <div class="flex items-center shrink-0">
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
        </div>
        <div class="ml-auto flex items-center shrink-0">
          <span class="mr-2" :class="getRiseClassName(rise_avg)">
            平均涨幅 {{ rise_avg }}% 共{{ gridData.length }}只
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
      <div
        class="flex items-center h-8 shrink-0 p-1 gap-x-1 border-t border-gray-200 dark:border-gray-700"
      >
        <Input
          type="text"
          @input="onQuickFilterChange"
          :placeholder="`搜索${nav.title}`"
          style="width: 150px"
        />
        <div v-if="[8, 9].includes(checked)" class="flex items-center">
          <RadioGroup v-model="dkx" class="flex items-center">
            <div class="flex items-center">
              <RadioGroupItem id="r0" :value="0" />
              <Label for="r0" class="text-xs ml-1">全部</Label>
            </div>
            <div class="flex items-center">
              <RadioGroupItem id="r1" :value="1" />
              <Label for="r1" class="text-xs ml-1">白线>=黄线</Label>
            </div>
            <div class="flex items-center">
              <RadioGroupItem id="r2" :value="2" />
              <Label for="r2" class="text-xs ml-1">白线&lt;黄线</Label>
            </div>
          </RadioGroup>
          <!-- <Select v-model="dkx">
            <SelectTrigger clearable>
              <SelectValue placeholder="全部" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem :value="0">全部</SelectItem>
              <SelectItem :value="1">白线>=黄线</SelectItem>
              <SelectItem :value="2">白线&lt;黄线</SelectItem>
            </SelectContent>
          </Select> -->
        </div>
        <div v-if="[10].includes(checked)" class="flex items-center">
          <Select v-model="params.select_date">
            <SelectTrigger clearable>
              <SelectValue placeholder="全部日期" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem v-for="item in dates" :key="item" :value="item">{{ item }}</SelectItem>
            </SelectContent>
          </Select>
          <Button
            v-if="params.select_date"
            class="ml-1 bg-gray-400 dark:bg-gray-700"
            @click="params.select_date = undefined"
          >
            <X />
          </Button>
        </div>
        <Button size="sm" @click="onRefresh">
          <RefreshCcw />
          <span class="ml-1">刷新</span>
        </Button>
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
