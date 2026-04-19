export const TokenKey = 'Authorization';

export const stock_user_set = [
  { name: '自', value: 0, className: 'bg-orange-500' },
  { name: '攻', value: 1, className: 'bg-red-500' },
  { name: '步', value: 2, className: 'bg-green-500' },
  { name: '买', value: 10, className: 'bg-green-500' },
  { name: '持', value: 20, className: 'bg-blue-500' }
];

export function defaultStockInfo(): StockInfo {
  return {
    build_break: {
      red: [],
      green: []
    },
    position_ctl: null,
    strategys: [],
    stock: {
      ts_code: '',
      symbol: 600300,
      name: '维维股份',
      area: '江苏',
      industry: '软饮料',
      concepts: '抖音小店,乳业,央国企改革,生态农业,电商概念,婴童概念,创投',
      plate: '上海主板',
      total_shares: 1617142180,
      total_market_value: 6112797440.4,
      unlimit_shares: 1617142180,
      unlimit_market_value: 6112797440.4,
      py_first_letter: 'wwgf'
    },
    real_time: {
      ts_code: '600300.SH',
      chg: null,
      time: 1773644403000,
      timetag: '20260316 15:00:03',
      lastPrice: 3.78,
      open: 3.74,
      high: 3.83,
      low: 3.74,
      lastClose: 3.75,
      amount: 159542900,
      volume: 422135,
      rise_per: 0.8,
      rise_amt: 0.03
    },
    today_atack: false,
    stock_user_set: undefined,
    user_readed: false,
    user_collects: [],
    attribute: 0,
    isChanged: 'none'
  };
}
