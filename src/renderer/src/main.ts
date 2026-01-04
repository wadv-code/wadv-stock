// import { createApp } from "vue";
// import "./style.css";
// import App from "./App.vue";

// createApp(App).mount("#app");
async function initApplication() {
  // loading
  // startGlobalLoading();
  // 启动应用并挂载
  // vue应用主要逻辑及视图
  const { bootstrap } = await import('@/bootstrap');

  await bootstrap();

  // 移除并销毁loading
  // unmountGlobalLoading();
}

initApplication();
