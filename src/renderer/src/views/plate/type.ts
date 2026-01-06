export type Industry = {
  _id: string;
  close: number;
  close_price: number;
  company_num: number;
  con_code: string;
  industry: string;
  lead_stock: string;
  net_amount: number;
  net_buy_amount: number;
  net_sell_amount: number;
  pct_change: number;
  pct_change_stock: number;
  trade_date: string;
  limit_up_count: number;
};

export interface IndustryMember {
  _id: string;
  con_code: string;
  name: string;
  source_con_code: string;
  ts_code: string;
}
