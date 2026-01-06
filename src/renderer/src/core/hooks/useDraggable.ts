// hooks/useDraggable.ts
import { useEventListener } from '@vueuse/core';
import { onMounted, ref, unref, type Ref } from 'vue';
import { Session } from '../win-storage';

/**
 * 通用拖拽Hooks
 * @param el 绑定拖拽的元素Ref
 * @param options 拖拽配置项
 * @returns 拖拽状态和操作方法
 */
export function useDraggable({ key, drag }: { key: string; drag: Ref<HTMLElement | null> }) {
  const active = ref(false);
  const elOffsetX = ref(0);
  const elOffsetY = ref(0);
  const position = ref<{ top: number; left: number }>(Session.get(key) || { top: 50, left: 100 });

  const handleMouseDown = (event: MouseEvent) => {
    elOffsetX.value = event.offsetX;
    elOffsetY.value = event.offsetY;
    active.value = true;
  };
  const handleDragEnd = () => {
    active.value = false;
    Session.set(key, unref(position));
  };

  // // 鼠标位置监听（基于元素）
  // const { elementX, elementY, isOutside } = useMouseInElement(el, {
  //   handleOutside: true
  // });

  const handleMouseMove = (event: MouseEvent) => {
    if (!active.value) return;
    position.value.top = event.clientY - elOffsetY.value;
    position.value.left = event.clientX - elOffsetX.value;
  };

  // // RAF更新位置（平滑更新）
  // useRafFn(() => {
  //   if (isOutside.value || !active.value || !el.value) return;
  //   console.log(elementX.value, elementY.value);

  //   el.value.style.left = elementX.value + 'px';
  // });

  // 绑定事件
  onMounted(() => {
    // 元素按下事件
    useEventListener(drag, 'mousedown', handleMouseDown);
    // 元素按下事件
    useEventListener(window, 'mousemove', handleMouseMove);
    // 全局鼠标松开/离开事件（确保拖拽结束）
    useEventListener(window, 'mouseup', handleDragEnd);
    useEventListener(window, 'mouseleave', handleDragEnd);
  });

  return { position };
}
