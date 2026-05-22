/**
 * 获取涨跌幅颜色类名
 * @param info
 * @returns
 */
export const getRiseClassName = (info?: StockInfo) => {
  const rise_amt = info?.real_time?.rise_amt || 0;
  if (rise_amt > 0) {
    return 'text-red-500';
  } else if (rise_amt < 0) {
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

import { formatDate } from 'date-fns';
import { KLineData } from 'klinecharts';

/**
 * 执行脚本
 * @param item 数据项
 * @param field 字段
 */
export function executeScriptFunc(item: StrategyRecordItem, scriptFields: StrategyRecordField[]) {
  try {
    for (const field of scriptFields) {
      const scripts = ` return ${field.scripts || ''}`;
      const func = new Function('item', 'results', scripts);
      item.values[field.name] = func(item, item.values);
    }
  } catch (error) {
    return undefined;
  }
}

/**
 * 格式化字段值
 * @param item 数据项
 * @param fields 字段
 */
export function formatFieldValues(
  item: StrategyRecordItem,
  fields: StrategyRecordField[],
  isBuild: boolean = false
) {
  const values = item.values;
  for (const field of fields) {
    const dataType = field.dataType || '';
    const d_places = field.d_places;
    const value = isBuild ? item[field.name] : item.values[field.name] || '';
    if (dataType === 'array.date') {
      values[field.name] = value
        ? (value || []).map((v: string) => formatDate(new Date(v), 'yyyy-MM-dd'))
        : '';
    } else if (dataType === 'array') {
      values[field.name] = (value || []).join(',');
    } else if (dataType === 'date') {
      values[field.name] = value ? formatDate(new Date(value), 'yyyy-MM-dd') : '';
    } else if (dataType === 'number') {
      if (typeof value === 'number' && d_places) {
        values[field.name] = value.toFixed(d_places);
      } else {
        values[field.name] = value;
      }
    } else {
      values[field.name] = value;
    }
  }
}

/**
 * 获取上一个交易日的数据
 * @param dataList KLineData 数组
 * @param currentItem 当前数据项
 * @param key 用于比较的键名，默认 'timestamp'
 * @returns 上一个交易日的数据，如果不存在则返回 undefined
 */
export function getPreviousTradingDay(
  dataList: KLineData[],
  currentItem: KLineData,
  key: keyof KLineData = 'timestamp'
): KLineData | undefined {
  // 1. 校验入参
  if (!dataList.length || !currentItem) {
    return undefined;
  }

  // 2. 获取当前项的 key 值
  const currentValue = currentItem[key];
  if (currentValue === undefined || currentValue === null) {
    return undefined;
  }

  // 3. 过滤并排序：找出所有 key 值小于当前值的数据
  const sortedList = dataList
    .filter((item) => {
      const itemValue = item[key];
      return itemValue !== undefined && itemValue !== null && itemValue < currentValue;
    })
    .sort((a, b) => {
      const valA = a[key] as number;
      const valB = b[key] as number;
      return valB - valA; // 降序排列，最大的排在前面
    });

  // 4. 返回排序后的第一个（即最接近当前项的上一个交易日）
  return sortedList.length > 0 ? sortedList[0] : undefined;
}

/**
 * 获取下一个交易日的数据
 * @param dataList KLineData 数组
 * @param currentItem 当前数据项
 * @param key 用于比较的键名，默认 'timestamp'
 * @returns 下一个交易日的数据，如果不存在则返回 undefined
 */
export function getNextTradingDay(
  dataList: KLineData[],
  currentItem: KLineData,
  key: keyof KLineData = 'timestamp'
): KLineData | undefined {
  // 1. 校验入参
  if (!dataList.length || !currentItem) {
    return undefined;
  }

  // 2. 获取当前项的 key 值
  const currentValue = currentItem[key];
  if (currentValue === undefined || currentValue === null) {
    return undefined;
  }

  // 3. 过滤并排序：找出所有 key 值大于当前值的数据
  const sortedList = dataList
    .filter((item) => {
      const itemValue = item[key];
      return itemValue !== undefined && itemValue !== null && itemValue > currentValue;
    })
    .sort((a, b) => {
      const valA = a[key] as number;
      const valB = b[key] as number;
      return valA - valB; // 升序排列，最小的排在前面
    });

  // 4. 返回排序后的第一个（即最接近当前项的下一个交易日）
  return sortedList.length > 0 ? sortedList[0] : undefined;
}
