/**
 * 生成一个用不重复的UUID
 */
export function makeUuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * 生成一个用不重复的普通32位ID
 */
export function makeId(): string {
  return 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * 生成一个年开头的十位数数字
 */
export function makeYearNumberToString(): string {
  const currentYear = new Date().getFullYear();
  const randomDigits = makeNumber();
  return currentYear + randomDigits;
}

/**
 * 生成一个6数字字符串
 * @returns
 */
export function makeNumber(): string {
  const min = 100000;
  const max = 999999;
  return Math.floor(Math.random() * (max - min + 1) + min).toString();
}
