/**
 * 获取涨跌幅颜色类名
 * @param info
 * @returns
 */
export const getRiseClassName = (info: StockInfo) => {
  if (info.real_time.rise_amt > 0) {
    return 'text-red-500';
  } else if (info.real_time.rise_amt < 0) {
    return 'text-green-500';
  }
  return '';
};


/**
 * 获取字符串最后两位（中文或英文）
 * @param name
 * @returns
 */
export const getInitials = (name: string): string => {
  if (!name) return '??';
  const trimmedName = name.trim();
  if (trimmedName.length <= 2) {
    return trimmedName.toUpperCase();
  }
  return trimmedName.slice(-2).toUpperCase();
};
