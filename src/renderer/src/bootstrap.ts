import { createApp } from 'vue';
import App from './App.vue';
import { router } from './router';
import { store } from './store';
import '@/styles/app.css';
import { version } from '@/core/storage';
import { setupI18n } from './locales';
import { Local } from './core/win-storage';

async function bootstrap() {
  const app = createApp(App);

  // 国际化 i18n 配置
  await setupI18n(app, { defaultLocale: Local.get('locale') || 'zh-CN' });

  // // 注册自定义主题
  // echarts.registerTheme('walden', theme);

  // 当前版本号
  // @ts-ignore
  version.value = __APP_VERSION__;

  // 配置 pinia
  app.use(store);

  // 路由
  app.use(router);

  // 挂载
  app.mount('#app');
}

export { bootstrap };
