import { ElectronAPI } from '@electron-toolkit/preload';

// 进度对象类型
export interface UpdateProgress {
  percent: number;
  bytesPerSecond: number;
  total: number;
  transferred: number;
  [key: string]: any;
}

// 自定义 API 接口
interface CustomAPI {
  // 更新进度相关
  onUpdateProgress: (callback: (progress: UpdateProgress) => void) => void;
  removeUpdateProgressListener: () => void;
  sendSystemNotification: (
    title: string,
    body: string,
    options?: Electron.NotificationConstructorOptions
  ) => Promise<boolean>;

  // 其他可扩展的 API...
  // checkForUpdates: () => Promise<any>;
  // downloadUpdate: () => Promise<void>;
  // quitAndInstall: () => Promise<void>;
}

declare global {
  interface Window {
    electron: ElectronAPI;
    api: CustomAPI; // 更新类型为 CustomAPI
  }
}
