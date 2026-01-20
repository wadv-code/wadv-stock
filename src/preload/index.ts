import { contextBridge, ipcRenderer } from 'electron';
import { electronAPI } from '@electron-toolkit/preload';

// Custom APIs for renderer
const api = {
  // 新增：转发更新请求到主进程
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  checkForUpdates: () => ipcRenderer.invoke('check-for-updates'),
  downloadUpdate: () => ipcRenderer.invoke('download-update'),
  quitAndInstall: () => ipcRenderer.invoke('quit-and-install'),
  // 更新进度监听相关 API
  onUpdateProgress: (callback: (progress: any) => void) => {
    // 先移除之前的监听器，避免重复
    ipcRenderer.removeAllListeners('update-progress');
    ipcRenderer.on('update-progress', (_, progress) => callback(progress));
  },

  removeUpdateProgressListener: () => {
    ipcRenderer.removeAllListeners('update-progress');
  },
  // 下载结束
  onUpdateDownloaded: (callback: () => void) => {
    ipcRenderer.removeAllListeners('update-downloaded');
    ipcRenderer.on('update-downloaded', (_) => callback());
  },

  // 新增：发送系统通知的 API
  sendSystemNotification: (
    title: string,
    body: string,
    options?: Electron.NotificationConstructorOptions
  ) => {
    return ipcRenderer.invoke('send-system-notification', title, body, options);
  },
  storage: {
    setItem: (key: string, value: string) => ipcRenderer.invoke('set-item', key, value),
    getItem: (key: string) => ipcRenderer.invoke('get-item', key),
    removeItem: (key: string) => ipcRenderer.invoke('remove-item', key)
  }
};

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI);
    contextBridge.exposeInMainWorld('api', api);
  } catch (error) {
    console.error(error);
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI;
  // @ts-ignore (define in dts)
  window.api = api;
}
