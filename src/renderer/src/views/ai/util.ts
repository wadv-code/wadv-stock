import { convertAmountUnit } from '@renderer/lib/number';
import { CellClassFunc, ColDef } from 'ag-grid-community';
import { FunctionalComponent } from 'vue';
import { Calendar1, CalendarDays, CalendarRange, Castle, LucideProps } from 'lucide-vue-next';
import {
  PostDataQueryBbg,
  PostDataQueryCtl,
  PostDataQueryData,
  PostDataQueryEmo,
  PostDataQueryPbqy
} from '@renderer/api/xcdh';
import GridCellAttribute from './components/GridCellAttribute.vue';
import GridCellTodayAtack from './components/GridCellTodayAtack.vue';
import { getObjectValue, setObjectValue } from '@renderer/lib/object';
import { format } from 'date-fns';

const getCellClass: CellClassFunc<AiRow> = ({ data }) => {
  const rise_amt = data?.rise_amt || 0;
  if (rise_amt > 0) {
    return 'text-red-500';
  } else if (rise_amt < 0) {
    return 'text-green-500';
  }
  return '';
};

export interface AiNav {
  id: number;
  title: string;
  table_name: string;
  icon: FunctionalComponent<LucideProps, {}, any, {}>;
  dateFields?: string[];
  booleanFields?: string[];
  columns: ColDef<AiRow>[];
}

export const prefixColumns: ColDef<AiRow>[] = [
  {
    headerName: '股票名称',
    field: 'name',
    width: 90,
    cellClass: 'font-bold text-primary'
  },
  {
    headerName: '股票代码',
    field: 'ts_code',
    width: 90
  },
  {
    headerName: '属性',
    field: 'attribute',
    width: 100,
    cellRenderer: GridCellAttribute
  },
  {
    headerName: '攻击',
    width: 65,
    cellRenderer: GridCellTodayAtack
  },
  {
    headerName: '最新',
    field: 'lastPrice',
    width: 70,
    cellClass: getCellClass
  },
  {
    headerName: '涨幅',
    field: 'rise_per',
    width: 70,
    cellClass: getCellClass,
    valueFormatter: ({ value }) => (value ? `${value}%` : '')
  },
  {
    headerName: '涨跌',
    field: 'rise_amt',
    width: 70,
    cellClass: getCellClass
  },
  {
    headerName: '昨收',
    field: 'lastClose',
    width: 70
  }
];

export const suffixColumns: ColDef<AiRow>[] = [
  {
    headerName: '总市值',
    field: 'total_market_value',
    width: 90,
    valueFormatter: ({ value }) => (value ? convertAmountUnit(value) : '')
  },
  {
    headerName: '总股本',
    field: 'total_shares',
    width: 90,
    valueFormatter: ({ value }) => (value ? convertAmountUnit(value) : '')
  },
  {
    headerName: '流通股',
    field: 'unlimit_shares',
    width: 90,
    valueFormatter: ({ value }) => (value ? convertAmountUnit(value) : '')
  },
  {
    headerName: '流通值',
    field: 'unlimit_market_value',
    width: 90,
    valueFormatter: ({ value }) => (value ? convertAmountUnit(value) : '')
  }
];

export const aiNavs: AiNav[] = [
  {
    id: 1,
    title: '周建仓',
    table_name: 'build_weekly_red',
    dateFields: ['build_date', 'build_start_date', 'highest_price_date', 'lowest_price_date'],
    icon: CalendarDays,
    columns: [
      {
        headerName: '建仓日期',
        field: 'build_date',
        width: 80
      },
      {
        headerName: '建仓最高价',
        field: 'build_high',
        width: 95
      },
      {
        headerName: '建仓最低价',
        field: 'build_low',
        width: 95
      },
      {
        headerName: '建仓收盘价',
        field: 'build_close',
        width: 95
      },
      {
        headerName: '建仓均价',
        field: 'avg_price',
        width: 90
      },
      {
        headerName: '最新/均价',
        field: 'real_price_avg_price',
        width: 90,
        valueFormatter: ({ value }) => (value ? `${value}%` : '')
      },
      {
        headerName: '目标价',
        field: 'tar_price',
        width: 80
      },
      {
        headerName: '最新/高点价',
        field: 'real_price_build_high',
        width: 100,
        valueFormatter: ({ value }) => (value ? `${value}%` : '')
      },
      {
        headerName: '最新/低点价',
        field: 'real_price_build_low',
        width: 100,
        valueFormatter: ({ value }) => (value ? `${value}%` : '')
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
    columns: [
      {
        headerName: '建仓日期',
        field: 'build_date',
        width: 80
      },
      {
        headerName: '建仓最高价',
        field: 'build_high',
        width: 95
      },
      {
        headerName: '建仓最低价',
        field: 'build_low',
        width: 95
      },
      {
        headerName: '建仓收盘价',
        field: 'build_close',
        width: 95
      },
      {
        headerName: '建仓均价',
        field: 'avg_price',
        width: 90
      },
      {
        headerName: '目标价',
        field: 'tar_price',
        width: 80
      },
      {
        headerName: '最新/均价',
        field: 'real_price_avg_price',
        width: 90,
        valueFormatter: ({ value }) => (value ? `${value}%` : '')
      },
      {
        headerName: '最新/高点价',
        field: 'real_price_build_high',
        width: 100,
        valueFormatter: ({ value }) => (value ? `${value}%` : '')
      },
      {
        headerName: '最新/低点价',
        field: 'real_price_build_low',
        width: 100,
        valueFormatter: ({ value }) => (value ? `${value}%` : '')
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
    columns: [
      {
        headerName: '过高点涨幅',
        field: 'higher_rate',
        width: 100
      },
      {
        headerName: '过高点日期',
        field: 'higher_date',
        width: 100
      },
      {
        headerName: '建仓日期',
        field: 'build_date',
        width: 80
      },
      {
        headerName: '建仓最高价',
        field: 'build_high',
        width: 95
      },
      {
        headerName: '建仓最低价',
        field: 'build_low',
        width: 95
      },
      {
        headerName: '建仓收盘价',
        field: 'build_close',
        width: 95
      },
      {
        headerName: '建仓均价',
        field: 'avg_price',
        width: 90
      },
      {
        headerName: '最新/均价',
        field: 'real_price_avg_price',
        width: 90,
        valueFormatter: ({ value }) => (value ? `${value}%` : '')
      },
      {
        headerName: '目标价',
        field: 'tar_price',
        width: 80
      },
      {
        headerName: '最新/高点价',
        field: 'real_price_build_high',
        width: 100,
        valueFormatter: ({ value }) => (value ? `${value}%` : '')
      },
      {
        headerName: '最新/低点价',
        field: 'real_price_build_low',
        width: 100,
        valueFormatter: ({ value }) => (value ? `${value}%` : '')
      }
    ]
  },
  {
    id: 4,
    title: '黑马',
    table_name: 'emotion_stocks',
    icon: Castle,
    columns: [
      {
        headerName: '目标价',
        field: 'tar_price',
        width: 80
      },
      {
        headerName: '最新/目标价',
        field: 'real_price_tar_price',
        width: 100
      },
      {
        headerName: '10周均价',
        field: 'weekly_close_avg',
        width: 80
      },
      {
        headerName: '实时价/10周均价',
        field: 'real_price_weekly_close_avg',
        width: 120
      }
    ]
  },
  {
    id: 5,
    title: '大庄票',
    table_name: 'build_monthly_red_ctrl',
    icon: Castle,
    dateFields: ['build_ctl.double_date', 'build_ctl.double_after_first_date'],
    columns: [
      {
        headerName: '建仓低点',
        field: 'build_low',
        width: 80
      },
      {
        headerName: '建仓高点',
        field: 'build_high',
        width: 80
      },
      {
        headerName: '股东人数',
        field: 'build_ctl.shareholder_count',
        width: 80
      },
      {
        headerName: '低点双倍日期',
        field: 'build_ctl.double_date',
        width: 100
      },
      {
        headerName: '最高收盘对比建仓最低涨幅',
        field: 'build_ctl.high_low_incr_rate',
        width: 170
      },
      {
        headerName: '翻倍后第一个换手率>10%日期',
        field: 'build_ctl.double_after_first_date',
        width: 200
      },
      {
        headerName: '翻倍后换手率>10%日期数量',
        field: 'build_ctl.ten_percent_tor_count',
        width: 180
      },
      {
        headerName: '其他在机构持仓占比',
        field: 'build_ctl.other_in_org_rate',
        width: 140
      }
    ]
  },
  {
    id: 6,
    title: '平步青云',
    table_name: 'pbqy_stocks',
    icon: Castle,
    dateFields: ['highest_k_date'],
    booleanFields: ['is_ctrl'],
    columns: [
      {
        headerName: '最近三个涨停日期',
        field: 'three_datas',
        width: 190
      },
      {
        headerName: '最近一个涨停后高点日期',
        field: 'highest_k_date',
        width: 160
      },
      {
        headerName: 'K',
        field: 'days_to_end',
        width: 40
      },
      {
        headerName: '最近涨停最低价',
        field: 'last_limit_up_low',
        width: 120
      },
      {
        headerName: '是否庄股',
        field: 'is_ctrl',
        width: 90,
        valueFormatter: ({ value }) => (value ? '是' : '')
      }
    ]
  },
  {
    id: 7,
    title: '步步高',
    table_name: 'bbg_stocks',
    icon: Castle,
    dateFields: ['serial_limit_up1', 'serial_limit_up2', 'third_limit_up'],
    columns: [
      {
        headerName: '连续涨停日期1',
        field: 'serial_limit_up1',
        width: 120,
        sortable: true
      },
      {
        headerName: '连续涨停日期2',
        field: 'serial_limit_up2',
        width: 120,
        sortable: true
      },
      {
        headerName: '第三个涨停日期',
        field: 'third_limit_up',
        width: 120,
        sortable: true
      },
      {
        headerName: '第三个涨停后最高价距最后K线数量',
        field: 'days_to_end',
        width: 220,
        sortable: true
      }
    ]
  }
];

export interface BuildCtl {
  _id: string;
  ts_code: string;
  name: string;
  shareholder_count: number;
  double_date: string;
  high_low_incr_rate: number;
  double_after_first_date: string;
  ten_percent_tor_count: number;
  other_in_org_rate: number;
}

export interface UserCollect {
  id: string;
  category: string;
  collect_date: string;
}

export interface AiRow {
  id: string;
  _id: string;
  avg_price: number;
  break_close_rate: null;
  break_date: null;
  break_high_rate: null;
  break_rate: null;
  build_close: number;
  build_ctl: BuildCtl;
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
  stock_user_set?: number[];
  weekly_close_avg?: number;
  real_price_weekly_close_avg?: number | string;
  three_datas?: string;
  highest_k_date?: string;
  is_ctrl?: boolean;
  last_limit_up_low?: number;
  serial_limit_up1?: string;
  serial_limit_up2?: string;
  third_limit_up?: string;
  days_to_end?: number;
  isChanged: isChanged;
  attribute?: number;
}

export interface RequestAiData {
  items: AiRow[];
  table_name: string;
}

export interface AiParams {
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

export async function getMethods(checked: number, params: AiParams) {
  if (checked === 1) {
    return PostDataQueryData<RequestAiData>({
      ...params,
      time_type: 1
    });
  } else if (checked === 2) {
    return PostDataQueryData<RequestAiData>({
      ...params,
      time_type: 2
    });
  } else if (checked === 3) {
    return PostDataQueryData<RequestAiData>({
      ...params,
      time_type: 3
    });
  } else if (checked === 4) {
    return PostDataQueryEmo<RequestAiData>(params);
  } else if (checked === 5) {
    return PostDataQueryCtl<RequestAiData>({
      ...params,
      type: 'build'
    });
  } else if (checked === 6) {
    return PostDataQueryPbqy<RequestAiData>(params);
  } else if (checked === 7) {
    return PostDataQueryBbg<RequestAiData>(params);
    // return PostDataQueryUserBbg(params);
  } else {
    return { data: { items: [], table_name: '' } };
  }
}

export const defaultParams: () => AiParams = () => ({
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

/**
 * 量化数据格式化
 * @param data 量化数据
 * @returns 格式化后的量化数据
 */
export function formatAiData(data: AiRow[], nav: AiNav) {
  const dateFields = nav.dateFields || [];
  const booleanFields = nav.booleanFields || [];
  const list: AiRow[] = [];
  for (const item of data) {
    item.isChanged = 'none';
    item.attribute = [
      ...(item.stock_user_set || []),
      ...(item.user_collects.length ? [100] : [])
    ].length;
    for (const col of nav.columns) {
      if (col.field) {
        const value = getObjectValue(item, col.field);
        if (dateFields.includes(col.field)) {
          setObjectValue(item, col.field, value ? format(new Date(value), 'yy/MM/dd') : '');
        } else if (booleanFields.includes(col.field)) {
          setObjectValue(item, col.field, value ? '是' : '');
        } else {
          setObjectValue(item, col.field, value);
        }
      }
    }
    list.push(item);
  }
  return list;
}
