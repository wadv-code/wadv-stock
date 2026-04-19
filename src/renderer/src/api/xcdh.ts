import { requestMain } from '@renderer/lib/http';
import { AiParams, UserCollect } from '@renderer/views/ai/util';

/**
 * 获取市场总览
 * @returns 市场总览
 */
export function GetMarketInfos<T = TradeData[]>() {
  return requestMain<T>({
    url: '/api-data/Data/market_infos',
    method: 'get'
  });
}

/**
 * 通过关键字检索股票信息
 * @returns 检索内容
 */
export function PostSearchStocks<
  T = {
    items: StockInfo[];
  }
>(data: { key_word?: string; ts_codes?: string[]; page: number; pageSize?: number }) {
  return requestMain<T>({
    url: '/api-data/StockInfo/search_stocks',
    method: 'POST',
    data
  });
}

export interface StockKLineRequest {
  type: 0 | 1 | 2 | 3; // 0分时 1 日 2周 3 月
  ts_code: string;
  begin_date: string;
  end_date?: string;
}

/**
 * 查询股票详情信息
 * @param data
 * @returns
 */
export async function GetStockInfo<T = StockInfo>(ts_code: string) {
  return requestMain<T>({
    url: '/api-data/StockInfo/stock_info',
    method: 'get',
    params: { ts_code }
  });
}

/**
 * 数据查询 - 建仓/突破 阴阳集成查询接口
 * @returns 市场总览
 */
export function PostDataQueryData<T = { items: TypedAny[]; table_name: string }>(data: AiParams) {
  return requestMain<T>({
    url: '/api-data/Data/query_data',
    method: 'post',
    data
  });
}

/**
 * 数据查询 - 情绪股
 * @returns 市场总览
 */
export function PostDataQueryEmo<T = { items: TypedAny[]; table_name: string }>(data?: AiParams) {
  return requestMain<T>({
    url: '/api-data/Data/query_emo',
    method: 'post',
    data
  });
}

/**
 * 数据查询 - 大庄数据
 * @returns 市场总览
 */
export function PostDataQueryCtl<T = { items: TypedAny[]; table_name: string }>(data?: AiParams) {
  return requestMain<T>({
    url: '/api-data/Data/query_ctl',
    method: 'post',
    data
  });
}

/**
 * 数据查询 - 平步青云
 * @returns 市场总览
 */
export function PostDataQueryPbqy<T = { items: TypedAny[]; table_name: string }>(data?: AiParams) {
  return requestMain<T>({
    url: '/api-data/Data/query_pbqy',
    method: 'post',
    data
  });
}

/**
 * 数据查询 - 步步高(全部待用户审核数据)
 * @returns 市场总览
 */
export function PostDataQueryBbg<T = { items: TypedAny[]; table_name: string }>(data?: AiParams) {
  return requestMain<T>({
    url: '/api-data/Data/query_bbg',
    method: 'post',
    data
  });
}

/**
 * 数据查询 - 两连板
 * @returns 市场总览
 */
export function PostDataQueryUserSeirsBoard<T = { items: TypedAny[]; table_name: string }>(
  data?: AiParams
) {
  return requestMain<T>({
    url: '/api-data/Data/query_seirs_board',
    method: 'post',
    data
  });
}

/**
 * 数据查询 - 20%涨停板
 * @returns 市场总览
 */
export function PostDataQuerStock20cm<T = { items: TypedAny[]; table_name: string }>(
  data?: AiParams
) {
  return requestMain<T>({
    url: '/api-data/Data/query_stock_20cm',
    method: 'post',
    data
  });
}

/**
 * 获取策略记录列表
 * @returns 策略记录列表
 */
export function PostStrategyRecordList<
  T = {
    items: TypedAny[];
    stocks?: TypedAny[];
    header: string[];
    dates: string[];
    table_name: string;
  }
>(data: { strategy_id: string; select_date?: string }) {
  return requestMain<T>({
    url: '/api-data/Strategy/strategy_record_list',
    method: 'post',
    data
  });
}

export interface PostDataQueryDataParams {
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

export interface RealData {
  // rise_amt: number; // 涨幅金额
  // rise_per: number; // 涨幅%
  // volume: number; // 成交量
  // open: number; // 开盘价
  // lastPrice: number; // 最新价
  // lastClose: number; // 最新收盘价
  real_time: RealTime;
  stock: Stock | null;
  stock_user_set: null | number[];
  today_atack: boolean;
  user_collects: UserCollect[] | null;
  user_readed: boolean | null;
}

/**
 * 获取股票实时数据(新)
 * @returns 股票实时数据
 */
export function GetStockRealtimes<T = Record<string, RealData>>(rows: string[]) {
  return requestMain<T>({
    url: '/api-data/RealTime/stock_realtimes',
    method: 'post',
    data: { rows }
  });
}

/**
 * 获取市场总览 （市场总成交额，总融资）
 * @returns 市场总览
 */
export const GetDataSummary = () => {
  return requestMain<{ total: number; financing: number; trade_date: string }>({
    url: '/api-data/RealTime/summary',
    method: 'get'
  });
};

/**
 * 获取大盘行情
 * @returns 大盘行情
 */
export function GetQuote<T>() {
  return requestMain<T>({
    url: '/api-data/RealTime/quote',
    method: 'get'
  });
}

/**
 * 获取我的自选股分类
 * @returns 我的自选股分类
 */
export function GetUserCategorysV2() {
  return requestMain<CategoryItem[]>({
    url: '/api-data/UserStockV2/userCategorys',
    method: 'get'
  });
}

/**
 * 排序自选股分类
 * @returns 排序自选股分类
 */
export const SortUserCategorysV2 = (rows: CategoryItem[]) => {
  return requestMain<CategoryItem[]>({
    url: '/api-data/UserStockV2/sortCategorys',
    method: 'post',
    data: { rows }
  });
};

/**
 * 编辑自选股分类
 * @returns 编辑自选股分类
 */
export const EditUserCategorysV2 = (data: { name: string; sort?: number }) => {
  return requestMain<CategoryItem>({
    url: '/api-data/UserStockV2/editCategorys',
    method: 'post',
    data
  });
};

/**
 * 删除自选股分类
 * @returns 删除自选股分类
 */
export const DelUserCategorysV2 = (id: string) => {
  return requestMain<CategoryItem>({
    url: '/api-data/UserStockV2/delCategorys',
    method: 'delete',
    params: { id }
  });
};

/**
 * 查询我的自选股
 * @returns 查询我的自选股
 */
export function GetUserStocksV2(data: { key_word?: string; category?: string }) {
  return requestMain<StockInfo[]>({
    url: '/api-data/UserStockV2/userStocks',
    method: 'post',
    data
  });
}

// /**
//  * 股票1分钟线
//  * @returns 股票实时数据
//  */
// export function GetStockKline1M<T>(data: { ts_code: string; date?: string }) {
//   return requestMain<T>({
//     url: '/api-data/StockInfo/kline_1m',
//     method: 'post',
//     data
//   });
// }

/**
 * 股票1分钟线
 * @returns 股票实时数据
 */
export function GetStockKline1M<T>(data: { ts_code: string; date?: string }) {
  return requestMain<T>({
    url: '/api-data/Kline/kline_1m',
    method: 'post',
    data
  });
}

/**
 * 用户批量添加自选股
 * @returns 用户批量添加自选股
 */
export const AddBatchUserStocksV2 = (data: { category: string; ts_codes: string[] }) => {
  return requestMain({
    url: '/api-data/UserStockV2/userAdds',
    method: 'put',
    data
  });
};

/**
 * 用户批量删除自选股
 * @returns 用户批量删除自选股
 */
export const PostBatchDelUserStockV2 = (data: { category: string; ts_codes: string[] }) => {
  return requestMain({
    url: '/api-data/UserStockV2/userDeletes',
    method: 'post',
    data
  });
};

/**
 * 用户移除股票属性
 * @returns 用户移除股票属性
 */
export function PostBatchUserStockSetfRemove<T>(data: { ts_codes: string[]; type: number }) {
  return requestMain<T>({
    url: '/api-data/UserStockSet/remove_stocks',
    method: 'post',
    data
  });
}

/**
 * 用户批量添加股票属性
 * @returns 用户批量添加股票属性
 */
export function PostBatchUserStockSetfAdd<T>(data: { ts_codes: string[]; type: number }) {
  return requestMain<T>({
    url: '/api-data/UserStockSet/add_stocks',
    method: 'post',
    data
  });
}

/**
 * 获取板块列表
 * @returns 板块列表
 */
export function GetIndustryList<T>() {
  return requestMain<T>({
    url: '/api-data/Industry/industrys',
    method: 'get'
  });
}

/**
 * 获取行业成员列表
 * @returns 行业成员列表
 */
export function GetIndustryMembers<T>(con_code: string) {
  return requestMain<T>({
    url: '/api-data/Industry/industry_members',
    method: 'get',
    params: { con_code }
  });
}

/**
 * 批量标记为已读
 * @returns 批量标记为已读
 */
export function PostAddReaded<T>(data: { table_name: string; ts_codes: string[] }) {
  return requestMain<T>({
    url: '/api-data/UserStockStatus/add_readed',
    method: 'post',
    data
  });
}

/**
 * 移出量化
 * @returns 移出量化
 */
export function PostUserStockStatusDels<T>(data: { table_name: string; ts_codes: string[] }) {
  return requestMain<T>({
    url: '/api-data/UserStockStatus/add_dels',
    method: 'post',
    data
  });
}

export interface Permission {
  id: string;
  role_id: string;
  model_name: string;
  permission_type: number;
  permission_columns: string;
  permission_columns_list: string[];
}

/**
 * 获取用户股票权限
 * @returns 用户股票权限
 */
export function GetMyPermission<T = Permission[]>() {
  return requestMain<T>({
    url: '/api-data/UserStockPermission/my_permisstion',
    method: 'get'
  });
}

/**
 * 用户添加股票
 * @returns 用户添加股票
 */
export function PostUserStockSetfAdd<T>(data: { ts_code: string; type: number }) {
  return requestMain<T>({
    url: '/api-data/UserStockSet/add_stock',
    method: 'post',
    data
  });
}

/**
 * 用户移除股票
 * @returns 用户移除股票
 */
export function PostUserStockSetfRemove<T>(data: { ts_code: string; type: number }) {
  return requestMain<T>({
    url: '/api-data/UserStockSet/remove_stock',
    method: 'post',
    data
  });
}
