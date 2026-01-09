/**
 * 交换位置
 * @param arr
 * @param index1
 * @param index2
 */
export function swapArrayElements<T>(arr: T[], index1: number, index2: number) {
  arr[index1] = arr.splice(index2, 1, arr[index1])[0];
  return arr;
}
