import { requestMain } from '@renderer/lib/http';

/**
 * 获取Redis对象
 * @returns 获取Redis对象
 */
export const GetCache = <T>(key: string) => {
  return requestMain<T>({
    url: `/api-base/Redis/get_cache/${key}`,
    method: 'GET'
  });
};

/**
 * 获取Redis对象
 * @returns 获取Redis对象
 */
export const SaveCache = <T>(data: object) => {
  return requestMain<T>({
    url: `/api-base/Redis/set_cache`,
    method: 'POST',
    data
  });
};

/**
 * 删除Redis对象
 * @returns 删除Redis对象
 */
export const DelelteCache = <T>(key: string) => {
  return requestMain<T>({
    url: `/api-base/Redis/clear_key/${key}`,
    method: 'DELETE'
  });
};
