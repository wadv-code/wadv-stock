<script setup lang="ts">
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@renderer/components/ui/breadcrumb';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@renderer/components/ui/dropdown-menu';
import { $t } from '@renderer/locales';
import { ChevronDown, Home } from 'lucide-vue-next';
import { Component, computed } from 'vue';
import { useRoute } from 'vue-router';
/**
 * 面包屑样式
 * background 背景
 * normal 默认
 */
type BreadcrumbStyleType = 'background' | 'normal';

interface IBreadcrumb {
  icon?: Component | string;
  isHome?: boolean;
  items?: IBreadcrumb[];
  path?: string;
  title?: string;
}

interface Props {
  hideWhenOnlyOne?: boolean;
  showHome?: boolean;
  showIcon?: boolean;
  type?: BreadcrumbStyleType;
}

const props = defineProps<Props>();

const route = useRoute();

const breadcrumbs = computed(() => {
  const matched = route.matched;

  const resultBreadcrumb: IBreadcrumb[] = [];

  for (const match of matched) {
    const { meta, path } = match;
    const { hideChildrenInMenu, hideInBreadcrumb, icon, name, title } = meta || {};
    if (hideInBreadcrumb || hideChildrenInMenu || !path) {
      continue;
    }

    resultBreadcrumb.push({
      icon,
      path: path || route.path,
      title: title ? $t((title || name) as string) : ''
    });
  }
  if (props.showHome) {
    resultBreadcrumb.unshift({
      icon: 'mdi:home-outline',
      isHome: true,
      path: '/default'
    });
  }
  if (props.hideWhenOnlyOne && resultBreadcrumb.length === 1) {
    return [];
  }

  return resultBreadcrumb;
});

function handleClick(path?: string) {
  if (!path) {
    return;
  }
  console.log('path', path);
  // emit('select', path);
}
</script>
<template>
  <Breadcrumb>
    <BreadcrumbList>
      <TransitionGroup name="breadcrumb-transition">
        <template v-for="(item, index) in breadcrumbs" :key="`${item.path}-${item.title}-${index}`">
          <BreadcrumbItem>
            <div v-if="item.items?.length ?? 0 > 0">
              <DropdownMenu>
                <DropdownMenuTrigger class="flex items-center gap-1">
                  <!-- <VbenIcon v-if="showIcon" :icon="item.icon" class="size-5" /> -->
                  {{ item.title }}
                  <ChevronDown class="size-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <template v-for="menuItem in item.items" :key="`sub-${menuItem.path}`">
                    <DropdownMenuItem @click.stop="handleClick(menuItem.path)">
                      {{ menuItem.title }}
                    </DropdownMenuItem>
                  </template>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <BreadcrumbLink
              v-else-if="index !== breadcrumbs.length - 1"
              href="#"
              @click.stop="handleClick(item.path)"
            >
              <div class="flex items-center">
                <Home :size="16" v-if="item.isHome" />
                <span>{{ item.title }}</span>
              </div>
            </BreadcrumbLink>
            <BreadcrumbPage v-else>
              <div class="flex items-center">
                <Home :size="16" v-if="item.isHome" />
                <span>{{ item.title }}</span>
              </div>
            </BreadcrumbPage>
            <BreadcrumbSeparator v-if="index < breadcrumbs.length - 1 && !item.isHome" />
          </BreadcrumbItem>
        </template>
      </TransitionGroup>
    </BreadcrumbList>
  </Breadcrumb>
</template>
