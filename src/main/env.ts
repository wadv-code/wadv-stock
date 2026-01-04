/**
 * 判断是否为主进程
 */
export const isMainProcess = process.type === 'browser';

/**
 * 判断是否为渲染进程
 */
export const isRendererProcess = process.type === 'renderer';
