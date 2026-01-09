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

/**
 * 通过链式路径给对象赋值（路径不存在则自动创建嵌套对象）
 * @param obj 要赋值的目标对象
 * @param path 链式路径，支持字符串形式('a.b.c')或数组形式(['a', 'b', 'c'])
 * @param value 要设置的值
 * @returns 赋值后的原对象（方便链式调用）
 */
export function setObjectValue<T = any>(obj: T, path: string | string[], value: any): any {
  // 校验目标对象：必须是非空对象/数组，否则抛出错误（避免覆盖原始类型）
  if (!obj || typeof obj !== 'object') {
    throw new Error('目标值必须是对象或数组类型');
  }

  // 将路径统一转为数组形式，并过滤空字符串（避免 '.a..b' 这类无效路径）
  const pathArray = Array.isArray(path) ? path : path.split('.').filter((key) => key);

  // 空路径直接返回原对象（无意义的赋值）
  if (pathArray.length === 0) {
    return obj;
  }

  // 递归创建路径并赋值
  const setValue = (currentObj: any, keys: string[]): void => {
    const [currentKey, ...remainingKeys] = keys;

    // 最后一个键：直接赋值
    if (remainingKeys.length === 0) {
      currentObj[currentKey] = value;
      return;
    }

    // 路径不存在时，自动创建空对象（若当前键对应的值不是对象）
    if (
      !Object.prototype.hasOwnProperty.call(currentObj, currentKey) ||
      typeof currentObj[currentKey] !== 'object' ||
      currentObj[currentKey] === null
    ) {
      // 若剩余键是数字（如 '0'），优先创建数组，否则创建对象
      currentObj[currentKey] = /^\d+$/.test(remainingKeys[0]) ? [] : {};
    }

    // 递归处理剩余路径
    setValue(currentObj[currentKey], remainingKeys);
  };

  // 执行赋值逻辑
  setValue(obj, pathArray);

  // 返回原对象（方便链式操作）
  return obj;
}
