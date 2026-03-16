import { app, shell, BrowserWindow, ipcMain, screen } from 'electron';
import { join } from 'path';
import { electronApp, optimizer, is } from '@electron-toolkit/utils';
import icon from '../../resources/icon.png?asset';
import { registerRequestIpc } from './request';
import { useNotification } from './notification';
import { useUpdates } from './update';
import { storage, useStorage } from './storage';

const appName = app.getName();
let mainWindow: BrowserWindow | null = null;

// 获取窗口应该显示的屏幕（优先扩展屏，否则主屏幕）
const getTargetScreen = () => {
  const savedScreenId = storage.get('screenId') as string;
  const allScreens = screen.getAllDisplays();

  // 查找保存的扩展屏是否存在
  const targetScreen = allScreens.find((display) => display.id.toString() === savedScreenId);

  // 不存在则返回主屏幕
  return targetScreen || screen.getPrimaryDisplay();
};

function createWindow(): void {
  const targetDisplay = getTargetScreen();
  const savedBounds = (storage.get('bounds') as {
    x: number;
    y: number;
    width: number;
    height: number;
  }) || {
    x: undefined,
    y: undefined,
    width: 1600,
    height: 860
  };
  // 校验窗口位置是否在目标屏幕范围内（避免扩展屏断开后位置异常）
  const displayBounds = targetDisplay.bounds;
  let finalBounds = { ...savedBounds };

  // 若保存的位置超出当前屏幕范围，居中显示
  if (
    finalBounds.x < displayBounds.x ||
    finalBounds.y < displayBounds.y ||
    finalBounds.x + finalBounds.width > displayBounds.x + displayBounds.width ||
    finalBounds.y + finalBounds.height > displayBounds.y + displayBounds.height
  ) {
    finalBounds = {
      width: savedBounds.width,
      height: savedBounds.height,
      x: displayBounds.x + (displayBounds.width - savedBounds.width) / 2,
      y: displayBounds.y + (displayBounds.height - savedBounds.height) / 2
    };
  }
  // Create the browser window.
  mainWindow = new BrowserWindow({
    ...finalBounds,
    title: appName,
    show: false,
    frame: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      webviewTag: true,
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  });

  mainWindow.on('ready-to-show', () => {
    mainWindow?.show();
  });

  // 窗口销毁后清空引用
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // 窗口关闭前保存状态
  mainWindow.on('close', () => {
    if (!mainWindow) return;
    // 获取当前窗口所在的屏幕
    const currentScreen = screen.getDisplayMatching(mainWindow.getBounds());
    // 保存屏幕ID和窗口位置
    storage.set('screenId', currentScreen.id.toString());
    storage.set('bounds', mainWindow.getBounds());
  });

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: 'deny' };
  });

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL']);
    mainWindow.webContents.openDevTools(); // open devtools
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'));
    // setTimeout(() => {
    //   checkForUpdates(mainWindow);
    // }, 5000);
  }
  // // 检查是否有更新
  // ipcMain.handle('check-for-updates', async () => {
  //   return await checkForUpdates(mainWindow);
  // });

  // 获取应用版本
  ipcMain.handle('get-app-version', async () => {
    return app.getVersion();
  });

  // 初始化检查更新
  useUpdates(mainWindow);
  // 初始化通知
  useNotification();
  // 初始化存储
  useStorage();
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // 注册主程序请求
  registerRequestIpc();

  // Set app user model id for windows
  electronApp.setAppUserModelId('com.wadv.stock');

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window);
  });

  // IPC test
  ipcMain.on('ping', () => console.log('pong'));

  // 监听渲染进程发送的窗口控制事件
  ipcMain.on('minimize-window', () => {
    if (mainWindow) {
      mainWindow.minimize();
    }
  });

  ipcMain.on('maximize-window', () => {
    if (mainWindow) {
      if (mainWindow.isMaximized()) {
        mainWindow.unmaximize();
      } else {
        mainWindow.maximize();
      }
    }
  });

  ipcMain.on('close-window', () => {
    if (mainWindow) {
      mainWindow.close();
    }
  });

  ipcMain.on('open-devtools', () => {
    if (mainWindow) {
      mainWindow.webContents.openDevTools(); // open devtools
    }
  });

  createWindow();

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
