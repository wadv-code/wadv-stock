import { userInfo } from '@renderer/core/storage';
import { defaultUserInfo } from '@renderer/core/storageDefaults';
import { Session } from '@renderer/core/win-storage';
import { defineStore } from 'pinia';
import { RouteLocationNormalizedLoadedGeneric } from 'vue-router';

/**
 * 用户信息
 * @methods getUserInfo 获取用户信息
 */
export const useUserInfo = defineStore('user', {
  state: (): UserState => ({
    userInfo: userInfo.value || defaultUserInfo,
    username: Session.get('username'),
    tagViews: []
  }),
  actions: {
    addTagView(view: RouteLocationNormalizedLoadedGeneric) {
      // 过滤掉重复的路由
      if (this.tagViews.some((item) => item.fullPath === view.fullPath)) {
        return;
      }
      this.tagViews.push(view);
    },
    delTagView(view: RouteLocationNormalizedLoadedGeneric) {
      this.tagViews = this.tagViews.filter((item) => item.fullPath !== view.fullPath);
    },
    setTagViewName(view: RouteLocationNormalizedLoadedGeneric, name: string) {
      const route = this.tagViews.find((item) => item.fullPath === view.fullPath);
      if (route) {
        route.meta.title = name;
      }
    }
  }
});
