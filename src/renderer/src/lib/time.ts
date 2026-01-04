import { KLineData } from 'klinecharts';

/**
 * 等待时间
 * @param wait
 * @returns
 */
export const sleep = async (wait = 2000) => {
  return new Promise((resolve) => setTimeout(resolve, wait));
};

/**
 * 找到数组中日期最接近且大于等于目标日期的对象
 * @param dateList 包含日期字段的对象数组
 * @param targetDate 目标日期（字符串格式，如 '2012-12-03'）
 * @returns 匹配的日期对象 | undefined（无匹配时）
 */
export function findClosestDate(dateList: KLineData[], targetDate: string): KLineData | undefined {
  // 1. 校验入参合法性
  if (!dateList.length) return undefined;

  const targetTime = new Date(targetDate).getTime();
  if (isNaN(targetTime)) {
    throw new Error(`目标日期格式错误：${targetDate}，请使用 YYYY-MM-DD 格式`);
  }

  // 2. 预处理数组：过滤有效日期 + 计算时间戳 + 排序
  const validDateItems = dateList
    .map((item) => {
      const time = new Date(item.timestamp).getTime();
      return { ...item, time };
    })
    .filter((item) => !isNaN(item.time)) // 过滤无效日期
    .sort((a, b) => a.time - b.time); // 按时间升序排序

  if (!validDateItems.length) return undefined;

  // 3. 查找最接近且大于等于目标日期的项
  // 先找第一个大于等于目标时间的项
  const matchItem = validDateItems.find((item) => item.time >= targetTime);

  // 如果没有找到（所有日期都小于目标日期），返回最后一个（最大的日期）
  const resultItem = matchItem || validDateItems[validDateItems.length - 1];

  // 4. 返回原始格式的对象（剔除临时的time字段）
  return resultItem;
}

/**
 * 判断当前时间是否在指定时间段（09:20 - 15:20）内
 * @returns boolean - 在时间段内返回 true，否则返回 false
 */
export function isTimeInRange(): boolean {
  // 获取当前时间对象
  const now = new Date();

  // 提取当前小时和分钟
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();

  // 计算当前时间的总分钟数（便于比较）
  const currentTotalMinutes = currentHour * 60 + currentMinute;

  // 定义时间段的起止分钟数
  const startHour = 9;
  const startMinute = 20;
  const endHour = 15;
  const endMinute = 20;

  const startTotalMinutes = startHour * 60 + startMinute; // 9*60+20 = 560
  const endTotalMinutes = endHour * 60 + endMinute; // 15*60+20 = 920

  // 比较当前时间是否在区间内（包含边界值）
  return currentTotalMinutes >= startTotalMinutes && currentTotalMinutes <= endTotalMinutes;
}
