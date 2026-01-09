export const TokenKey = 'Authorization';

export const stock_user_set = [
  { name: '自', value: 0, className: 'bg-orange-500' },
  { name: '攻', value: 1, className: 'bg-red-500' },
  { name: '步', value: 2, className: 'bg-green-500' },
  { name: '买', value: 10, className: 'bg-green-500' },
  { name: '持', value: 20, className: 'bg-blue-500' }
];

export const defaultStockInfo: () => StockInfo = () => ({
  id: '',
  total_market_value: 0,
  unlimit_market_value: 0,
  stock: {
    _id: '',
    ts_code: '',
    symbol: 0,
    name: '加载中...',
    area: '',
    industry: '',
    concepts: '',
    plate: '',
    total_shares: 0,
    unlimit_shares: 0,
    stock_user_set: []
  },
  real_time: {
    ts_code: '',
    rise_per: 0,
    rise_amt: 0,
    time: 0,
    timetag: '',
    lastPrice: 0,
    open: 0,
    high: 0,
    low: 0,
    lastClose: 0,
    amount: 0,
    volume: 0,
    pvolume: 0,
    stockStatus: 0,
    openInt: 0,
    settlementPrice: 0,
    lastSettlementPrice: 0,
    askPrice: [],
    bidPrice: [],
    askVol: [],
    bidVol: [],
    chg: 0
  },
  user_collects: [],
  build_break: {
    red: [],
    green: []
  },
  atacks: [],
  isChanged: 'none'
});
