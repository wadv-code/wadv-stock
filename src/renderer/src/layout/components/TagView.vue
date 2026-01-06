<script setup lang="ts">
import Sortable from 'sortablejs';
import { useUserInfo } from '@renderer/store/modules/user';
import { X } from 'lucide-vue-next';
import { storeToRefs } from 'pinia';
import { RouteLocationNormalizedLoadedGeneric, useRoute, useRouter } from 'vue-router';
import { onMounted, onUnmounted, ref } from 'vue';

const route = useRoute();
const router = useRouter();
const tagViewRef = ref<HTMLDivElement>();
const { delTagView } = useUserInfo();
const { tagViews } = storeToRefs(useUserInfo());
let sortable: Sortable | null = null;

const handleClick = (tag: RouteLocationNormalizedLoadedGeneric) => {
  router.replace(tag);
};

const handleRemove = (tag: RouteLocationNormalizedLoadedGeneric) => {
  delTagView(tag);
  const view = tagViews.value.find((item) => item.fullPath === tag.fullPath);
  if (!view && tagViews.value.length > 0) {
    router.replace(tagViews.value[tagViews.value.length - 1]);
  }
};

const initSortable = () => {
  sortable = new Sortable(tagViewRef.value!, {
    animation: 150
  });
};

onMounted(() => {
  initSortable();
});

onUnmounted(() => {
  sortable?.destroy();
});
</script>

<template>
  <div
    ref="tagViewRef"
    class="w-full flex items-center overflow-x-auto overflow-y-hidden select-none bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-800"
  >
    <div
      v-for="tag in tagViews"
      :key="tag.fullPath"
      class="px-2 py-1 text-sm font-medium cursor-pointer flex items-center justify-center hover:[&_.close]:opacity-100 border-r border-gray-300 dark:border-gray-700 hover:bg-gray-300/80 hover:dark:bg-gray-700"
      :class="route.fullPath === tag.fullPath ? 'bg-gray-300/80 dark:bg-gray-700' : ''"
      @click="handleClick(tag)"
    >
      <component :is="tag.meta.icon" v-if="tag.meta.icon" :size="16" />
      <span class="ml-1">{{ $t(tag.meta.title) }}</span>
      <X
        :size="16"
        class="ml-1 close opacity-0 transition-opacity duration-300"
        @click.stop="handleRemove(tag)"
      />
    </div>
  </div>
</template>
