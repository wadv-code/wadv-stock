declare interface StockKLine {
  // amount: number;
  // close: number;
  // date: string;
  // high: number;
  // low: number;
  // open: number;
  // openInterest: number;
  // preClose: number;
  // settelementPrice: number;
  // suspendFlag: number;
  // time: number;
  // ts_code: string;
  // volume: number;
  // _id: string;
  // dkx: number;
  // madkx: number;
  // zha_ban?: boolean;
  // zhang_ting?: boolean;
  // chg?: number;
  // amp?: number;
  // turnover_rate?: number;
  // realBd?: number;
  // realBd_low?: number;
  // realBd_high?: number;

  amount: number;
  amp: number;
  chg: number;
  close: number;
  date: string;
  dkx: number;
  down_limit: number;
  high: number;
  is_synthesized: null | boolean;
  k_type: number;
  low: number;
  madkx: number;
  mid: number;
  open: number;
  openInterest: number;
  preClose: number;
  realBd: number;
  realBd_high: number;
  realBd_low: number;
  settelementPrice: number;
  suspendFlag: number;
  synthesis_time: null | string;
  time: number;
  ts_code: string;
  turnover_rate: null | number;
  up_limit: number;
  volume: number;
  zha_ban: null | boolean;
  zhang_ting: null | boolean;
}

declare interface AttackItem {
  _id: string;
  ts_code: string;
  date: string;
  time: string;
  timelist: string[];
  avg: number;
  name: string;
  is_valid?: boolean;
}

declare interface BuildBreakItem {
  id: string;
  cycle: string;
  build: {
    avg_price: null | number;
    build_low: number;
    build_high: number;
    build_close: number;
    higher_date: null | string;
    higher_rate: null | number;
    build_start_date: string;
    build_date: string;
    tar_price: number;
    highest_price: number;
    highest_price_date: string;
    lowest_price: number;
    lowest_price_date: string;
    amp_chg_datas?: {
      date: string;
      amp: number;
      amp_alter: boolean;
      chg: number;
      chg_alter: boolean;
    }[];
  } | null;
  break_high: {
    break_high_rate: number;
    break_date: string;
  } | null;
  break_close: {
    break_close_rate: number;
    break_date: string;
  } | null;
}

declare interface BuildBreak {
  red: BuildBreakItem[];
  green: BuildBreakItem[];
}

declare interface Emotion {
  _id: string;
  ts_code: string;
  name: string;
  week_kline_start: string;
  week_kline_end: string;
  turn_over_all_ten_week: number;
  first_limit_up_date: string;
  weekly_close_avg: number;
  total_market_value: number;
  total_shares: number;
  unlimit_market_value: number;
  unlimit_shares: number;
}

declare interface Pbqy {
  _id: string;
  ts_code: string;
  name: string;
  concepts: string;
  three_limit_up_dates: string[];
  three_datas: string;
  highest_k_date: string;
  days_to_end: number;
  last_limit_up_low: number;
  real_price: number;
  is_ctrl: boolean;
  stock_user_set: number[];
}

declare interface Bbg {
  _id: string;
  ts_code: string;
  name: string;
  concepts: string;
  serial_limit_up1: string;
  serial_limit_up2: string;
  third_limit_up: string;
  days_to_end: number;
  real_price: number;
  stock_user_set: number[];
}

declare interface BuildCtl {
  cycle: string;
  ctl: {
    _id: string;
    ts_code: string;
    name: string;
    shareholder_count: number;
    double_date: string;
    high_low_incr_rate: number;
    double_after_first_date: string;
    ten_percent_tor_count: number;
    other_in_org_rate: number;
  };
}

declare interface RealTime {
  ts_code: string;
  chg: number | null;
  time: number;
  timetag: string;
  lastPrice: number;
  open: number;
  high: number;
  low: number;
  lastClose: number;
  amount: number;
  volume: number;
  rise_per: number;
  rise_amt: number;
}

declare interface Stock {
  area: string;
  concepts: string;
  industry: string;
  name: string;
  plate: string;
  py_first_letter: string;
  symbol: number;
  total_market_value: number;
  total_shares: number;
  ts_code: string;
  unlimit_market_value: number;
  unlimit_shares: number;
  is_rz?: boolean;
}

declare type isChanged = 'up' | 'down' | 'none';

declare interface StockInfo {
  build_break: BuildBreak;
  position_ctl?: string[] | null;
  real_time: RealTime;
  stock: Stock;
  stock_user_set?: number[];
  strategys: string[];
  user_collects: UserCollect[];
  user_readed: boolean;
  isChanged: isChanged;
  today_atack?: boolean;
  attribute?: number;
  // isChanged?: isChanged;
}

// 实时价格
declare interface PriceInfo {
  _id: string;
  amount: number;
  name: string;
  price: number;
  rise_per: number;
  rise_amt: number;
  lastPrice: number;
  lastClose?: number;
  time: string;
  ts_code: string;
}

declare interface StockRealK {
  amount: number;
  close: number;
  date: string;
  dkx: number;
  high: number;
  low: number;
  madkx: number;
  open: number;
  openInterest: number;
  preClose: number;
  settelementPrice: number;
  suspendFlag: number;
  time: number;
  ts_code: string;
  volume: number;
  chg?: number;
  amp?: number;
  turnover_rate?: number;
  realBd?: number;
  realBd_low?: number;
  realBd_high?: number;
  _id: string;
}

declare interface PriceItem {
  _id: string;
  amount: number;
  name: string;
  price: number;
  rise_per: number;
  rise_amt: number;
  lastPrice: number;
  lastClose: number;
  time: string;
  ts_code: string;
}

declare interface GridData {
  avg_price: number;
  break_close_rate: number;
  break_date: string;
  break_high_rate: number;
  break_rate: number;
  build_close: number;
  build_ctl?: TypedAny;
  build_date: string;
  build_high: number;
  build_low: number;
  build_start_date: string;
  concepts: string;
  effect_break_date?: string;
  emotion_stock?: number;
  higher_date?: string;
  higher_rate?: number;
  highest_price: number;
  highest_price_date: string;
  lowest_price: number;
  lowest_price_date: string;
  mon_chg: number;
  month_amp: number;
  more_info?: TypedAny;
  name: string;
  real_price: number;
  stock_user_set?: number[];
  sug_max: number;
  sug_min: number;
  tar_price: number;
  today_atack: boolean;
  total_market_value: number;
  total_shares: number;
  ts_code: string;
  unlimit_market_value: number;
  unlimit_shares: number;
  user_collects: [];
  user_readed: boolean;
  _id: string;
  rise_per?: number;
  rise_amt?: number;
  lastClose?: number;
}

declare interface CategoryItem {
  createdOn?: string;
  createdOnString?: string;
  id: string;
  modifiedOn?: string;
  modifiedOnString?: string;
  name: string;
  sort: number;
  type?: number;
  user_id?: string;
}

declare interface TimeShare {
  amount: number;
  close: number;
  date: string;
  high: number;
  low: number;
  open: number;
  preClose: number;
  time: number;
  ts_code: string;
  volume: number;
  _id: string;
  chg?: number;
  amp?: number;
  turnover_rate?: number;
  realBd?: number;
  realBd_low?: number;
  realBd_high?: number;
}

declare interface TradeData {
  _id: string;
  trade_date: string;
  original_trade_date: string;
  margin_balance: number;
  total_trading_volume: number;
  insert_time: string;
  // 将日期转换为可排序的时间戳
  date: number;
  // 格式化日期用于显示
  formattedDate: string;
}

declare interface StrategyRecordItem {
  ts_code: string;
  strategy_id: string;
  select_date: string;
  results: { name: string; value: any }[];
  stock: Stock;
  real_time: RealTime;
  today_atack: boolean;
  stock_user_set: number[] | null;
  user_readed: boolean;
  user_collects: UserCollect[];
  attribute: string;
  values: Record<string, any>;
  isChanged?: isChanged;
}

declare interface StrategyRecordField {
  name: string;
  title: string;
  visible: boolean;
  sort: number;
  dataType: string;
  width?: number;
  suffix?: string;
  scripts?: string;
  d_places?: number;
  class_name?: string;
}

declare interface StrategyRecordModel {
  id: string;
  strategy_id: string;
  status: string;
  name: string;
  type: string;
  author: string;
  version: string;
  sort: number;
  icon: string | null;
  description: string;
  create_time: string;
  update_time: string;
  fields: StrategyRecordField[];
}

declare interface StrategyRecord {
  table_name: string;
  items: StrategyRecordItem[];
  models: StrategyRecordModel[];
}
