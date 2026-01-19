import { contextBridge, ipcRenderer } from 'electron';
import { electronAPI } from '@electron-toolkit/preload';

// Custom APIs for renderer
const api = {
  // 更新进度监听相关 API
  onUpdateProgress: (callback: (progress: any) => void) => {
    // 先移除之前的监听器，避免重复
    ipcRenderer.removeAllListeners('update-progress');
    ipcRenderer.on('update-progress', (_, progress) => callback(progress));
  },

  removeUpdateProgressListener: () => {
    ipcRenderer.removeAllListeners('update-progress');
  },

  // 新增：发送系统通知的 API
  sendSystemNotification: (
    title: string,
    body: string,
    options?: Electron.NotificationConstructorOptions
  ) => {
    return ipcRenderer.invoke('send-system-notification', title, body, options);
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
