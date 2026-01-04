import { useDocumentVisibility, useIntervalFn } from '@vueuse/core';
import { emitter } from './eventBus';
import { onUnmounted, ref, watch } from 'vue';
import { userInfo } from './storage';
import { isTimeInRange } from '@renderer/lib/time';

// 全局刷新事件定时器计数
export const GLOBAL_SECOND = ref(0);

/**
 * 全局刷新事件定时器
 * @param time 毫秒
 */
export function useGlobalIntervalFn(time: number = 1 * 60 * 1000) {
  // 全局定时器逻辑(默认1分钟)
  const { pause, resume } = useIntervalFn(
    () => {
      // 仅在交易时间内计时
      if (isTimeInRange()) {
        GLOBAL_SECOND.value++;
        emitter.emit('global-refresh');
      }
    },
    time,
    { immediate: false }
  );

  watch(
    userInfo,
    (info) => {
      if (info.id) resume();
      else pause();
    },
    { immediate: true }
  );

  emitter.on('global-pause', pause);
  emitter.on('global-resume', resume);

  const visibilityState = useDocumentVisibility();
  watch(visibilityState, (visible) => {
    if (visible === 'visible') resume();
    else pause();
  });

  // 注销
  onUnmounted(() => {
    emitter.off('global-pause', pause);
    emitter.off('global-resume', resume);
  });
}
