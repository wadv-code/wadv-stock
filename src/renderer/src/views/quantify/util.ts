import { convertAmountUnit } from '@renderer/lib/number';
import { getObjectValue } from '@renderer/lib/object';
import { format } from 'date-fns';
import { Calendar1, CalendarDays, CalendarRange, LucideProps, Castle } from 'lucide-vue-next';
import { FunctionalComponent } from 'vue';
import { VxeGlobalRendererHandles, VxeGridPropTypes, VxeTableDefines } from 'vxe-table';

export interface ParamsType {
  key_words?: string;
  time_type: number;
  color: 'green' | 'red';
  type: 'build' | 'break' | 'break_close';
  break_date_begin?: string;
  break_date_end?: string;
  break_rate_max?: number;
  break_rate_min?: number;
  build_high_max?: number;
  build_high_min?: number;
  month_amp?: number; // 振幅
  max_mon_chg?: number; // 涨幅
  effect_break_date?: string; // 月
}

// export const typeItems: Option[] = [
//   { value: 'build', label: '建仓', icon: 'post-add', color: Colors.light.warning },
//   { value: 'break', label: '突破高点', icon: 'data-thresholding', color: Colors.light.danger },
//   { value: 'break_close', label: '突破收盘', icon: 'area-chart', color: Colors.light.success }
// ];

export interface UserCollect {
  id: string;
  category: string;
  collect_date: string;
}

export interface QuantifyRow {
  id: string;
  _id: string;
  avg_price: number;
  break_close_rate: null;
  break_date: null;
  break_high_rate: null;
  break_rate: null;
  build_close: number;
  build_ctl: null;
  build_date: string;
  build_high: number;
  build_low: number;
  build_start_date: string;
  concepts: string;
  effect_break_date: null;
  emotion_stock: null;
  higher_date: null;
  higher_rate: null;
  highest_price: number;
  highest_price_date: string;
  lowest_price: number;
  lowest_price_date: string;
  mon_chg: null;
  month_amp: null;
  more_info: null;
  name: string;
  real_price: number;
  stock_user_set: null;
  sug_max: null;
  sug_min: null;
  tar_price: number;
  today_atack: boolean;
  total_market_value: number;
  total_shares: number;
  ts_code: string;
  unlimit_market_value: number;
  unlimit_shares: number;
  user_collects: UserCollect[];
  user_readed: boolean;
  rise_amt?: number;
  rise_per?: number;
  lastPrice?: number;
  lastClose?: number | string;
  real_price_build_high?: number | string;
  real_price_build_low?: number | string;
  real_price_avg_price?: number | string;
  real_price_tar_price?: number | string;
  isChange?: boolean;
  rowClassName?: string;
}

export const defaultParams: () => ParamsType = () => ({
  key_words: undefined,
  time_type: 2,
  color: 'red',
  type: 'build',
  break_date_begin: undefined,
  break_date_end: undefined,
  break_rate_max: undefined,
  break_rate_min: undefined,
  build_high_max: undefined,
  build_high_min: undefined,
  month_amp: undefined, // 振幅
  max_mon_chg: undefined, // 涨幅
  effect_break_date: undefined
});

export interface QuantifyNav {
  id: number;
  title: string;
  table_name: string;
  icon: FunctionalComponent<LucideProps, {}, any, {}>;
  prefixColumns: VxeGridPropTypes.Columns;
  columns: VxeGridPropTypes.Columns;
  suffixColumns: VxeGridPropTypes.Columns;
  dateFields?: string[]; // 日期格式化
  priceFields?: string[]; // 金额格式化
  amountFields?: string[]; // 市值格式化
  percentFields?: string[]; // 进度格式化
}

export const getClassName = (
  params: VxeGlobalRendererHandles.RenderTableCellParams<QuantifyRow>
) => {
  if (params.row.rise_amt) {
    return params.row.rise_amt > 0 ? 'text-red-500' : 'text-green-500';
  }
  return '';
};

/**
 * 量化数据格式化
 * @param data 量化数据
 * @returns 格式化后的量化数据
 */
export function formatQuantifyData(nav: QuantifyNav, data: QuantifyRow[]) {
  const columns = [...nav.prefixColumns, ...nav.columns, ...nav.suffixColumns];
  const dateFields = nav.dateFields || [];
  const priceFields = nav.priceFields || [];
  const amountFields = nav.amountFields || [];
  const percentFields = nav.percentFields || [];
  return data.map((item) => {
    item.id = item._id;
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

/**
 * 进度排序
 * @param params 表格单元格参数
 * @returns 排序值
 */
export function sortByPercent({
  row,
  column
}: {
  row: QuantifyRow;
  column: VxeTableDefines.ColumnInfo<QuantifyRow>;
}) {
  const value = getObjectValue(row, column.field);
  return value ? parseFloat(value.replace('%', '')) : 0;
}

/**
 * 情绪表列表
 */
export const quantifyItems: QuantifyNav[] = [
  {
    id: 1,
    title: '周建仓',
    table_name: 'build_weekly_red',
    icon: CalendarDays,
    dateFields: ['build_date', 'build_start_date', 'highest_price_date', 'lowest_price_date'],
    priceFields: ['avg_price', 'tar_price', 'real_price'],
    amountFields: ['total_market_value', 'unlimit_market_value', 'total_shares', 'unlimit_shares'],
    percentFields: ['rise_per'],
    prefixColumns: [
      { type: 'checkbox', width: 30 },
      {
        title: '股票名称',
        field: 'name',
        width: 90,
        className: 'text-sm font-bold text-primary'
      },
      {
        title: '股票代码',
        field: 'ts_code',
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
        align: 'center',
        headerAlign: 'center',
        sortable: true,
        slots: {
          default: 'today_atack'
        },
        sortBy({ row }) {
          return row.today_atack ? 1 : 0;
        }
      },
      {
        title: '最新',
        field: 'real_price',
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
        title: '建仓日期',
        field: 'build_date',
        width: 80,
        sortable: true
      },
      {
        title: '建仓最高价',
        field: 'build_high',
        width: 95,
        sortable: true
      },
      {
        title: '建仓最低价',
        field: 'build_low',
        width: 95,
        sortable: true
      },
      {
        title: '建仓收盘价',
        field: 'build_close',
        width: 95,
        sortable: true
      },
      {
        title: '建仓均价',
        field: 'avg_price',
        width: 90,
        sortable: true
      },
      {
        title: '最新/均价',
        field: 'real_price_avg_price',
        width: 90,
        sortable: true,
        sortBy: sortByPercent
      },
      {
        title: '目标价',
        field: 'tar_price',
        width: 80,
        sortable: true
      },
      {
        title: '最新/高点价',
        field: 'real_price_build_high',
        width: 100,
        sortable: true,
        sortBy: sortByPercent
      },
      {
        title: '最新/低点价',
        field: 'real_price_build_low',
        width: 100,
        sortable: true,
        sortBy: sortByPercent
      }
    ],
    columns: [],
    suffixColumns: [
      // {
      //   title: '概念',
      //   field: 'concepts',
      //   width: 100,
      //   fontSize: 10,
      //   color: Colors.light.greyText
      // },
      {
        title: '总市值',
        field: 'total_market_value',
        width: 90,
        sortable: true
      },
      {
        title: '总股本',
        field: 'total_shares',
        width: 90,
        sortable: true
      },
      {
        title: '流通股',
        field: 'unlimit_shares',
        width: 90,
        sortable: true
      },
      {
        title: '流通值',
        field: 'unlimit_market_value',
        width: 90,
        sortable: true
      }
    ]
  },
  {
    id: 2,
    title: '月建仓',
    table_name: 'build_monthly_red',
    icon: CalendarRange,
    dateFields: [
      'build_date',
      'build_start_date',
      'highest_price_date',
      'lowest_price_date',
      'higher_date'
    ],
    priceFields: ['avg_price', 'tar_price', 'real_price'],
    amountFields: ['total_market_value', 'unlimit_market_value', 'total_shares', 'unlimit_shares'],
    percentFields: ['rise_per', 'higher_rate'],
    prefixColumns: [
      { type: 'checkbox', width: 30 },
      {
        title: '股票名称',
        field: 'name',
        width: 90,
        className: 'text-sm font-bold text-primary'
      },
      {
        title: '股票代码',
        field: 'ts_code',
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
        align: 'center',
        headerAlign: 'center',
        sortable: true,
        slots: {
          default: 'today_atack'
        },
        sortBy({ row }) {
          return row.today_atack ? 1 : 0;
        }
      },
      {
        title: '最新',
        field: 'real_price',
        width: 70,
        sortable: true,
        className: getClassName
      },
      {
        title: '涨幅',
        field: 'rise_per',
        width: 70,
        sortable: true,
        className: getClassName
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
        title: '建仓日期',
        field: 'build_date',
        width: 80,
        sortable: true
      },
      {
        title: '建仓最高价',
        field: 'build_high',
        width: 95,
        sortable: true
      },
      {
        title: '建仓最低价',
        field: 'build_low',
        width: 95,
        sortable: true
      },
      {
        title: '建仓收盘价',
        field: 'build_close',
        width: 95,
        sortable: true
      },
      {
        title: '建仓均价',
        field: 'avg_price',
        width: 90,
        sortable: true
      },
      {
        title: '最新/均价',
        field: 'real_price_avg_price',
        width: 90,
        sortable: true,
        sortBy: sortByPercent
      },
      {
        title: '目标价',
        field: 'tar_price',
        width: 80,
        sortable: true
      },
      {
        title: '最新/高点价',
        field: 'real_price_build_high',
        width: 100,
        sortable: true,
        sortBy: sortByPercent
      },
      {
        title: '最新/低点价',
        field: 'real_price_build_low',
        width: 100,
        sortable: true,
        className: 'text-blue-500',
        sortBy: sortByPercent
      }
    ],
    columns: [
      {
        title: '过高点涨幅',
        field: 'higher_rate',
        width: 100,
        sortable: true
      },
      {
        title: '过高点日期',
        field: 'higher_date',
        width: 100,
        sortable: true
      }
    ],
    suffixColumns: [
      // {
      //   title: '概念',
      //   field: 'concepts',
      //   width: 100,
      //   fontSize: 10,
      //   color: Colors.light.greyText
      // },
      {
        title: '总市值',
        field: 'total_market_value',
        width: 90,
        sortable: true
      },
      {
        title: '总股本',
        field: 'total_shares',
        width: 90,
        sortable: true
      },
      {
        title: '流通股',
        field: 'unlimit_shares',
        width: 90,
        sortable: true
      },
      {
        title: '流通值',
        field: 'unlimit_market_value',
        width: 90,
        sortable: true
      }
    ]
  },
  {
    id: 3,
    title: '季建仓',
    table_name: 'build_quarter_red',
    icon: Calendar1,
    dateFields: [
      'build_date',
      'build_start_date',
      'highest_price_date',
      'lowest_price_date',
      'higher_date'
    ],
    priceFields: ['avg_price', 'tar_price', 'real_price'],
    amountFields: ['total_market_value', 'unlimit_market_value', 'total_shares', 'unlimit_shares'],
    percentFields: ['rise_per', 'higher_rate'],
    prefixColumns: [
      { type: 'checkbox', width: 30 },
      {
        title: '股票名称',
        field: 'name',
        width: 90,
        className: 'text-sm font-bold text-primary'
      },
      {
        title: '股票代码',
        field: 'ts_code',
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
        align: 'center',
        headerAlign: 'center',
        sortable: true,
        slots: {
          default: 'today_atack'
        },
        sortBy({ row }) {
          return row.today_atack ? 1 : 0;
        }
      },
      {
        title: '最新',
        field: 'real_price',
        width: 70,
        sortable: true,
        className: getClassName
      },
      {
        title: '涨幅',
        field: 'rise_per',
        width: 70,
        sortable: true,
        className: getClassName
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
        title: '建仓日期',
        field: 'build_date',
        width: 80,
        sortable: true
      },
      {
        title: '建仓最高价',
        field: 'build_high',
        width: 95,
        sortable: true
      },
      {
        title: '建仓最低价',
        field: 'build_low',
        width: 95,
        sortable: true
      },
      {
        title: '建仓收盘价',
        field: 'build_close',
        width: 95,
        sortable: true
      },
      {
        title: '建仓均价',
        field: 'avg_price',
        width: 90,
        sortable: true
      },
      {
        title: '最新/均价',
        field: 'real_price_avg_price',
        width: 90,
        sortable: true,
        sortBy: sortByPercent
      },
      {
        title: '目标价',
        field: 'tar_price',
        width: 80,
        sortable: true
      },
      {
        title: '最新/高点价',
        field: 'real_price_build_high',
        width: 100,
        sortable: true,
        sortBy: sortByPercent
      },
      {
        title: '最新/低点价',
        field: 'real_price_build_low',
        width: 100,
        sortable: true,
        className: 'text-blue-500',
        sortBy: sortByPercent
      }
    ],
    columns: [
      {
        title: '过高点涨幅',
        field: 'higher_rate',
        width: 100,
        sortable: true
      },
      {
        title: '过高点日期',
        field: 'higher_date',
        width: 100,
        sortable: true
      }
    ],
    suffixColumns: [
      // {
      //   title: '概念',
      //   field: 'concepts',
      //   width: 100,
      //   fontSize: 10,
      //   color: Colors.light.greyText
      // },
      {
        title: '总市值',
        field: 'total_market_value',
        width: 90,
        sortable: true
      },
      {
        title: '总股本',
        field: 'total_shares',
        width: 90,
        sortable: true
      },
      {
        title: '流通股',
        field: 'unlimit_shares',
        width: 90,
        sortable: true
      },
      {
        title: '流通值',
        field: 'unlimit_market_value',
        width: 90,
        sortable: true
      }
    ]
  },
  {
    id: 4,
    title: '黑马',
    table_name: 'emotion_stocks',
    icon: Castle,
    dateFields: [
      'break_date',
      'build_date',
      'week_kline_start',
      'week_kline_end',
      'first_limit_up_date'
    ],
    priceFields: [],
    amountFields: ['total_market_value', 'unlimit_market_value', 'total_shares', 'unlimit_shares'],
    percentFields: [],
    prefixColumns: [
      { type: 'checkbox', width: 30 },
      {
        title: '股票名称',
        field: 'name',
        width: 90,
        className: 'text-sm font-bold text-primary'
      },
      {
        title: '股票代码',
        field: 'ts_code',
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
        align: 'center',
        headerAlign: 'center',
        sortable: true,
        slots: {
          default: 'today_atack'
        },
        sortBy({ row }) {
          return row.today_atack ? 1 : 0;
        }
      },
      {
        title: '最新',
        field: 'real_price',
        width: 70,
        sortable: true,
        className: getClassName
      },
      {
        title: '涨幅',
        field: 'rise_per',
        width: 70,
        sortable: true,
        className: getClassName
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
        title: '目标价',
        field: 'tar_price',
        width: 80,
        sortable: true
      },
      {
        title: '最新/目标价',
        field: 'real_price_tar_price',
        width: 100,
        sortable: true,
        sortBy: sortByPercent
      },
      {
        title: '10周均价',
        field: 'weekly_close_avg',
        width: 80,
        sortable: true
      },
      {
        title: '实时价/10周均价',
        field: 'real_price_weekly_close_avg',
        width: 120,
        sortable: true,
        sortBy: sortByPercent
      }
    ],
    columns: [],
    suffixColumns: [
      // {
      //   title: '概念',
      //   field: 'concepts',
      //   width: 100,
      //   fontSize: 10,
      //   color: Colors.light.greyText
      // },
      {
        title: '总市值',
        field: 'total_market_value',
        width: 90,
        sortable: true
      },
      {
        title: '总股本',
        field: 'total_shares',
        width: 90,
        sortable: true
      },
      {
        title: '流通股',
        field: 'unlimit_shares',
        width: 90,
        sortable: true
      },
      {
        title: '流通值',
        field: 'unlimit_market_value',
        width: 90,
        sortable: true
      }
    ]
  }

  //   {
  //     id: 4,
  //     title: '黑马',
  //     model_name: 'heima',
  //     icon: 'data-thresholding',
  //     count: 0,
  //     dateKeys: [
  //       'break_date',
  //       'build_date',
  //       'week_kline_start',
  //       'week_kline_end',
  //       'first_limit_up_date'
  //     ],
  //     formatKeys: ['turn_over_all_ten_week'],
  //     typeKeys: [],
  //     columns: [
  //       {
  //         title: '股票名称',
  //         field: 'name',
  //         width: 90
  //       },
  //       {
  //         title: '当日攻击',
  //         field: 'today_atack',
  //         width: 70
  //       },
  //       // {
  //       //   title: '概念',
  //       //   field: 'concepts',
  //       //   width: 100,
  //       //   fontSize: 10,
  //       //   color: Colors.light.greyText
  //       // },
  //       // {
  //       //   title: '周期',
  //       //   field: 'week',
  //       //   width: 40
  //       // },
  //       // {
  //       //   title: '月期',
  //       //   field: 'month',
  //       //   width: 40
  //       // },
  //       // {
  //       //   title: '季期',
  //       //   field: 'quarter',
  //       //   width: 40
  //       // },
  //       // {
  //       //   title: '建仓日期',
  //       //   field: 'build_date',
  //       //   width: 70
  //       // },
  //       // {
  //       //   title: '建仓最高价',
  //       //   field: 'build_high',
  //       //   width: 70
  //       // },
  //       // {
  //       //   title: '建仓收盘价',
  //       //   field: 'build_close',
  //       //   width: 70
  //       // },
  //       // {
  //       //   title: '突破高价涨幅',
  //       //   field: 'break_high_rate',
  //       //   width: 100,
  //       //   suffix: '%'
  //       // },
  //       // {
  //       //   title: '突破日期',
  //       //   field: 'break_date',
  //       //   width: 70
  //       // },
  //       {
  //         title: '最新',
  //         field: 'real_price',
  //         width: 70,
  //         increase: true,
  //         increaseKey: 'rise_per'
  //       },
  //       {
  //         title: '涨幅',
  //         field: 'rise_per',
  //         width: 70,
  //         suffix: '%',
  //         increase: true
  //       },
  //       {
  //         title: '涨跌',
  //         field: 'rise_amt',
  //         width: 70,
  //         increase: true
  //       },
  //       {
  //         title: '昨收',
  //         field: 'lastClose',
  //         width: 70
  //       },
  //       {
  //         title: '目标价',
  //         field: 'tar_price',
  //         width: 70
  //       },
  //       // {
  //       //   title: '最新',
  //       //   field: 'real_price',
  //       //   width: 70,
  //       //   color: Colors.light.danger
  //       // },
  //       {
  //         title: '最新/目标价',
  //         field: 'real_price_tar_price',
  //         width: 80,
  //         color: Colors.light.warning,
  //         suffix: '%'
  //       },
  //       {
  //         title: '10周均价',
  //         field: 'weekly_close_avg',
  //         width: 70
  //       },
  //       {
  //         title: '实时价/10周均价',
  //         field: 'real_price_weekly_close_avg',
  //         width: 100,
  //         color: Colors.light.warning,
  //         suffix: '%'
  //       },
  //       // {
  //       //   title: '买入区间',
  //       //   field: 'sug_min_sug_max',
  //       //   width: 120
  //       // },
  //       {
  //         title: '总市值',
  //         field: 'total_market_value',
  //         width: 70,
  //         format: true,
  //         color: Colors.light.warning
  //       },
  //       {
  //         title: '总股本',
  //         field: 'total_shares',
  //         width: 70,
  //         format: true
  //       },
  //       {
  //         title: '流通市值',
  //         field: 'unlimit_market_value',
  //         width: 70,
  //         format: true
  //       },
  //       {
  //         title: '流通股本',
  //         field: 'unlimit_shares',
  //         width: 70,
  //         format: true
  //       },
  //       {
  //         title: '周线计算开始',
  //         field: 'week_kline_start',
  //         width: 100
  //       },
  //       {
  //         title: '周线计算结束',
  //         field: 'week_kline_end',
  //         width: 100
  //       },
  //       {
  //         title: '10周换手率总和%',
  //         field: 'turn_over_all_ten_week',
  //         width: 130,
  //         suffix: '%'
  //       },
  //       {
  //         title: '日线涨停时间',
  //         field: 'first_limit_up_date',
  //         width: 100
  //       },

  //       // 占位
  //       {
  //         title: '',
  //         field: 'null',
  //         width: 50
  //       }
  //     ]
  //   },
  //   {
  //     id: 5,
  //     title: '大庄票',
  //     model_name: 'dazhuang',
  //     icon: 'dataset',
  //     count: 0,
  //     dateKeys: [
  //       'build_date',
  //       'break_date',
  //       'new_date',
  //       'max_date',
  //       'double_date',
  //       'double_after_first_date'
  //     ],
  //     typeKeys: [],
  //     columns: [
  //       {
  //         title: '股票名称',
  //         field: 'name',
  //         width: 90
  //       },
  //       {
  //         title: '当日攻击',
  //         field: 'today_atack',
  //         width: 70
  //       },
  //       // {
  //       //   title: '概念',
  //       //   field: 'concepts',
  //       //   width: 100,
  //       //   fontSize: 10,
  //       //   color: Colors.light.greyText
  //       // },
  //       {
  //         title: '建仓低点',
  //         field: 'build_low',
  //         width: 80
  //       },
  //       {
  //         title: '建仓高点',
  //         field: 'build_high',
  //         width: 80
  //       },
  //       // {
  //       //   title: '收盘价格',
  //       //   field: 'build_close',
  //       //   width: 80
  //       // },
  //       // {
  //       //   title: '建仓日期',
  //       //   field: 'build_date',
  //       //   width: 100
  //       // },
  //       // {
  //       //   title: '突破日涨幅',
  //       //   field: 'break_high_rate',
  //       //   width: 100
  //       // },
  //       // {
  //       //   title: '突破日期',
  //       //   field: 'break_date',
  //       //   width: 100
  //       // },
  //       // {
  //       //   title: '建议买下限',
  //       //   field: 'sug_min',
  //       //   width: 100
  //       // },
  //       // {
  //       //   title: '建议买上限',
  //       //   field: 'sug_max',
  //       //   width: 100
  //       // },

  //       // 新增
  //       {
  //         title: '股东人数',
  //         field: 'shareholder_count',
  //         width: 80
  //       },
  //       {
  //         title: '低点双倍日期',
  //         field: 'double_date',
  //         width: 120
  //       },
  //       {
  //         title: '最高收盘对比\n建仓最低涨幅',
  //         field: 'high_low_incr_rate',
  //         suffix: '%',
  //         width: 100,
  //         color: Colors.light.warning
  //       },
  //       {
  //         title: '翻倍后第一个\n换手率>10%日期',
  //         field: 'double_after_first_date',
  //         width: 110
  //       },
  //       {
  //         title: '翻倍后换手率\n>10%日期数量',
  //         field: 'ten_percent_tor_count',
  //         width: 110
  //       },
  //       {
  //         title: '其他在机构\n持仓占比',
  //         field: 'other_in_org_rate',
  //         width: 100
  //       },
  //       {
  //         title: '最新',
  //         field: 'real_price',
  //         width: 70,
  //         increase: true,
  //         increaseKey: 'rise_per'
  //       },
  //       {
  //         title: '涨幅',
  //         field: 'rise_per',
  //         width: 70,
  //         suffix: '%',
  //         increase: true
  //       },
  //       {
  //         title: '涨跌',
  //         field: 'rise_amt',
  //         width: 70,
  //         increase: true
  //       },
  //       {
  //         title: '昨收',
  //         field: 'lastClose',
  //         width: 70
  //       },

  //       // 其他
  //       {
  //         title: '总市值',
  //         field: 'total_market_value',
  //         width: 80,
  //         format: true,
  //         color: Colors.light.warning
  //       },
  //       {
  //         title: '总股本',
  //         field: 'total_shares',
  //         width: 80,
  //         format: true
  //       },
  //       {
  //         title: '流通股',
  //         field: 'unlimit_shares',
  //         width: 80,
  //         format: true
  //       },
  //       {
  //         title: '流通值',
  //         field: 'unlimit_market_value',
  //         width: 80,
  //         format: true
  //       },

  //       // 占位
  //       {
  //         title: '',
  //         field: 'null',
  //         width: 50
  //       }
  //     ]
  //   },
  //   {
  //     id: 6,
  //     title: '平步青云',
  //     model_name: 'pbqy',
  //     icon: '1k-plus',
  //     count: 0,
  //     dateKeys: ['highest_k_date'],
  //     typeKeys: [],
  //     columns: [
  //       {
  //         title: '股票名称',
  //         field: 'name',
  //         width: 90
  //       },
  //       {
  //         title: '当日攻击',
  //         field: 'today_atack',
  //         width: 70
  //       },
  //       // {
  //       //   title: '概念',
  //       //   field: 'concepts',
  //       //   width: 100,
  //       //   fontSize: 10,
  //       //   color: Colors.light.greyText
  //       // },
  //       {
  //         title: '最近三个涨停日期',
  //         field: 'three_datas',
  //         width: 200
  //       },
  //       {
  //         title: '最近一个涨停后\n高点日期',
  //         field: 'highest_k_date',
  //         width: 100
  //       },
  //       {
  //         title: 'K',
  //         field: 'days_to_end',
  //         width: 80
  //       },
  //       {
  //         title: '最近涨停最低价',
  //         field: 'last_limit_up_low',
  //         width: 100
  //       },
  //       {
  //         title: '最新',
  //         field: 'real_price',
  //         width: 70,
  //         increase: true,
  //         increaseKey: 'rise_per'
  //       },
  //       {
  //         title: '涨幅',
  //         field: 'rise_per',
  //         width: 70,
  //         suffix: '%',
  //         increase: true
  //       },
  //       {
  //         title: '涨跌',
  //         field: 'rise_amt',
  //         width: 70,
  //         increase: true
  //       },
  //       {
  //         title: '昨收',
  //         field: 'lastClose',
  //         width: 70
  //       },
  //       // {
  //       //   title: '实时价',
  //       //   field: 'real_price',
  //       //   width: 80,
  //       //   color: Colors.light.danger
  //       // },
  //       {
  //         title: '是否庄股',
  //         field: 'is_ctrl',
  //         width: 90
  //       },

  //       // 占位
  //       {
  //         title: '',
  //         field: 'null',
  //         width: 50
  //       }
  //     ]
  //   },
  //   {
  //     id: 7,
  //     title: '步步高',
  //     model_name: 'bbg',
  //     icon: 'data-exploration',
  //     count: 0,
  //     dateKeys: ['serial_limit_up1', 'serial_limit_up2', 'third_limit_up'],
  //     typeKeys: [],
  //     columns: [
  //       {
  //         title: '股票名称',
  //         field: 'name',
  //         width: 90
  //       },
  //       {
  //         title: '当日攻击',
  //         field: 'today_atack',
  //         width: 70
  //       },
  //       // {
  //       //   title: '概念',
  //       //   field: 'concepts',
  //       //   width: 100,
  //       //   fontSize: 10,
  //       //   color: Colors.light.greyText
  //       // },
  //       {
  //         title: '连续涨停日期1',
  //         field: 'serial_limit_up1',
  //         width: 100
  //       },
  //       {
  //         title: '连续涨停日期2',
  //         field: 'serial_limit_up2',
  //         width: 100
  //       },
  //       {
  //         title: '第三个涨停日期',
  //         field: 'third_limit_up',
  //         width: 100
  //       },
  //       {
  //         title: '第三个涨停后最高价\n距最后K线数量',
  //         field: 'days_to_end',
  //         width: 120
  //       },
  //       {
  //         title: '最新',
  //         field: 'real_price',
  //         width: 70,
  //         increase: true,
  //         increaseKey: 'rise_per'
  //       },
  //       {
  //         title: '涨幅',
  //         field: 'rise_per',
  //         width: 70,
  //         suffix: '%',
  //         increase: true
  //       },
  //       {
  //         title: '涨跌',
  //         field: 'rise_amt',
  //         width: 70,
  //         increase: true
  //       },
  //       {
  //         title: '昨收',
  //         field: 'lastClose',
  //         width: 70
  //       },
  //       // {
  //       //   title: '最新',
  //       //   field: 'real_price',
  //       //   width: 80,
  //       //   color: Colors.light.danger
  //       // },

  //       // 占位
  //       {
  //         title: '',
  //         field: 'null',
  //         width: 50
  //       }
  //     ]
  //   }
];
