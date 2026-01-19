import { BrowserWindow, ipcMain } from 'electron';
import { autoUpdater, UpdateCheckResult } from 'electron-updater';

export async function useUpdates(mainWindow: BrowserWindow) {
  // 1. 监听渲染层的「检查更新」请求
  ipcMain.handle('check-for-updates', async () => {
    try {
      return (await autoUpdater.checkForUpdates()) as UpdateCheckResult | null;
    } catch (error) {
      return { code: -1, msg: `检查更新失败` };
    }
  });

  // 2. 监听渲染层的「下载更新」请求
  ipcMain.handle('download-update', async () => {
    try {
      await autoUpdater.downloadUpdate();
      return { code: 0, msg: '开始下载更新包' };
    } catch (error) {
      return { code: -1, msg: `下载更新失败` };
    }
  });

  // 3. 监听渲染层的「安装更新并重启」请求
  ipcMain.handle('quit-and-install', async () => {
    autoUpdater.quitAndInstall();
    return { code: 0, msg: '即将重启并安装更新' };
  });

  // 4. 监听更新进度，主动推送给渲染层
  autoUpdater.on('download-progress', (progress) => {
    // 把进度信息通过 IPC 发送给渲染层（对应 preload 中监听的 update-progress）
    mainWindow.webContents.send('update-progress', {
      percent: progress.percent,
      bytesPerSecond: progress.bytesPerSecond,
      total: progress.total,
      transferred: progress.transferred
    });
  });

  // 5. 监听更新完成事件
  autoUpdater.on('update-downloaded', () => {
    mainWindow.webContents.send('update-downloaded', { code: 0, msg: '下载更新完成' });
  });
}
