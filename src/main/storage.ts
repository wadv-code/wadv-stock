import { ipcMain } from 'electron';
import ElectronStore from 'electron-store';

export const storage = new ElectronStore();

export function useStorage() {
  ipcMain.handle('get-item', async (_, key: string) => {
    return await storage.get(key);
  });
  ipcMain.handle('set-item', async (_, key: string, value: any) => {
    return storage.set(key, value);
  });
  ipcMain.handle('remove-item', async (_, key: string) => {
    return storage.delete(key);
  });
}
