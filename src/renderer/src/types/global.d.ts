// 声明文件，定义全局变量
/* eslint-disable */
declare interface Window {
  nextLoading: boolean;
}

// 对象any
declare interface TypedAny<T = any> {
  [key: string]: T;
}

/**
 *  T | null 包装
 */
declare type Nullable<T> = null | T;

// 声明全局变量 vite config define 的类型
declare const __VIEW_ENV__: string;
declare const __APP_NAME__: string;
declare const __VIEW_ENV__: string;
