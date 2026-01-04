import { userInfo } from '@renderer/core/storage';
import { defaultUserInfo } from '@renderer/core/storageDefaults';
import { Session } from '@renderer/core/win-storage';
import { defineStore } from 'pinia';

/**
 * 用户信息
 * @methods getUserInfo 获取用户信息
 */
export const useUserInfo = defineStore('user', {
  state: (): UserState => ({
    userInfo: userInfo.value || defaultUserInfo,
    username: Session.get('username')
  }),
  actions: {}
});
