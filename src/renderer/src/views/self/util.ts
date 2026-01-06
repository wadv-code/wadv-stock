import { convertAmountUnit } from '@renderer/lib/number';
import { HeartPulse, LucideProps } from 'lucide-vue-next';
import { FunctionalComponent, Ref } from 'vue';
import { VxeGridPropTypes } from 'vxe-table';
import { getClassName, sortByPercent } from '../quantify/util';
import { getObjectValue } from '@renderer/lib/object';
import { format } from 'date-fns';

export interface GridItem {
  id: number;
  title: string;
  icon: FunctionalComponent<LucideProps, {}, any, {}>;
  columns: VxeGridPropTypes.Columns;
  dateFields?: string[]; // 日期格式化
  priceFields?: string[]; // 金额格式化
  amountFields?: string[]; // 市值格式化
  percentFields?: string[]; // 进度格式化
}

export const stock_user_set = [
  { name: '自', value: 0, className: 'bg-orange-500' },
  { name: '攻', value: 1, className: 'bg-red-500' },
  { name: '步', value: 2, className: 'bg-green-500' },
  { name: '买', value: 10, className: 'bg-green-500' },
  { name: '持', value: 20, className: 'bg-blue-500' }
];

/**
 * 量化数据格式化
 * @param data 量化数据
 * @returns 格式化后的量化数据
 */
export function formatQuantifyData(nav: Ref<GridItem>, data: StockInfo[]) {
  const columns = [...nav.value.columns];
  const dateFields = nav.value.dateFields || [];
  const priceFields = nav.value.priceFields || [];
  const amountFields = nav.value.amountFields || [];
  const percentFields = nav.value.percentFields || [];
  return data.map((item) => {
    columns.forEach((col) => {
      if (col.field) {
        const value = getObjectValue(item, col.field);
        if (dateFields.includes(col.field)) {
          item[col.field] = value ? format(new Date(value), 'yy/MM/dd') : '';
        } else if (priceFields.includes(col.field)) {
          item[col.field] = value ? convertAmountUnit(value, 2) : '';
        } else if (amountFields.includes(col.field)) {
          item[col.field] = value ? convertAmountUnit(value, 2) : '';
        } else if (percentFields.includes(col.field)) {
          item[col.field] = value ? convertAmountUnit(value, 2) + '%' : '';
        } else {
          item[col.field] = value;
        }
      }
    });
    return item;
  });
}

export const selfItems: GridItem[] = [
  {
    id: 0,
    title: '我的自选',
    icon: HeartPulse,
    priceFields: [],
    amountFields: [
      'total_market_value',
      'stock.total_shares',
      'unlimit_market_value',
      'stock.unlimit_shares'
    ],
    columns: [
      { type: 'checkbox', width: 30 },
      {
        title: '股票名称',
        field: 'stock.name',
        width: 90,
        className: 'text-sm font-bold text-primary'
      },
      {
        title: '代码',
        field: 'stock.ts_code',
        width: 90,
        sortable: true
      },
      {
        title: '属性',
        field: 'attribute',
        width: 100,
        sortable: true,
        slots: {
          default: 'attribute'
        },
        sortBy({ row }) {
          const stock_user_set = row.stock_user_set || [];
          if (row?.user_collects.length) {
            stock_user_set.push(1000);
          }
          return stock_user_set.length || 0;
        }
      },
      {
        title: '攻击',
        field: 'today_atack',
        width: 65,
        sortable: true,
        slots: {
          default: 'today_atack'
        },
        sortBy({ row }) {
          return row.today_atack ? 1 : 0;
        }
      },
      {
        title: '主板',
        field: 'stock.plate',
        width: 70,
        sortable: true
      },
      {
        title: '行业',
        field: 'stock.industry',
        width: 70,
        sortable: true
      },
      {
        title: '最新',
        field: 'lastPrice',
        width: 70,
        sortable: true,
        className: getClassName
      },
      {
        title: '涨幅',
        field: 'rise_per',
        width: 70,
        sortable: true,
        className: getClassName,
        sortBy: sortByPercent
      },
      {
        title: '涨跌',
        field: 'rise_amt',
        width: 70,
        sortable: true,
        className: getClassName
      },
      {
        title: '昨收',
        field: 'lastClose',
        width: 70,
        sortable: true
      },
      {
        title: '总市值',
        field: 'total_market_value',
        width: 90,
        sortable: true,
        className: 'text-orange-500'
      },
      {
        title: '总股本',
        field: 'stock.total_shares',
        width: 90,
        sortable: true
      },
      {
        title: '流通市值',
        field: 'unlimit_market_value',
        width: 90,
        sortable: true
      },
      {
        title: '流通股本',
        field: 'stock.unlimit_shares',
        width: 90,
        sortable: true
      },
      {
        title: '',
        field: 'place',
        width: 50
      }
    ]
  }
];
