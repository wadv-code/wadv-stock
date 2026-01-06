<script setup lang="ts">
import { GetIndustryList, GetIndustryMembers, PostSearchStocks } from '@renderer/api/xcdh';
import PageContainer from '@renderer/components/page/PageContainer.vue';
import { onMounted, reactive, ref, unref } from 'vue';
import { Industry, IndustryMember } from './type';
import { VxeGlobalRendererHandles, VxeGridInstance, VxeGridProps } from 'vxe-table';
import { useGlobalRefresh } from '@renderer/core/useGlobalRefresh';
import { convertAmountUnit, suffixPercent } from '@renderer/lib/number';
import { useRealtimeRefresh } from '@renderer/core/useRealtimeRefresh';

const gridRef = ref<VxeGridInstance<StockInfo>>();
const con_code = ref('');
const items = ref<Industry[]>([]);
const stocks = ref<StockInfo[]>([]);

const getClassName = (params: VxeGlobalRendererHandles.RenderTableCellParams<Industry>) => {
  if (params.row.pct_change) {
    return params.row.pct_change > 0 ? 'text-red-500' : 'text-green-500';
  }
  return '';
};

const getClassName2 = (params: VxeGlobalRendererHandles.RenderTableCellParams<StockInfo>) => {
  if (params.row.real_time.rise_amt) {
    return params.row.real_time.rise_amt > 0 ? 'text-red-500' : 'text-green-500';
  }
  return '';
};

const gridOptions = reactive<VxeGridProps<Industry>>({
  height: 'auto',
  columns: [
    {
      type: 'radio',
      width: 30
    },
    {
      title: '板块',
      field: 'industry',
      width: 100,
      sortable: true,
      className: 'text-primary font-bold'
    },
    { title: '编号', field: 'con_code', sortable: true, width: 100 },
    {
      title: '个股数量',
      field: 'company_num',
      sortable: true,
      width: 100
    },
    { title: '收盘指数', field: 'close', sortable: true, width: 100, className: getClassName },
    { title: '指数涨幅', field: 'pct_change', sortable: true, width: 100, className: getClassName },
    { title: '涨停数', field: 'limit_up_count', sortable: true, width: 100 },
    { title: '领涨', field: 'lead_stock', sortable: true, width: 100 },
    { title: '领涨价', field: 'close_price', sortable: true, width: 100 },
    { title: '领涨涨幅', field: 'pct_change_stock', sortable: true, width: 100 },
    {
      title: '金额',
      field: 'net_amount',
      sortable: true,
      width: 100,
      formatter: ({ row, column }) => convertAmountUnit(row[column.field], 2)
    },
    {
      title: '流入资金',
      field: 'net_buy_amount',
      sortable: true,
      width: 100,
      formatter: ({ row, column }) => convertAmountUnit(row[column.field], 2)
    },
    {
      title: '流出资金',
      field: 'net_sell_amount',
      sortable: true,
      width: 100,
      formatter: ({ row, column }) => convertAmountUnit(row[column.field], 2)
    }
  ],
  rowConfig: {
    keyField: '_id'
  },
  radioConfig: {
    trigger: 'row',
    highlight: true,
    checkRowKey: '_id'
  }
});

const gridOptions2 = reactive<VxeGridProps<StockInfo>>({
  loading: false,
  height: 'auto',
  columns: [
    {
      title: '板块',
      field: 'stock.name',
      width: 90,
      sortable: true,
      className: 'text-primary font-bold'
    },
    { title: '编号', field: 'stock.ts_code', sortable: true },
    {
      title: '最新',
      field: 'lastPrice',
      sortable: true,

      className: getClassName2
    },
    {
      title: '涨幅',
      field: 'rise_amt',
      sortable: true,

      className: getClassName2,
      formatter: ({ cellValue }) => suffixPercent(cellValue)
    },
    {
      title: '涨跌',
      field: 'rise_per',
      sortable: true,

      className: getClassName2
    }
    // {
    //   title: '个股数量',
    //   field: 'company_num',
    //   sortable: true,
    //   width: 100,
    //   slots: {
    //     default: 'company_num'
    //   }
    // },
    // { title: '收盘指数', field: 'close', sortable: true, width: 100, className: getClassName },
    // { title: '指数涨幅', field: 'pct_change', sortable: true, width: 100, className: getClassName },
    // { title: '涨停数', field: 'limit_up_count', sortable: true, width: 100 },
    // { title: '领涨', field: 'lead_stock', sortable: true, width: 100 },
    // { title: '领涨价', field: 'close_price', sortable: true, width: 100 },
    // { title: '领涨涨幅', field: 'pct_change_stock', sortable: true, width: 100 },
    // {
    //   title: '金额',
    //   field: 'net_amount',
    //   sortable: true,
    //   width: 100,
    //   formatter: ({ row, column }) => convertAmountUnit(row[column.field], 2)
    // },
    // {
    //   title: '流入资金',
    //   field: 'net_buy_amount',
    //   sortable: true,
    //   width: 100,
    //   formatter: ({ row, column }) => convertAmountUnit(row[column.field], 2)
    // },
    // {
    //   title: '流出资金',
    //   field: 'net_sell_amount',
    //   sortable: true,
    //   width: 100,
    //   formatter: ({ row, column }) => convertAmountUnit(row[column.field], 2)
    // }
  ],
  rowConfig: {
    keyField: '_id',
    isCurrent: true
  }
});

const onRefresh = async () => {
  const { data } = await GetIndustryList<Industry[]>();
  if (data.length && !con_code.value) {
    if (gridOptions.radioConfig) gridOptions.radioConfig.checkRowKey = data[0]._id;
    onCurrentChange({ row: data[0] });
  }
  items.value = data || [];
};

const onDetail = async () => {
  try {
    gridOptions2.loading = true;
    const { data } = await GetIndustryMembers<IndustryMember[]>(unref(con_code));
    const { data: stockData } = await PostSearchStocks<{ items: StockInfo[] }>({
      ts_codes: data.map((item) => item.ts_code),
      page: 1,
      pageSize: 1000
    });
    stocks.value = stockData.items || [];
    gridOptions2.loading = false;
  } catch (error) {
    gridOptions2.loading = false;
    // console.log(error);
  }
  //   children.value = data || [];
};

const onCurrentChange = ({ row }) => {
  con_code.value = row.con_code;
  onDetail();
};

const rowClassName = ({ row }: { row: StockInfo }) => {
  return row.rowClassName;
};

onMounted(() => {
  onRefresh();
});

useGlobalRefresh(onRefresh, { second: 5, key: 'global-refresh', immediate: true });

useRealtimeRefresh({ gridData: stocks, gridRef, codeKey: 'stock.ts_code' });
</script>
<template>
  <PageContainer>
    <!-- <template #header>
      <h1 class="text-2xl font-bold">{{ $t('menu.plate') }}</h1>
    </template> -->
    <vxe-grid v-bind="gridOptions" :data="items" @cell-click="onCurrentChange" />
    <template #right>
      <vxe-grid ref="gridRef" v-bind="gridOptions2" :data="stocks" :row-class-name="rowClassName" />
    </template>
  </PageContainer>
</template>
