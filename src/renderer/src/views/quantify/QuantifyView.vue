<script setup lang="ts">
import {
  PostDataQueryBbg,
  PostDataQueryCtl,
  PostDataQueryData,
  PostDataQueryEmo,
  PostDataQueryPbqy
} from '@renderer/api/xcdh';
import PageContainer from '@renderer/components/page/PageContainer.vue';
import { computed, onMounted, reactive, ref, unref, watch } from 'vue';
import { VxeGridInstance, VxeGridProps, type VxeGridPropTypes } from 'vxe-table';
import { defaultParams, formatQuantifyData, quantifyItems, QuantifyNav, QuantifyRow } from './util';
import { useRealtimeRefresh } from '@renderer/core/useRealtimeRefresh';
import { stock_user_set } from '../self/util';
import { LocateFixed } from 'lucide-vue-next';
import StockInfoDialog from '@renderer/components/stock/StockInfoDialog.vue';
import BackupButton from '@renderer/components/ui/BackupButton.vue';

interface RequestQuantifyData {
  items: QuantifyRow[];
  table_name: string;
}

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
    gt: 10
  },
  cellConfig: {
    height: 40
  }
});

const gridRef = ref<VxeGridInstance<QuantifyRow>>();
const loading = ref<boolean>(false);
const checked = ref<number>(4);
const current = ref<string>();
const table_name = ref<string>('');
const params = reactive(defaultParams());
const gridColumns = ref<VxeGridPropTypes.Columns>([]);
const gridData = ref<QuantifyRow[]>([]);
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

const handleChecked = (quantify: QuantifyNav) => {
  checked.value = quantify.id;
  onRefresh();
};

const onCurrentChange = ({ row }) => {
  current.value = row.ts_code === current.value ? '' : row.ts_code;
};

watch(checked, () => {
  gridData.value = [];
  initGridOptions();
  onRefresh();
});

onMounted(() => {
  initGridOptions();
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
        <span class="ml-1 text-primary">共 {{ gridData.length }} 只</span>
      </div>
    </template>
    <vxe-grid
      ref="gridRef"
      v-bind="gridOptions"
      :loading="loading"
      :columns="gridColumns"
      :data="gridData"
      :row-class-name="rowClassName"
      @cell-click="onCurrentChange"
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
    <StockInfoDialog v-model="current" />
  </PageContainer>
</template>
