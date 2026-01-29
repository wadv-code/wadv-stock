import axios, { type AxiosError, type AxiosResponse } from 'axios';
import { ipcMain } from 'electron';
import { storage } from './storage';

// 1. 创建请求实例
const request = axios.create({
  baseURL: 'https://v.iusung.com:8300', // 接口基准地址
  timeout: 10000, // 超时时间
  headers: {
    'Content-Type': 'application/json'
  }
});

// 2. 请求拦截器（统一加 token、处理请求参数）
request.interceptors.request.use(
  (config) => {
    // 示例：从本地存储/环境变量获取 token
    const token = storage.get('token');
    if (token && config.headers) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// 3. 响应拦截器（统一处理返回值、错误）
request.interceptors.response.use(
  (response: AxiosResponse) => {
    // 自定义业务逻辑：比如接口返回 code !== 200 视为失败
    const { data } = response;
    if (data.code !== 0) {
      return Promise.reject(new Error(data.msg || '请求失败'));
    }
    if (data.data && data.data.token) {
      storage.set('token', data.data.token);
    }
    return data; // 只返回业务数据，简化渲染层处理
  },
  (error: AxiosError) => {
    // 分类处理错误：网络错误、超时、4xx/5xx
    let errorMsg = '请求失败';
    if (error.message.includes('Network Error')) {
      errorMsg = '网络异常，请检查网络连接';
    } else if (error.message.includes('timeout')) {
      errorMsg = '请求超时，请重试';
    } else if (error.response) {
      // HTTP 状态码错误
      const status = error.response.status;
      switch (status) {
        case 401:
          errorMsg = '登录失效，请重新登录';
          // 可触发登出逻辑：如清除 token、跳转到登录窗口
          break;
        case 403:
          errorMsg = '无权限访问该资源';
          break;
        case 404:
          errorMsg = '请求的资源不存在';
          break;
        case 500:
          errorMsg = '服务器内部错误';
          break;
        default:
          errorMsg = `请求错误（${status}）`;
      }
    }
    return Promise.reject(new Error(errorMsg));
  }
);

// 4. 封装通用请求方法（暴露给 IPC）
type RequestOptions = {
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  params?: string; // URL 参数
  data?: string; // 请求体参数
  headers?: Record<string, string>; // 自定义请求头
};

/**
 * 主进程通用请求方法
 * @param options 请求配置
 * @returns Promise<响应数据>
 */
export const ipcRequest = async (options: RequestOptions) => {
  try {
    const { url, method, params, data, headers } = options;
    const response = await request({
      url,
      method,
      params,
      data,
      headers: { ...request.defaults.headers, ...headers } as any
    });
    return { success: true, data: response.data };
  } catch (error: any) {
    return { success: false, message: error.message || '请求失败' };
  }
};

// 5. 注册 IPC 通道，供渲染进程调用
export const registerRequestIpc = () => {
  // 通用请求通道
  ipcMain.handle('main-request', async (_, options: RequestOptions) => {
    if (options.data) options.data = JSON.parse(options.data);
    if (options.params) options.params = JSON.parse(options.params);
    return await ipcRequest(options);
  });

  // // 也可封装特定业务请求（可选）
  // ipcMain.handle('main-get-urls', async (_) => {
  //   return await ipcRequest({
  //     url: '/api-base/BaseInfo/get_urls',
  //     method: 'GET'
  //   })
  // })
};
