import { useDark } from '@vueuse/core';
import { themeBalham } from 'ag-grid-community';
import { computed } from 'vue';

const isDark = useDark();

export const customTheme = computed(() =>
  isDark.value
    ? themeBalham.withParams({
        accentColor: '#ca4238',
        backgroundColor: '#0A0A0A',
        browserColorScheme: 'dark',
        chromeBackgroundColor: '#101828',
        fontFamily: {
          googleFont: 'IBM Plex Sans'
        },
        foregroundColor: '#FFF',
        rowHeight: 40
      })
    : themeBalham.withParams({
        accentColor: '#bb3127',
        browserColorScheme: 'light',
        fontFamily: {
          googleFont: 'IBM Plex Sans'
        },
        rowHeight: 40
      })
);
