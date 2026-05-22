<script setup lang="ts">
import { AgGridVue } from 'ag-grid-vue3';
import { computed, onUnmounted, reactive, ref, shallowRef } from 'vue';
import { Local } from '@renderer/core/win-storage';
import { Delete, Edit, RefreshCcw } from 'lucide-vue-next';
import { StockAttrDownMenuItem } from '../stock/components/type';
import { useRouter } from 'vue-router';
import { customTheme } from '../self/grid-theme';
import { useAiRefresh } from '@renderer/core/useAiRefresh';
import PageContainer from '@renderer/components/page/PageContainer.vue';
import PageStockInfo from '@renderer/components/page/PageStockInfo.vue';
import StockAttrDownMenu from '../stock/components/StockAttrDownMenu.vue';
import SearchMenu from '@renderer/layout/components/header/SearchMenu.vue';
import { toast } from 'vue-sonner';
import { useGridScrollTop } from '@renderer/core/hooks/useGridScrollTop';
import { getArrayAverage } from '@renderer/lib/number';
import { defaultParams, prefixColumns, suffixColumns, typeItems } from './util';
import { RadioGroup, RadioGroupItem } from '@renderer/components/ui/radio-group';
import { Label } from '@renderer/components/ui/label';
import { Button } from '@renderer/components/ui/button';
import { Input } from '@renderer/components/ui/input';
import { GetStockQueryBuild, GetStockStrategyRecords, GetStockStrategys } from '@renderer/api/data';
import { formatFieldValues, executeScriptFunc } from '@renderer/lib/stock';
import {
  ColDef,
  RowSelectionOptions,
  GridReadyEvent,
  GridApi,
  RowClickedEvent,
  RowDoubleClickedEvent
} from 'ag-grid-community';
import {
  AddBatchUserStocksV2,
  PostBatchDelUserStockV2,
  PostUserStockStatusDels
} from '@renderer/api/xcdh';

const router = useRouter();

const checked = ref<string>(Local.get('ai_checked') || '');
const params = reactive(defaultParams());
const table_name = ref('');
const gridData = ref<StrategyRecordItem[]>([]);

const gridApi = shallowRef<GridApi<StrategyRecordItem> | null>(null);

const open = ref(false);
const dkxType = ref(0);
const loading = ref(false);
const code = ref<string>('');
const checkbox = ref<string[]>([]);
const checkedOption = ref(Local.get('StockInfoDialogChecked') || 0);
const strategys = ref<StrategyRecordModel[]>([]);
const strategy = computed<StrategyRecordModel>(
  () =>
    strategys.value.find((f) => f.strategy_id === checked.value) || {
      id: '',
      strategy_id: '',
      status: '',
      name: '',
      type: '',
      author: '',
      version: '',
      sort: 0,
      icon: null,
      description: '',
      create_time: '',
      update_time: '',
      fields: []
    }
);
const options = [
  { label: '股票K线', value: 0 },
  { label: '股票详情', value: 1 }
];

const flutteredData = computed(() => {
  if (['secboard', '20cm'].includes(strategy.value.type)) {
    return gridData.value.filter((f) => {
      const { dkx = 0, madkx = 0 } = f.values || {};
      if (dkxType.value === 1) {
        return dkx >= madkx;
      } else if (dkxType.value === 2) {
        return dkx < madkx;
      }
      return true;
    });
  } else {
    return gridData.value;
  }
});

// const cols = [
//   {
//     id: 10,
//     title: '二连板(死叉后)',
//     permissionNames: ['two_board_after_death_cross'],
//     table_name: 'two_board_after_death_cross',
//     icon: LineChart,
//     dateFields: ['results.数据开始时间', 'results.start_date'],
//     suffix: false,
//     columns: [
//       {
//         headerName: '二连板时间',
//         field: 'results.二连板时间',
//         width: 140,
//         sortable: true
//       },
//       {
//         headerName: '数据开始时间',
//         field: 'results.数据开始时间',
//         width: 100,
//         sortable: true
//       },
//       {
//         headerName: 'start_date',
//         field: 'results.start_date',
//         width: 100,
//         sortable: true
//       }
//     ]
//   }
// ];

const rowSelection = ref<RowSelectionOptions | 'single' | 'multiple'>({
  mode: 'multiRow',
  enableClickSelection: true
  //   checkboxes: (params) => params.data?.year === 2012
});

// const nav = computed(() => aiNavs.find((f) => f.id === checked.value) || aiNavs[0]);
const columnDefs = computed(() => {
  const fields = strategy.value.fields || [];
  const cols: ColDef<StrategyRecordItem>[] = [];
  for (const field of fields) {
    const suffix = field.suffix || '';
    const option: ColDef<StrategyRecordItem> = {
      headerName: field.title,
      field: `values.${field.name}`,
      width: field.width || 100,
      sortable: true,
      cellClass: field.class_name || undefined
    };
    if (suffix) {
      option.valueFormatter = (params) => {
        const value = params.value;
        return value ? `${value}${suffix}` : '';
      };
    }
    cols.push(option);
  }
  return [...prefixColumns, ...cols, ...suffixColumns];
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

// const getMyPermission = async () => {
//   let hasPermission = false;
//   const permissionNames = nav.value.permissionNames ?? [];
//   if (permission.value.length === 0) {
//     const { data } = await GetMyPermission();
//     const list = data || [];
//     permission.value = list.map((v) => v.model_name);
//     hasPermission = permission.value.some((name) => permissionNames.includes(name));
//   } else {
//     hasPermission = permission.value.some((name) => permissionNames.includes(name));
//   }
//   if (['wangji'].includes(userInfo.value.id)) {
//     return true;
//   }
//   return hasPermission;
// };

// 建仓查询
const keys = ['build_weekly', 'build_monthly', 'build_quarter'];
// 大庄查询
const keys2 = ['build_monthly_red_ctrl'];

const onRefresh = async () => {
  try {
    loading.value = true;
    let resData: { items: StrategyRecordItem[] } = { items: [] };
    if (keys.includes(checked.value)) {
      params.type = typeof params.type === 'number' ? 'build' : params.type;
      params.time_type = keys.findIndex((v) => v === checked.value) + 1;
      const { data } = await GetStockQueryBuild(params);
      resData = data || { items: [] };
    } else if (keys2.includes(checked.value)) {
      const { data } = await GetStockQueryBuild({
        time_type: 1,
        color: 'red',
        type: 'ctl'
      });
      resData = data || { items: [] };
    } else {
      const { data } = await GetStockStrategyRecords({
        ...params,
        strategy_id: checked.value,
        date: undefined,
        type: Number(params.type || 0)
      });
      resData = data || { items: [] };
    }
    // const models = data.models || [];
    // const table_name = data.table_name || '';
    const isBuild = strategy.value.type === 'build';
    const fields = strategy.value.fields || [];
    const list = resData.items.map((v) => {
      const resultValues = v.results || [];
      v.values = {};
      for (const result of resultValues) {
        v.values[result.name] = result.value;
      }
      formatFieldValues(v, fields, isBuild);

      const scriptFields = fields.filter((f) => !!f.scripts);
      executeScriptFunc(v, scriptFields);

      formatFieldValues(v, scriptFields);

      const stock_user_set = v.stock_user_set || [];
      if (v.user_collects?.length) {
        stock_user_set.push(0);
      }
      return {
        ...v,
        values: v.values,
        stock_user_set,
        attribute: 'attribute'
      };
    });

    gridData.value = list;
    if (!code.value && list.length > 0) {
      code.value = list[0].stock.ts_code || '';
    }
    setTimeout(onRefreshRiseAvg, 300);

    // const hasPermission = await getMyPermission();
    // if (hasPermission) {
    //   const { data } = await getMethods(unref(checked), {
    //     ...params,
    //     type: [8, 9].includes(checked.value) ? dkx.value : params.type
    //   });
    //   const list = data.items || [];
    //   if (data.dates) {
    //     dates.value = (data.dates || []).map((v) => formatDate(v));
    //   }
    //   table_name.value = data.table_name;
    //   const { data: realtimes } = await GetStockRealtimes(list.map((v) => v.ts_code));
    //   for (const row of list) {
    //     const realtime = realtimes[row.ts_code || ''];
    //     if (realtime) {
    //       row.rise_amt = realtime.rise_amt;
    //       row.rise_per = realtime.rise_per;
    //       row.lastPrice = realtime.lastPrice;
    //       row.lastClose = parseFloat(realtime.lastClose.toFixed(2));
    //     }
    //   }
    //   gridData.value = formatAiData(list, unref(nav));
    //   if (!code.value && gridData.value.length > 0) {
    //     code.value = gridData.value[0].ts_code || '';
    //   }
    //   setTimeout(onRefreshRiseAvg, 300);
    // } else {
    //   gridData.value = [];
    //   toast.warning(`您没有权限访问[${nav.value.title}]`, { position: 'top-right' });
    // }
  } catch (error) {
  } finally {
    loading.value = false;
  }
};

const onStrategys = async () => {
  const { data } = await GetStockStrategys();
  strategys.value = data;
  if (!data.some((v) => v.strategy_id === checked.value)) {
    checked.value = data[0]?.strategy_id || '';
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

const onGridReady = (params: GridReadyEvent<StrategyRecordItem>) => {
  gridApi.value = params.api;
  onStrategys().then(onRefresh);
  //   fetch('https://www.ag-grid.com/example-assets/small-olympic-winners.json')
  //     .then((resp) => resp.json())
  //     .then((data) => updateData(data));

  // PostSearchStocks({ page: 1, pageSize: 1000 }).then(({ data }) => {
  //   console.log(data);
  // });
};

const onSelectionChanged = () => {
  const selected = gridApi.value?.getSelectedRows() || [];
  checkbox.value = selected.map((item) => item.stock.ts_code || '');
};

const handleRowClicked = (params: RowClickedEvent<StrategyRecordItem>) => {
  const ts_code = params.data?.stock?.ts_code || '';
  if (ts_code) {
    code.value = ts_code;
  }
};

const handleDoubleClick = ({ data }: RowDoubleClickedEvent<StrategyRecordItem>) => {
  router.push({
    path: '/stock',
    query: {
      code: data?.stock?.ts_code || '000001.SZ'
    }
  });
};

// const getRowClass = ({ data }: RowClassParams<AiRow>) => data?.rowClassName;

const handleChecked = (ai: StrategyRecordModel) => {
  checked.value = ai.strategy_id;
  Local.set('ai_checked', ai.strategy_id);
  onRefresh();
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
    prices.push(node.data?.real_time?.rise_per || 0);
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

// watch(dkx, () => {
//   onRefresh();
// });

// watch(
//   () => params.select_date,
//   () => {
//     onRefresh();
//   }
// );

// watch(checked, () => {
//   checkbox.value = [];
//   onRefresh();
// });

// watch(params, () => {
//   onRefresh();
// });

const handlePlus = async () => {
  if (checkbox.value.length) {
    console.log(checkbox.value);
    await AddBatchUserStocksV2({ category: strategy.value.name, ts_codes: checkbox.value });
    toast.success(`加入 ${strategy.value.name} 成功。`);
    onRefresh();
  } else {
    toast.warning('请勾选股票项。', { position: 'top-center' });
  }
};

const handleDel = async () => {
  if (checkbox.value.length) {
    await PostBatchDelUserStockV2({ category: strategy.value.name, ts_codes: checkbox.value });
    toast.success(`移除 ${checkbox.value.length} 条股票成功。`, { position: 'top-center' });
    onRefresh();
  } else {
    toast.warning('请勾选股票项。', { position: 'top-center' });
  }
};

useGridScrollTop<StrategyRecordItem>(gridApi);

useAiRefresh({
  onRefresh: onRefreshRiseAvg,
  gridApi,
  strategy
});

onUnmounted(() => {
  gridApi.value?.destroy();
});
</script>

<template>
  <PageContainer>
    <template #header>
      <div class="flex items-center text-xs h-8">
        <div class="flex items-center overflow-x-auto overflow-y-hidden">
          <button
            v-for="ai in strategys"
            class="px-2 py-1 inline-flex justify-center items-center transition-all duration-200 ease-in-out border-r cursor-pointer hover:bg-primary hover:text-white shrink-0"
            :class="{ 'bg-red-500 text-white dark:bg-red-700': checked === ai.strategy_id }"
            @click="handleChecked(ai)"
          >
            <component v-if="ai.icon" :is="ai.icon" class="w-3 h-3" />
            <span class="ml-1">{{ ai.name }}</span>
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
            <div
              class="flex items-center justify-center cursor-pointer text-orange-500 border border-orange-500 rounded-[2px] px-1"
              @click="handlePlus"
            >
              <Edit :size="14" />
              <span class="ml-px">加入自选</span>
            </div>
            <div
              class="flex items-center justify-center cursor-pointer text-red-500 border border-red-500 rounded-[2px] px-1"
              @click="handleDel"
            >
              <Edit :size="14" />
              <span class="ml-px">移除自选</span>
            </div>
            <!-- <StockSelfDownMenu v-model="checkbox" @confirm="onRefresh">
              <div
                class="flex items-center justify-center cursor-pointer text-orange-500 border border-orange-500 rounded-[2px] px-1"
              >
                <Edit :size="14" />
                <span class="ml-px">编辑自选</span>
              </div>
            </StockSelfDownMenu> -->
            <button
              class="flex items-center justify-center cursor-pointer text-red-500 border border-red-500 rounded-[2px] px-1"
              @click="handleRemove"
            >
              <Delete :size="12" />
              <span class="ml-1">移出{{ strategy.name }}</span>
            </button>
          </div>
        </div>
        <div class="ml-auto flex items-center shrink-0">
          <span class="mr-2" :class="getRiseClassName(rise_avg)">
            平均涨幅 {{ rise_avg }}% 共{{ flutteredData.length }}只
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
          :placeholder="`搜索${strategy.name}`"
          style="width: 150px"
        />
        <div
          v-if="['build_weekly', 'build_monthly', 'build_quarter'].includes(checked)"
          class="flex items-center"
        >
          <RadioGroup
            v-model="params.type"
            class="flex items-center"
            @update:modelValue="onRefresh"
          >
            <div v-for="item in typeItems" :key="item.value" class="flex items-center">
              <RadioGroupItem :id="item.value" :value="item.value" />
              <Label :for="item.value" class="text-xs ml-1">{{ item.label }}</Label>
            </div>
          </RadioGroup>
        </div>
        <div v-if="['secboard', '20cm'].includes(strategy.type)" class="flex items-center">
          <RadioGroup v-model="dkxType" class="flex items-center">
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
        </div>
        <!-- <div v-if="['20cm'].includes(strategy.type)" class="flex items-center">
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
        </div> -->
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
      :rowData="flutteredData"
      :columnDefs="columnDefs"
      :rowSelection="rowSelection"
      :row-class-rules="{
        'bg-linear-to-r from-red-700/14 dark:from-red-500/15 to-transparent ': ({ data }) =>
          data.isChanged === 'up',
        'bg-linear-to-r from-green-700/14 dark:from-green-500/15 to-transparent': ({ data }) =>
          data.isChanged === 'down'
      }"
      :get-row-id="({ data }) => data?.stock.ts_code"
      class="h-full"
      @grid-ready="onGridReady"
      @selection-changed="onSelectionChanged"
      @row-clicked="handleRowClicked"
      @row-double-clicked="handleDoubleClick"
    />
  </PageContainer>
</template>
