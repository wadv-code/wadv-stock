import { ElectronAPI } from '@electron-toolkit/preload';
import { UpdateCheckResult } from 'electron-updater';

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
  // 获取本地主程序版本号
  getAppVersion: () => Promise<string>;
  // 检查更新
  checkForUpdates: () => Promise<UpdateCheckResult | null>;
  // 开始下载更新
  downloadUpdate: () => Promise<any>;
  // 开始安装
  quitAndInstall: () => Promise<any>;
  // 更新进度相关
  onUpdateProgress: (callback: (progress: UpdateProgress) => void) => void;
  // 移除更新进度相关
  removeUpdateProgressListener: () => void;
  // 下载结束
  onUpdateDownloaded: (callback: () => void) => void;
  // 发送通知
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
