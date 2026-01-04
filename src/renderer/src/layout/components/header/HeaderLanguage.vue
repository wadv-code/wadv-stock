<script setup lang="ts">
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@renderer/components/ui/dropdown-menu';
import { Local } from '@renderer/core/win-storage';
import { loadLocaleMessages, SupportedLanguagesType } from '@renderer/locales';
import { ref } from 'vue';

const position = ref(Local.get('locale') || 'zh-CN');

const handleChange = (value: string) => {
  loadLocaleMessages(value as SupportedLanguagesType);
  Local.set('locale', value);
};
</script>
<template>
  <DropdownMenu>
    <DropdownMenuTrigger as-child>
      <slot />
    </DropdownMenuTrigger>
    <DropdownMenuContent class="w-56">
      <DropdownMenuLabel>{{ $t('common.languagePanel') }}</DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuRadioGroup v-model="position" @update:model-value="handleChange">
        <DropdownMenuRadioItem value="en-US">
          {{ $t('common.enUS') }}
        </DropdownMenuRadioItem>
        <DropdownMenuRadioItem value="zh-CN">
          {{ $t('common.zhCN') }}
        </DropdownMenuRadioItem>
      </DropdownMenuRadioGroup>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
