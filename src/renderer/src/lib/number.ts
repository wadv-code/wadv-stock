/**
 * 金额单位转换工具
 * 将以元为单位的金额转换为带单位的易读格式（如：千、万、亿）
 * @param amount 金额（元）
 * @param decimalPlaces 保留的小数位数，默认2位
 * @returns 格式化后的金额字符串
 */
export function convertAmountUnit(amount: number = 0, decimalPlaces: number = 2): string {
  // 处理非数字和负数情况
  if (isNaN(amount)) {
    return String(amount);
  }

  // 处理非数字和负数情况
  if (amount === null) {
    return '';
  }

  // 定义单位和对应的换算比例
  const units = [
    { unit: '万亿', ratio: 1000000000000 },
    { unit: '亿', ratio: 100000000 },
    { unit: '万', ratio: 10000 },
    { unit: '千', ratio: 1000 },
    { unit: '', ratio: 1 } // 无单位（元）
  ];

  // 找到合适的单位
  for (const { unit, ratio } of units) {
    if (amount >= ratio) {
      const converted = amount / ratio;
      // 四舍五入到指定小数位并格式化
      return `${converted.toFixed(decimalPlaces)}${unit}`;
    }
  }

  // 对于小于1元的金额，直接保留指定小数位
  return amount.toFixed(decimalPlaces);
}

/**
 * 金额单位转换的扩展方法，支持更多配置
 * @param amount 金额（元）
 * @param options 配置选项
 * @returns 格式化后的金额字符串
 */
export function formatAmount(
  amount: number,
  options: {
    decimalPlaces?: number;
    showZero?: boolean;
    unitMap?: { [key: string]: string };
  } = {}
): string {
  const {
    decimalPlaces = 2,
    showZero = true,
    unitMap = { 亿: '亿', 万: '万', 千: '千', '': '' }
  } = options;

  // 处理0的情况
  if (amount === 0 && !showZero) {
    return '';
  }

  // 使用基础转换方法
  let result = convertAmountUnit(amount, decimalPlaces);

  // 替换单位（如果有自定义单位映射）
  for (const [originalUnit, customUnit] of Object.entries(unitMap)) {
    if (result.endsWith(originalUnit)) {
      result = result.replace(originalUnit, customUnit);
      break;
    }
  }

  return result;
}

/**
 * 金额单位转换函数
 * @param amount 原始金额（以元为单位）
 * @param decimalPlaces 保留的小数位数，默认2位
 * @returns 包含转换后的金额和单位的对象
 */
export function convertAmount(
  amount: number,
  decimalPlaces: number = 2
): { value: number; unit: string } {
  // 定义单位和对应的换算比例
  const units = [
    { unit: '', ratio: 1 },
    // { unit: "千", ratio: 1000 },
    { unit: '万', ratio: 10000 },
    // { unit: "十万", ratio: 100000 },
    // { unit: "百万", ratio: 1000000 },
    // { unit: "千万", ratio: 10000000 },
    { unit: '亿', ratio: 100000000 },
    // { unit: "十亿", ratio: 1000000000 },
    // { unit: "百亿", ratio: 10000000000 },
    // { unit: "千亿", ratio: 100000000000 },
    { unit: '万亿', ratio: 1000000000000 }
  ];

  // 处理负数情况
  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);

  // 找到最合适的单位
  let selectedUnit = units[0];
  for (const unit of units) {
    if (absAmount >= unit.ratio * 10) {
      // 当金额大于等于单位的10倍时，使用更大的单位
      selectedUnit = unit;
    } else {
      break;
    }
  }

  if (!selectedUnit) {
    return { value: amount, unit: '' };
  }

  // 计算转换后的值并保留指定的小数位数
  const convertedValue = Number((absAmount / selectedUnit.ratio).toFixed(decimalPlaces));

  return {
    value: isNegative ? -convertedValue : convertedValue,
    unit: selectedUnit.unit
  };
}
// 假设 real_price 是实时价，lastClose 是昨日收盘价
export function calculateChangePercent(real_price: number = 0, lastClose: number = 0) {
  // 避免除以 0 的情况（理论上昨日收盘价不为 0）
  if (lastClose === 0) return '';

  // 计算涨跌幅百分比（保留两位小数）
  const percent = ((real_price - lastClose) / lastClose) * 100;
  return percent.toFixed(2); // 四舍五入保留两位小数
}

// 进度
export function calculatePercent(real_price: number = 0, lastPrice: number = 0) {
  // 避免除以 0 的情况（理论上昨日收盘价不为 0）
  if (!lastPrice) return '';

  // 计算涨跌幅百分比（保留两位小数）
  return ((real_price / lastPrice) * 100).toFixed(2); // 四舍五入保留两位小数
}

/**
 * 计算并格式化金额百分比
 * @param real_price
 * @param tar_price
 * @returns
 */
export function formatPercent(real_price: number = 0, tar_price: number = 0) {
  return tar_price ? `${parseFloat(((real_price / tar_price) * 100).toFixed(2))}%` : '';
}

/**
 * 计算并格式化金额百分比
 * @param real_price
 * @param tar_price
 * @returns
 */
export function formatPercentNumber(real_price: number = 0, tar_price: number = 0) {
  return tar_price ? parseFloat(((real_price / tar_price) * 100).toFixed(2)) : undefined;
}

/**
 * 加后缀%
 * @param amount
 * @returns
 */
export function suffixPercent(amount?: number) {
  return amount ? `${amount.toFixed(2)}%` : '';
}

/**
 * 金额格式化
 * @param price
 * @param decimalPlaces
 * @returns
 */
export function formatToFixed(price: number = 0, decimalPlaces: number = 2) {
  return price.toFixed(decimalPlaces);
}
