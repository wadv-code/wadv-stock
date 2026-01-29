import { resolve } from 'path';
import { defineConfig, externalizeDepsPlugin, loadEnv } from 'electron-vite';
import vue from '@vitejs/plugin-vue';
import tailwindcss from '@tailwindcss/vite';
// import { readFileSync } from 'fs';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());
  // // https
  // const https = {
  //   key: readFileSync(resolve('localhost+2-key.pem')),
  //   cert: readFileSync(resolve('localhost+2.pem'))
  // };
  return {
    main: {
      plugins: [externalizeDepsPlugin()]
    },
    preload: {
      plugins: [externalizeDepsPlugin()]
    },
    renderer: {
      resolve: {
        alias: {
          '@renderer': resolve('src/renderer/src'),
          '@': resolve('src/renderer/src')
        }
      },
      plugins: [
        vue({
          template: {
            compilerOptions: {
              // 告诉 Vue 编译器：webview 是原生自定义元素，无需解析
              isCustomElement: (tag) => tag === 'webview'
            }
          }
        }),
        tailwindcss()
      ],
      server: {
        port: 5173,
        // https,
        proxy: {
          '/api': {
            target: env.VITE_API_BASE_URL,
            changeOrigin: true,
            secure: false
          }
        }
      },
      define: {
        __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
        __APP_NAME__: JSON.stringify(env.VITE_APP_NAME),
        __VIEW_ENV__: JSON.stringify(process.env.VIEW_ENV),
        __STORAGE_SECRET__: JSON.stringify(process.env.VITE_STORAGE_SECRET)
      }
    }
  };
});
