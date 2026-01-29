import { ElectronAPI } from '@electron-toolkit/preload';
// import { UpdateInfo } from 'electron-updater';

// 进度对象类型
declare interface UpdateProgress {
  percent: number;
  bytesPerSecond: number;
  total: number;
  transferred: number;
  [key: string]: any;
}

export interface CheckForDataReturn<T = TypedAny> {
  code: number;
  msg: string;
  data: T;
}

// 自定义 API 接口
interface CustomAPI {
  // 获取本地主程序版本号
  getAppVersion: () => Promise<string>;
  // 检查更新
  checkForUpdates: () => Promise<CheckForDataReturn>;
  // 开始下载更新
  downloadUpdate: () => Promise<any>;
  // 开始安装
  quitAndInstall: () => Promise<any>;
  // 更新进度相关
  onUpdateProgress: (callback: (progress: UpdateProgress) => void) => void;
  // 更新可用监听 API
  onUpdateAvailable: (callback: (option: CheckForDataReturn<UpdateInfo>) => void) => void;
  // 新增：没有新版本监听 API
  onUpdateNotAvailable: (callback: (option: CheckForDataReturn<UpdateInfo>) => void) => void;
  // 下载结束
  onUpdateDownloaded: (callback: () => void) => void;
  // 发送通知
  sendSystemNotification: (
    title: string,
    body: string,
    options?: Electron.NotificationConstructorOptions
  ) => Promise<boolean>;

  storage: {
    getItem: (key: string) => Promise<string | null>;
    setItem: (key: string, value: any) => Promise<void>;
    removeItem: (key: string) => Promise<void>;
  };

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
