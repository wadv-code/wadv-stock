import { AxiosRequestConfig } from 'axios';
import { toast } from 'vue-sonner';

/**
 * 主程序请求
 * @param options
 * @returns
 */
export async function requestMain<T = any>(options: AxiosRequestConfig) {
  if (options.data) options.data = JSON.stringify(options.data);
  if (options.params) options.params = JSON.stringify(options.params);
  const res = await window.electron.ipcRenderer.invoke('main-request', options);
  const { success, message } = res;
  if (success) {
    return res as { success: true; data: T; message?: string };
  }
  toast.error(message);
  return Promise.reject(JSON.stringify(message) ?? '错误');
}

/**
 * 检查是否有新版本
 * @returns
 */
export async function checkForUpdates() {
  const res = await window.electron.ipcRenderer.invoke('check-for-updates');
  return res;
}

/**
 * 获取主程序版本
 * @returns
 */
export async function getAppVersion() {
  return await window.electron.ipcRenderer.invoke('get-app-version');
}
