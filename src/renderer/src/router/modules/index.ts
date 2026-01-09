import LayoutView from '@/layout/LayoutView.vue';
import {
  ChartLine,
  HeartPulse,
  ChartArea,
  ArrowUpNarrowWide,
  ClipboardList
} from 'lucide-vue-next';

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
      // {
      //   path: '/',
      //   name: 'home',
      //   component: () => import('@/views/home/HomeView.vue'),
      //   meta: {
      //     title: 'menu.home',
      //     icon: Home
      //   }
      // },
      {
        path: '/',
        name: 'self',
        component: () => import('@/views/self/SelfView.vue'),
        meta: {
          title: 'menu.self',
          hide: false,
          icon: HeartPulse
        }
      },
      {
        path: '/ai',
        name: 'ai',
        component: () => import('@/views/ai/AiView.vue'),
        meta: {
          title: 'menu.quantify',
          hide: false,
          icon: ChartArea
        }
      },
      {
        path: '/monitor',
        name: 'monitor',
        component: () => import('@/views/monitor/MonitorView.vue'),
        meta: {
          title: 'menu.monitor',
          icon: ChartLine
        }
      },
      {
        path: '/plate',
        name: 'plate',
        component: () => import('@/views/plate/PlateView.vue'),
        meta: {
          title: 'menu.plate',
          icon: ArrowUpNarrowWide
        }
      },
      {
        path: '/stock',
        name: 'stock',
        component: () => import('@/views/stock/StockView.vue'),
        meta: {
          title: 'menu.stock',
          hide: true,
          icon: ClipboardList
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
