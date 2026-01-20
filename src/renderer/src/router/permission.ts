import { token } from '@renderer/core/storage';
import { useTitle } from '@renderer/lib/title';
import { $t } from '@renderer/locales';
import { store } from '@renderer/store';
import { useUserInfo } from '@renderer/store/modules/user';
import TopBar from 'topbar';
import type { Router } from 'vue-router';
// import { initBackEndControlRoutes } from './backEnd';
// import { initFrontEndControlRoutes } from './frontEnd';
// import { sleep } from '@wade/utils';

// 颜色
TopBar.config({
  barColors: {
    0: 'rgba(206,  0, 98, .5)',
    '.25': 'rgba(52,  152, 219, .9)',
    '.50': 'rgba(241, 196, 15,  .9)',
    '.75': 'rgba(230, 126, 34,  .9)',
    '1.0': 'rgba(206,  0, 98, .9)'
  }
});

// const routeItems = [];
// const isRequestRoutes = false;

/**
 * 权限控制
 * @param router
 */
export const usePermission = (router: Router) => {
  // 白名单
  const whiteList = ['/login', '/error'];
  const { addTagView } = useUserInfo(store);

  // 路由加载前
  router.beforeEach(async (to, _from, next) => {
    // 显示进度条
    TopBar.show();

    // 设置title
    useTitle($t(String(to.meta?.title)));

    if (whiteList.includes(to.path)) {
      next();
    } else if (token.value) {
      addTagView(to);
      // 是否有菜单否则去加载。
      // if (!routeItems.length) {
      //   // 权限控制路由：提供两种方案，选一个即可。
      //   if (isRequestRoutes) {
      //     // 1.后端控制路由：路由数据初始化，防止刷新时丢失
      //     await initBackEndControlRoutes();
      //   } else {
      //     // 2.后端控制路由：路由数据初始化，防止刷新时丢失
      //     await initFrontEndControlRoutes();
      //   }
      // }

      // 小小延迟一下。(领导书这里不能太快了，需要为甲方后续升级系统速度做准备。)
      // await sleep(500);

      // 加载结束再进入页面
      next();
    } else {
      // 未授权
      next({
        path: '/login',
        query: { ...to.query, redirect: to.path }
      });
    }
  });

  // 路由加载后
  router.afterEach(() => {
    TopBar.hide();
  });
};
