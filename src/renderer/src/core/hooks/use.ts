import { type RemovableRef, breakpointsTailwind, useBreakpoints, useDark } from '@vueuse/core';
import { watch } from 'vue';
import VxeUITable from 'vxe-table';

/**
 * 是否是移动端
 * @returns { isMobile: RemovableRef<boolean> }
 */
export function useIsMobile(): { isMobile: RemovableRef<boolean> } {
  const breakpoints = useBreakpoints(breakpointsTailwind);
  const isMobile = breakpoints.smaller('md');
  return { isMobile };
}

/**
 * 主题模式监听
 * @returns
 */
export function useDarkWatch() {
  const dark = useDark();
  VxeUITable.setTheme(dark.value ? 'dark' : 'light');
  watch(dark, (newDark) => {
    VxeUITable.setTheme(newDark ? 'dark' : 'light');
  });
  return { dark };
}
