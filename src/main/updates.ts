import { app, BrowserWindow, dialog } from 'electron';
import { autoUpdater } from 'electron-updater';
import semver from 'semver';

// 防止事件监听器重复注册
let updateListenersInitialized = false;

// 初始化更新事件监听器（只执行一次）
function initUpdateListeners(mainWindow: BrowserWindow | null) {
  if (updateListenersInitialized || !mainWindow) return;

  // 监听下载进度
  autoUpdater.on('download-progress', (progressObj) => {
    let logMessage = `下载进度：${progressObj.percent.toFixed(1)}%`;
    if (progressObj.transferred && progressObj.total) {
      logMessage += ` (${progressObj.transferred}/${progressObj.total} MB)`;
    }
    console.log(logMessage);
    // 发送到渲染进程展示
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
      autoUpdater.quitAndInstall();
    }
  });

  updateListenersInitialized = true;
}

// 检查更新核心逻辑
export async function checkForUpdates(mainWindow: BrowserWindow | null) {
  if (!mainWindow) return;
  try {
    // 初始化事件监听器（确保只执行一次）
    initUpdateListeners(mainWindow);

    // 检查是否有新版本
    const result = await autoUpdater.checkForUpdates();

    if (!result?.updateInfo?.version) {
      console.log('未获取到版本信息');
      return;
    }

    const currentVersion = app.getVersion();
    const remoteVersion = result.updateInfo.version;

    console.log(`版本比较: 本地=${currentVersion}, 远程=${remoteVersion}`);

    // 使用 semver 比较版本
    if (semver.gt(remoteVersion, currentVersion)) {
      // 远程版本 > 当前版本，提示更新
      const { response } = await dialog.showMessageBox(mainWindow, {
        type: 'info',
        title: '发现新版本',
        message: `当前版本：${currentVersion}，最新版本：${remoteVersion}`,
        detail: '是否立即下载更新？',
        buttons: ['是', '否']
      });

      if (response === 0) {
        // 用户点击"是"，开始下载
        console.log('开始下载更新...');
        autoUpdater.downloadUpdate();
      }
    } else {
      // 已是最新版本，可选是否提示用户
      console.log('当前已是最新版本');
      // 如果需要在UI上提示，可以取消下面代码的注释
      /*
      dialog.showMessageBox(mainWindow, {
        type: 'info',
        title: '已是最新版本',
        message: `当前版本 ${currentVersion} 已是最新，无需更新`
      });
      */
    }
  } catch (error) {
    console.error('更新检查失败:', error);
    // 处理更新检查失败
    dialog.showMessageBox(mainWindow, {
      type: 'error',
      title: '更新检查失败',
      message: '无法检查更新，请检查网络或稍后重试',
      detail: error instanceof Error ? error.message : '未知错误'
    });
  }
}
