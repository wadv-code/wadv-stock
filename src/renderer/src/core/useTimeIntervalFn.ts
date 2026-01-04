import { useDocumentVisibility, useIntervalFn, type Fn } from '@vueuse/core';
import { onActivated, onDeactivated, onUnmounted, watch } from 'vue';
import { userInfo } from './storage';

/**
 * 局部刷新事件定时器
 * @param time 毫秒
 */
export function useTimeIntervalFn(
  callback: Fn,
  { time = 1000, immediate = true }: { time?: number; immediate?: boolean }
) {
  const { pause, resume } = useIntervalFn(callback, time, { immediate });

  watch(
    userInfo,
    (user) => {
      if (user.id) resume();
      else pause();
    },
    { immediate: true }
  );

  const visibilityState = useDocumentVisibility();
  watch(visibilityState, (visible) => {
    if (visible === 'visible') resume();
    else pause();
  });

  // 激活
  onActivated(resume);

  // 隐藏
  onDeactivated(pause);

  // 注销
  onUnmounted(pause);

  if (immediate) resume();

  return {
    pause,
    resume
  };
}
