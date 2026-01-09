import { type RemovableRef, breakpointsTailwind, useBreakpoints } from '@vueuse/core';

/**
 * 是否是移动端
 * @returns { isMobile: RemovableRef<boolean> }
 */
export function useIsMobile(): { isMobile: RemovableRef<boolean> } {
  const breakpoints = useBreakpoints(breakpointsTailwind);
  const isMobile = breakpoints.smaller('md');
  return { isMobile };
}
