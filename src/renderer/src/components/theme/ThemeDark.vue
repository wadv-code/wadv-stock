<script setup lang="ts">
import { useDark, useFullscreen, useToggle } from '@vueuse/core';
import { nextTick } from 'vue';

const isDark = useDark();

const toggleDark = useToggle(isDark);
const { isFullscreen, toggle: toggleFullscreen } = useFullscreen();

function toggleTheme(event: MouseEvent) {
  const isAppearanceTransition =
    !!document.startViewTransition &&
    !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!isAppearanceTransition || !event) {
    toggleDark();
    return;
  }
  const x = event.clientX;
  const y = event.clientY;
  const endRadius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));

  const transition = document.startViewTransition(async () => {
    toggleDark();
    await nextTick();
  });
  transition.ready.then(async () => {
    const clipPath = [`circle(0px at ${x}px ${y}px)`, `circle(${endRadius}px at ${x}px ${y}px)`];
    const animate = document.documentElement.animate(
      {
        clipPath: isDark.value ? [...clipPath].reverse() : clipPath
      },
      {
        duration: 450,
        easing: 'ease-in',
        pseudoElement: isDark.value ? '::view-transition-old(root)' : '::view-transition-new(root)'
      }
    );
    animate.onfinish = () => {
      transition.skipTransition();
    };
  });
}
</script>
<template>
  <slot
    :toggle="toggleTheme"
    :dark="isDark"
    :fullscreen="isFullscreen"
    :toggle-fullscreen="toggleFullscreen"
  />
</template>
