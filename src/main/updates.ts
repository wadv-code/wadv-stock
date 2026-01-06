import { app, BrowserWindow, dialog } from 'electron';
import { autoUpdater } from 'electron-updater';

// 检查更新核心逻辑
export async function checkForUpdates(mainWindow: BrowserWindow | null) {
  if (!mainWindow) return;
  try {
    // 检查是否有新版本
    const updateInfo = await autoUpdater.checkForUpdates();
    console.log('updateInfo', updateInfo);
    if (updateInfo?.updateInfo?.version) {
      // 有更新时提示用户
      const { response } = await dialog.showMessageBox(mainWindow, {
        type: 'info',
        title: '发现新版本',
        message: `当前版本：${app.getVersion()}，最新版本：${updateInfo.updateInfo.version}`,
        detail: '是否立即下载更新？',
        buttons: ['是', '否']
      });

      if (response === 0) {
        // 用户点击“是”
        // 开始下载更新
        autoUpdater.downloadUpdate();

        // 监听下载进度
        autoUpdater.on('download-progress', (progressObj) => {
          let logMessage = `下载进度：${progressObj.percent.toFixed(1)}%`;
          if (progressObj.transferred && progressObj.total) {
            logMessage += ` (${progressObj.transferred}/${progressObj.total} MB)`;
          }
          // 可将进度发送到渲染进程展示
          mainWindow.webContents.send('update-progress', progressObj);
        });

        // 下载完成后提示重启
        autoUpdater.on('update-downloaded', async () => {
          const { response } = await dialog.showMessageBox(mainWindow, {
            type: 'info',
            title: '更新完成',
            message: '更新包已下载完成，是否立即重启应用生效？',
            buttons: ['重启', '稍后']
          });

          if (response === 0) {
            // 退出并安装更新（无需重装，自动替换文件）
            autoUpdater.quitAndInstall();
          }
        });
      }
    } else {
      // 无更新提示
      dialog.showMessageBox(mainWindow, {
        type: 'info',
        title: '已是最新版本',
        message: '当前应用已是最新版本，无需更新'
      });
    }
  } catch (error) {
    // 处理更新检查失败（如网络问题、服务器不可用）
    dialog.showMessageBox(mainWindow, {
      type: 'error',
      title: '更新检查失败',
      message: '无法检查更新，请检查网络或稍后重试',
      detail: JSON.stringify(error) || '未知错误'
    });
  }
}
