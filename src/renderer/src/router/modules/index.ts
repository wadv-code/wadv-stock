import LayoutView from '@/layout/LayoutView.vue';
import { Home, ChartLine, HeartPulse, ChartArea } from 'lucide-vue-next';

/**
 * 定义404、401界面
 */
export const notFoundView = [
  {
    path: '/:path(.*)*',
    name: 'notFound',
    component: () => import('@/views/error/ErrorNotFound.vue'),
    meta: {
      title: '404',
      hide: true
    }
  },
  {
    path: '/401',
    name: 'noPower',
    component: () => import('@/views/error/ErrorNotPower.vue'),
    meta: {
      title: '401',
      hide: true
    }
  }
];

export const routes = [
  {
    redirect: '/',
    path: '/',
    name: 'layout',
    component: LayoutView,
    children: [
      ...notFoundView,
      {
        path: '/',
        name: 'home',
        component: () => import('@/views/home/HomeView.vue'),
        meta: {
          title: 'menu.home',
          hide: true,
          icon: Home
        }
      },
      {
        path: '/self',
        name: 'self',
        component: () => import('@/views/self/SelfView.vue'),
        meta: {
          title: 'menu.self',
          hide: true,
          icon: HeartPulse
        }
      },
      {
        path: '/quantify',
        name: 'quantify',
        component: () => import('@/views/quantify/QuantifyView.vue'),
        meta: {
          title: 'menu.quantify',
          hide: true,
          icon: ChartArea
        }
      },
      {
        path: '/monitor',
        name: 'monitor',
        component: () => import('@/views/monitor/MonitorView.vue'),
        meta: {
          title: 'menu.monitor',
          hide: true,
          icon: ChartLine
        }
      }
    ]
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/login/LoginView.vue'),
    meta: {
      title: '登录',
      hide: true
    }
  }
];
