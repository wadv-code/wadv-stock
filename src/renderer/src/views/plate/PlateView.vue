<script setup lang="ts">
import { AgGridVue } from 'ag-grid-vue3';
import { useRouter } from 'vue-router';
import { GetIndustryList, GetIndustryMembers, PostSearchStocks } from '@renderer/api/xcdh';
import PageContainer from '@renderer/components/page/PageContainer.vue';
import { ref, shallowRef, unref } from 'vue';
import { Industry, IndustryMember } from './type';
import { useGlobalRefresh } from '@renderer/core/useGlobalRefresh';
import { convertAmountUnit, formatToFixed, suffixPercent } from '@renderer/lib/number';
import { customTheme } from '../self/grid-theme';
import { useSelfRefresh } from '@renderer/core/useSelfRefresh';
import {
  CellClassFunc,
  ColDef,
  GridApi,
  GridReadyEvent,
  RowDoubleClickedEvent
} from 'ag-grid-community';

const router = useRouter();

const con_code = ref('');
const industrys = ref<Industry[]>([]);
const stocks = ref<StockInfo[]>([]);
const loading = ref(false);
const loading2 = ref(false);

const getCellClass: CellClassFunc<Industry> = ({ data }) => {
  if (data?.pct_change) {
    return data?.pct_change > 0 ? 'text-red-500' : 'text-green-500';
  }
  return '';
};

const getCellClass2: CellClassFunc<StockInfo> = ({ data }) => {
  if (data && data.real_time && data.real_time.rise_amt) {
    return data.real_time.rise_amt > 0 ? 'text-red-500' : 'text-green-500';
  }
  return '';
};
const gridApi = shallowRef<GridApi<StockInfo> | null>(null);

const columnDefs: ColDef<Industry>[] = [
  {
    headerName: '板块',
    field: 'industry',
    width: 100,
    cellClass: 'text-primary font-bold'
  },
  { headerName: '编号', field: 'con_code', width: 80 },
  {
    headerName: '个股',
    field: 'company_num',
    width: 60
  },
  { headerName: '收盘指数', field: 'close', width: 80, cellClass: getCellClass },
  {
    headerName: '指数涨幅',
    field: 'pct_change',
    width: 80,
    cellClass: getCellClass
  },
  { headerName: '涨停数', field: 'limit_up_count', width: 70 },
  { headerName: '领涨', field: 'lead_stock', width: 80 },
  { headerName: '领涨价', field: 'close_price', width: 80 },
  { headerName: '领涨涨幅', field: 'pct_change_stock', width: 80 },
  {
    headerName: '金额',
    field: 'net_amount',
    width: 70,
    valueFormatter: ({ value }) => convertAmountUnit(value, 2)
  },
  {
    headerName: '流入资金',
    field: 'net_buy_amount',
    width: 80,
    valueFormatter: ({ value }) => convertAmountUnit(value, 2)
  },
  {
    headerName: '流出资金',
    field: 'net_sell_amount',
    width: 80,
    valueFormatter: ({ value }) => convertAmountUnit(value, 2)
  }
];

const columnDefs2: ColDef<StockInfo>[] = [
  {
    headerName: '股票',
    field: 'stock.name',
    width: 90,
    cellClass: 'text-primary font-bold'
  },
  { headerName: '编号', width: 80, field: 'stock.ts_code' },
  {
    headerName: '最新',
    field: 'real_time.lastPrice',
    width: 70,
    cellClass: getCellClass2
  },
  {
    headerName: '涨幅',
    field: 'real_time.rise_amt',
    width: 70,
    cellClass: getCellClass2,
    valueFormatter: ({ value }) => suffixPercent(value)
  },
  {
    headerName: '涨跌',
    field: 'real_time.rise_per',
    width: 70,
    cellClass: getCellClass2
  },
  {
    headerName: '昨收',
    field: 'real_time.lastClose',
    width: 70,
    valueFormatter: ({ value }) => formatToFixed(value, 2)
  }
];

const onRefresh = async () => {
  loading.value = true;
  const { data } = await GetIndustryList<Industry[]>();
  if (data.length && !con_code.value) {
    handleRowClicked({ data: data[0] });
  }
  industrys.value = data || [];
  loading.value = false;
};

const onDetail = async () => {
  try {
    loading2.value = true;
    const { data } = await GetIndustryMembers<IndustryMember[]>(unref(con_code));
    const { data: stockData } = await PostSearchStocks<{ items: StockInfo[] }>({
      ts_codes: data.map((item) => item.ts_code),
      page: 1,
      pageSize: 1000
    });
    stocks.value = stockData.items || [];
    loading2.value = false;
  } catch (error) {
    loading2.value = false;
  }
  //   children.value = data || [];
};

const handleRowClicked = ({ data }) => {
  con_code.value = data?.con_code;
  onDetail();
};

const handleDoubleClick = ({ data }: RowDoubleClickedEvent<StockInfo>) => {
  router.push({
    path: '/stock',
    query: {
      code: data?.stock?.ts_code || '000001.SZ'
    }
  });
};

const onGridReady = (params: GridReadyEvent<StockInfo>) => {
  gridApi.value = params.api;
  onRefresh();
};

useGlobalRefresh(onRefresh, { second: 60, key: 'global-refresh' });

useSelfRefresh({
  gridApi,
  codeKey: 'stock.ts_code'
});
</script>
<template>
  <PageContainer>
    <!-- <template #header>
      <h1 class="text-2xl font-bold">{{ $t('menu.plate') }}</h1>
    </template> -->
    <AgGridVue
      :loading="loading"
      :theme="customTheme"
      :rowData="industrys"
      :columnDefs="columnDefs"
      :get-row-id="({ data }) => data._id"
      class="h-full"
      row-selection="single"
      @grid-ready="onGridReady"
      @row-clicked="handleRowClicked"
    />
    <template #right>
      <AgGridVue
        :loading="loading2"
        :theme="customTheme"
        :rowData="stocks"
        :columnDefs="columnDefs2"
        :get-row-id="({ data }) => data.id"
        :row-class-rules="{
          'bg-linear-to-r from-transparent to-red-700/50': ({ data }) => data?.isChanged === 'up',
          'bg-linear-to-r from-transparent to-green-700/50': ({ data }) =>
            data?.isChanged === 'down'
        }"
        class="h-full"
        @row-double-clicked="handleDoubleClick"
      />
    </template>
  </PageContainer>
</template>
