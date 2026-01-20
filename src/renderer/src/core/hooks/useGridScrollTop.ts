import { GridApi } from 'ag-grid-community';
import { nextTick, ShallowRef } from 'vue';
import { onActivated, onDeactivated, ref } from 'vue';

/**
 * 回到页面恢复滚动位置
 * @param gridApi
 */
export function useGridScrollTop<T = any>(
  gridApi: ShallowRef<GridApi<T> | null, GridApi<T> | null>
) {
  const scrollPosition = ref({ top: 0, bottom: 0 }); // 保存滚动位置
  // 页面被缓存（失活）时，记录滚动位置
  onDeactivated(() => {
    if (gridApi.value) {
      // 获取当前滚动位置
      const scroll = gridApi.value.getVerticalPixelRange();
      scrollPosition.value = {
        ...scroll
      };
    }
  });

  // 页面从缓存恢复（激活）时，恢复滚动位置
  onActivated(() => {
    nextTick(() => {
      if (gridApi.value && scrollPosition.value.top > 0) {
        // 获取滚动容器
        const bodyViewport = document.querySelector('.ag-body-vertical-scroll-viewport');
        // 垂直滚动
        bodyViewport?.scrollTo({ top: scrollPosition.value.top });
      }
    });
  });
}
