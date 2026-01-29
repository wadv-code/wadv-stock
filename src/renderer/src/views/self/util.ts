import { convertAmountUnit } from '@renderer/lib/number';
import { CellClassFunc, ColDef } from 'ag-grid-community';
import GridCellTodayAtack from './components/GridCellTodayAtack.vue';
import GridCellAttribute from './components/GridCellAttribute.vue';

const getCellClass: CellClassFunc<StockInfo> = ({ data }) => {
  if (data && data.real_time.rise_amt > 0) {
    return 'text-red-500';
  } else if (data && data.real_time.rise_amt < 0) {
    return 'text-green-500';
  }
  return '';
};

export const columnDefs: ColDef[] = [
  {
    headerName: '股票名称',
    field: 'stock.name',
    width: 90,
    cellClass: 'font-bold text-primary'
  },
  {
    headerName: '代码',
    field: 'stock.ts_code',
    width: 90,
    sortable: true
  },
  {
    headerName: '属性',
    field: 'attribute',
    width: 100,
    sortable: true,
    cellRenderer: GridCellAttribute
  },
  {
    headerName: '攻击',
    field: 'today_atack',
    width: 65,
    sortable: true,
    cellRenderer: GridCellTodayAtack
  },
  {
    headerName: '主板',
    field: 'stock.plate',
    width: 70,
    sortable: true
  },
  {
    headerName: '行业',
    field: 'stock.industry',
    width: 70,
    sortable: true
  },
  {
    headerName: '最新',
    field: 'real_time.lastPrice',
    width: 70,
    sortable: true,
    cellClass: getCellClass
  },
  {
    headerName: '涨幅',
    field: 'real_time.rise_per',
    width: 70,
    sortable: true,
    cellClass: getCellClass,
    valueFormatter: ({ value }) => `${value || 0}%`,
    sort: 'desc'
  },
  {
    headerName: '涨跌',
    field: 'real_time.rise_amt',
    width: 70,
    sortable: true,
    cellClass: getCellClass
    // className: getClassName
  },
  {
    headerName: '昨收',
    field: 'real_time.lastClose',
    width: 70,
    sortable: true,
    valueFormatter: ({ value }) => (value ? convertAmountUnit(value, 2) : '')
  },
  {
    headerName: '总市值',
    field: 'total_market_value',
    width: 90,
    sortable: true,
    valueFormatter: ({ value }) => (value ? convertAmountUnit(value, 2) : '')
  },
  {
    headerName: '总股本',
    field: 'stock.total_shares',
    width: 90,
    sortable: true,
    valueFormatter: ({ value }) => (value ? convertAmountUnit(value, 2) : '')
  },
  {
    headerName: '流通市值',
    field: 'unlimit_market_value',
    width: 90,
    sortable: true,
    valueFormatter: ({ value }) => (value ? convertAmountUnit(value, 2) : '')
  },
  {
    headerName: '流通股本',
    field: 'stock.unlimit_shares',
    width: 90,
    sortable: true,
    valueFormatter: ({ value }) => (value ? convertAmountUnit(value, 2) : '')
  }
];

export const stock_user_set = [
  { name: '自', value: 0, className: 'bg-orange-500' },
  { name: '攻', value: 1, className: 'bg-red-500' },
  { name: '步', value: 2, className: 'bg-green-500' },
  { name: '买', value: 10, className: 'bg-green-500' },
  { name: '持', value: 20, className: 'bg-blue-500' }
];
