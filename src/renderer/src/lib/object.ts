/**
 * 通过链式路径获取对象的值
 * @param obj 要获取值的对象
 * @param path 链式路径，支持字符串形式('a.b.c')或数组形式(['a', 'b', 'c'])
 * @param defaultValue 路径不存在时返回的默认值
 * @returns 路径对应的 value 或 defaultValue
 */
export function getObjectValue<T = any>(obj: any, path: string | string[], defaultValue?: T): T {
  // 处理空对象的情况
  if (!obj || typeof obj !== 'object') {
    return defaultValue as T;
  }

  // 将路径统一转为数组形式
  const pathArray = Array.isArray(path) ? path : path.split('.').filter((key) => key); // 过滤空字符串

  // 递归获取值
  const getValue = (currentObj: T, keys: string[]): any => {
    // 如果没有更多键，返回当前对象
    if (keys.length === 0) {
      return currentObj;
    }

    const [currentKey, ...remainingKeys] = keys;
    // 如果当前对象不包含当前键，返回默认值
    if (!Object.prototype.hasOwnProperty.call(currentObj, currentKey)) {
      return defaultValue;
    }

    const value = currentObj[currentKey as keyof T];

    // 如果还有剩余键且当前值是对象，继续递归
    if (remainingKeys.length > 0 && value && typeof value === 'object') {
      return getValue(value as T, remainingKeys);
    }
    // 如果还有剩余键但当前值不是对象，说明路径不存在
    else if (remainingKeys.length > 0) {
      return defaultValue;
    }

    // 没有剩余键了，返回当前值
    return value;
  };

  const result = getValue(obj, pathArray);

  // 如果结果是 undefined 且提供了默认值，返回默认值
  return (result === undefined ? defaultValue : result) as T;
}
