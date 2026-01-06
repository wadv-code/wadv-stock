<script setup lang="ts">
import { SidebarInset, SidebarProvider } from '@renderer/components/ui/sidebar';
import { type RendererElement, computed, onMounted, ref } from 'vue';
import { type RouteRecordName } from 'vue-router';
import AppSidebar from '@renderer/layout/components/AppSidebar.vue';
import HeaderMain from '@renderer/layout/components/header/HeaderMain.vue';
import { GetUserInfo } from '@renderer/api/login';
import { toast } from 'vue-sonner';
import { token, userInfo } from '@renderer/core/storage';
import FooterMain from './components/footer/FooterMain.vue';
import TagView from './components/TagView.vue';
import { useUserInfo } from '@renderer/store/modules/user';
import { storeToRefs } from 'pinia';

// 定义多个动画配置
const animations = {
  'page-transition': {
    enterActiveClass: 'transition-all duration-300 ease-in-out',
    enterFromClass: 'opacity-0 translate-x-4',
    enterToClass: 'opacity-100 translate-x-0',
    leaveActiveClass: 'transition-all duration-300 ease-in-out',
    leaveFromClass: 'opacity-100 translate-x-0',
    leaveToClass: 'opacity-0 -translate-x-4'
  },
  'fade-transition': {
    enterActiveClass: 'transition-opacity duration-300 ease-in-out',
    enterFromClass: 'opacity-0',
    enterToClass: 'opacity-100',
    leaveActiveClass: 'transition-opacity duration-300 ease-in-out',
    leaveFromClass: 'opacity-100',
    leaveToClass: 'opacity-0'
  }
  // 可按需添加更多动画配置
};

const { tagViews } = storeToRefs(useUserInfo());

// 定义当前动画状态
const currentAnimation = ref<keyof typeof animations>('page-transition');
const getKeepAliveNames = computed(() => tagViews.value.map((item) => item.fullPath));

// 计算属性获取当前动画类
const getEnterActiveClass = computed(() => animations[currentAnimation.value].enterActiveClass);
const getEnterFromClass = computed(() => animations[currentAnimation.value].enterFromClass);
const getEnterToClass = computed(() => animations[currentAnimation.value].enterToClass);
const getLeaveActiveClass = computed(() => animations[currentAnimation.value].leaveActiveClass);
const getLeaveFromClass = computed(() => animations[currentAnimation.value].leaveFromClass);
const getLeaveToClass = computed(() => animations[currentAnimation.value].leaveToClass);

/**
 * 解决动态路由name不一致，不能缓存的问题（懒得每个页面写defineOptions）
 * @param name
 * @param component
 */
const cacheMap = new Map();
const wrap = (name: RouteRecordName, component: RendererElement) => {
  let cache: {
    name: RouteRecordName;
    render: () => RendererElement;
  };
  const cacheName = name;
  if (cacheMap.has(cacheName)) {
    cache = cacheMap.get(cacheName);
  } else {
    cache = {
      name: cacheName,
      render() {
        return component;
      }
    };
    cacheMap.set(cacheName, cache);
  }
  return cache;
};

const getUserInfo = async () => {
  try {
    const { data } = await GetUserInfo();
    if (data.token) token.value = data.token;
    userInfo.value = data.user;
  } catch {
    toast.warning('登录过期，请重新登录');
  }
};

onMounted(() => {
  getUserInfo();
});
</script>

<template>
  <SidebarProvider :default-open="false">
    <AppSidebar />
    <SidebarInset>
      <HeaderMain class="bg-background" />
      <TagView />
      <router-view v-slot="{ Component, route }">
        <Transition
          :name="currentAnimation"
          mode="out-in"
          :enter-active-class="getEnterActiveClass"
          :enter-from-class="getEnterFromClass"
          :enter-to-class="getEnterToClass"
          :leave-active-class="getLeaveActiveClass"
          :leave-from-class="getLeaveFromClass"
          :leave-to-class="getLeaveToClass"
        >
          <keep-alive :include="getKeepAliveNames">
            <component :is="wrap(route.fullPath, Component)" />
          </keep-alive>
        </Transition>
      </router-view>
      <FooterMain />
    </SidebarInset>
  </SidebarProvider>
</template>
