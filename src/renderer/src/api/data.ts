import { requestMain } from '@renderer/lib/http';

export interface DataParmas {
  type: number;
  ts_code: string;
  begin_date: string;
  end_date?: string;
}

/**
 * K线查询(日周月季)
 * @param ts_code
 * @returns
 */
export function GetKlineKline<T = StockKLine[]>(data: DataParmas) {
  return requestMain<T>({
    url: '/api-data/Kline/kline',
    method: 'post',
    data
  });
}

/**
 * 实时K线
 * @param ts_code
 * @returns
 */
export function GetKlineRealK<T = StockKLine>(params: { ts_code: string; type: number }) {
  return requestMain<T>({
    url: '/api-data/Kline/real_k',
    method: 'get',
    params
  });
}

/**
 * 查询股票攻击记录
 * @param ts_code
 * @returns
 */
export function GetStockAtackRecords<T = AttackItem[]>(data: DataParmas) {
  return requestMain<T>({
    url: '/api-data/StockInfo/atack_records',
    method: 'post',
    data
  });
}

/**
 * 查询股票策略
 * @param ts_code
 * @returns
 */
export function GetStockStrategys<T = StrategyRecordModel[]>() {
  return requestMain<T>({
    url: '/api-data/StockInfo/strategys',
    method: 'get'
  });
}

/**
 * 查询股票策略记录
 * @param ts_code
 * @returns
 */
export function GetStockStrategyRecords<T = StrategyRecord>(data: {
  strategy_id: string;
  date?: string;
  type?: number;
}) {
  return requestMain<T>({
    url: '/api-data/StockInfo/strategy_records',
    method: 'post',
    data
  });
}

export interface QueryBuildParams {
  time_type?: number;
  color: string;
  type: string | number;
  key_words?: string;
  effect_break_date?: string;
  max_month_amp?: number;
  max_mon_chg?: number;
  select_date?: string;
}

/**
 * 模型查询（建仓，突破，大庄)
 * @param ts_code
 * @returns
 */
export function GetStockQueryBuild<T = { items: StrategyRecordItem[] }>(data: QueryBuildParams) {
  return requestMain<T>({
    url: '/api-data/StockInfo/query_builld',
    method: 'post',
    data
  });
}
