import { ipcMain, Notification } from 'electron';

export async function useNotification() {
  // 主进程中监听并处理发送通知的请求
  ipcMain.handle('send-system-notification', (_, title, body, options) => {
    const notification = new Notification({
      title,
      body,
      ...options
    });
    notification.show();
    return true; // 可返回通知发送状态
  });
}
