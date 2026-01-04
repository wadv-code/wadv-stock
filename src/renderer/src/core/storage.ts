import { useLocalStorage } from '@vueuse/core';
import { defaultUserInfo } from './storageDefaults';

/**
 * 根据环境设置 storage key
 * @param key
 */
export function getStorageKey(key: string): string {
  if (key === 'token') return key;
  return `core:${key}`;
}

/**
 * 用户token
 */
export const token = useLocalStorage<string | null>(getStorageKey('token'), null);

/**
 * 当前系统版本
 */
export const version = useLocalStorage<string | null>(getStorageKey('version'), null);

/**
 * 用户信息
 */
export const userInfo = useLocalStorage<UserInfo>(getStorageKey('userInfo'), defaultUserInfo);
