import { type Fn } from '@vueuse/core';
import { emitter, type EmitterEvents } from './eventBus';
import { nextTick, onActivated, onDeactivated, onMounted, onUnmounted } from 'vue';
import { GLOBAL_SECOND } from './useGlobalIntervalFn';

interface GlobalRefreshProps {
  // 事件名
  key: keyof EmitterEvents;
  // 刷新间隔秒数
  second?: number;
  // 是否初始化执行一次
  immediate?: boolean;
}

/**
 * 全局通用事件触发
 * @param callback 回调函数
 * @param options GlobalRefreshProps
 * @description 全局事件触发，默认60秒刷新一次
 * @returns 事件函数
 */
export function useGlobalRefresh(callback: Fn, options: GlobalRefreshProps) {
  const { key, second = 60, immediate = false } = options;

  let isOn = false;

  const refresh = () => {
    if (second > 1) {
      if (GLOBAL_SECOND.value % second === 0) callback();
    } else {
      callback();
    }
  };

  // 激活
  onActivated(() => {
    if (isOn) return;
    emitter.on(key, refresh);
    isOn = true;
  });

  // 激活
  onMounted(() => {
    if (isOn) return;
    emitter.on(key, refresh);
    isOn = true;
  });

  // 隐藏
  onDeactivated(() => {
    emitter.off(key, refresh);
    isOn = false;
  });

  // 注销
  onUnmounted(() => {
    emitter.off(key, refresh);
    isOn = false;
  });

  if (immediate) nextTick(callback);

  return {
    pause: () => {
      emitter.emit('global-pause');
    },
    resume: () => {
      emitter.emit('global-resume');
    }
  };
}
