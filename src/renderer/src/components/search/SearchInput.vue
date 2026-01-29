<template>
  <div
    class="relative mx-auto transition-width duration-300"
    ref="containerRef"
    :class="isDropdownOpen ? 'w-100' : 'w-35'"
  >
    <!-- 搜索框 -->
    <div class="relative">
      <div class="absolute inset-y-0 left-0 top-0 pl-2 flex items-center pointer-events-none">
        <Search class="size-3.5" />
      </div>

      <input
        ref="inputRef"
        v-model="searchQuery"
        type="text"
        class="w-full pl-7 pr-12 py-1 border bg-gray-200 dark:bg-gray-800 rounded-full border-gray-300 dark:border-gray-700 focus:outline-none focus:border-primary transition-colors text-xs"
        :placeholder="placeholder"
        @focus="handleFocus"
        @input="handleInput"
      />

      <!-- 清除按钮 -->
      <button
        v-if="searchQuery"
        @click="clearSearch"
        class="absolute inset-y-0 right-0 top-0 pr-11 flex items-center text-gray-400 hover:text-gray-600 cursor-pointer"
      >
        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
      <span
        v-if="enableShortcutKey"
        class="absolute inset-y-0 right-1 top-2/12 h-8/12 bg-background border-foreground/60 text-muted-foreground group-hover:text-foreground hidden rounded-sm rounded-r-xl px-1 py-0.5 text-xs leading-none group-hover:opacity-100 md:block"
      >
        {{ isWindowsOs() ? 'Ctrl' : '⌘' }}
        <kbd>F</kbd>
      </span>
    </div>

    <!-- 下拉框 -->
    <Transition
      enter-active-class="transition duration-150 ease-out"
      enter-from-class="transform scale-95 opacity-0"
      enter-to-class="transform scale-100 opacity-100"
      leave-active-class="transition duration-100 ease-in"
      leave-from-class="transform scale-100 opacity-100"
      leave-to-class="transform scale-95 opacity-0"
    >
      <div
        v-if="isDropdownOpen"
        ref="dropdownRef"
        class="absolute z-10 mt-1 w-full bg-gray-100 dark:bg-black shadow-lg border border-gray-200 dark:border-gray-600 overflow-hidden rounded"
        @mousedown.prevent
      >
        <!-- 下拉框内容 -->
        <div class="max-h-80 overflow-y-auto">
          <!-- 加载状态 -->
          <div v-if="isLoading" class="p-4 text-center">
            <div class="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
            <p class="mt-2 text-sm text-gray-500">加载中...</p>
          </div>

          <!-- 搜索结果 -->
          <div v-else-if="stocks.length > 0">
            <div
              v-for="(item, index) in stocks"
              :key="item.id"
              :data-index="index"
              class="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer transition-colors"
              :class="{
                'bg-gray-200 dark:bg-gray-800': activeIndex === index,
                'border-b border-gray-100 dark:border-gray-700': index < stocks.length - 1
              }"
              @mouseenter="activeIndex = index"
            >
              <div class="flex items-center">
                <div class="flex items-center grow" @click="selectItem(item)">
                  <div class="flex-1 min-w-0 flex items-center">
                    <span class="text-xs text-gray-600 dark:text-gray-400 mr-1">
                      {{ item.stock.ts_code }}
                    </span>
                    <span class="text-sm truncate">
                      {{ item.stock.name }}
                    </span>
                  </div>
                </div>
                <div class="flex items-center">
                  <span class="text-gray-600 dark:text-gray-400 text-xs mr-3">
                    {{ item.stock.industry }}
                  </span>
                  <Button
                    v-if="selfStockCodes.includes(item.stock.ts_code)"
                    size="sm"
                    class="px-0.5! h-5 bg-gray-400 dark:bg-gray-600"
                  >
                    <Check class="size-4" />
                  </Button>
                  <StockSelfDownMenu
                    v-else
                    :id="item.id"
                    v-model="checkbox"
                    :remove="false"
                    @confirm="getSelfStocks"
                  >
                    <Button size="sm" class="px-0.5! h-5" @click="onAddSelfStock(item)">
                      <Plus class="size-4" />
                    </Button>
                  </StockSelfDownMenu>
                </div>
              </div>
            </div>
          </div>
          <div v-else-if="searchQuery" class="text-center py-3">
            <div
              class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-200 dark:bg-gray-800"
            >
              <svg
                class="h-6 w-6 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 class="mt-2 text-sm font-medium text-gray-900 dark:text-gray-400">未找到结果</h3>
            <p class="mt-1 text-sm text-gray-500 dark:text-gray-500">没有匹配的内容</p>
          </div>
          <!-- 无结果状态 -->
          <div v-else class="py-2 text-sm">
            <div
              class="text-gray-500 dark:text-gray-400 px-2 border-b border-gray-200 dark:border-gray-700 mb-1 pb-1"
            >
              搜索历史
            </div>
            <div
              v-for="history in historys"
              :key="history.ts_code"
              class="cursor-pointer px-2 py-0.5 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
              @click="openStockInfo(history)"
            >
              <span class="mr-2">{{ history.ts_code }}</span>
              <span>{{ history.name }}</span>
            </div>
            <div v-if="!historys.length" class="text-center">
              <h3 class="mt-2 text-sm font-medium text-gray-900 dark:text-gray-400">
                暂无历史记录
              </h3>
              <p class="text-sm text-gray-500 dark:text-gray-500">请输入名称/代码搜索</p>
            </div>
          </div>
        </div>

        <!-- 下拉框底部 -->
        <div
          v-if="stocks.length > 0"
          class="py-1 bg-gray-50 dark:bg-black border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500 gap-x-1 flex items-center justify-center"
        >
          按 <kbd class="px-1 bg-gray-200 rounded font-mono">↑</kbd>
          <kbd class="px-1 bg-gray-200 rounded font-mono">↓</kbd> 导航，按
          <kbd class="px-1 bg-gray-200 rounded font-mono">Enter</kbd> 选择
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { Check, Plus, Search } from 'lucide-vue-next';
import { GetUserStocksV2, PostSearchStocks } from '@renderer/api/xcdh';
import { Local } from '@renderer/core/win-storage';
import { Button } from '../ui/button';
import StockSelfDownMenu from '@renderer/views/stock/components/StockSelfDownMenu.vue';
import { nextTick } from 'vue';
import { isWindowsOs } from '@renderer/lib/is';
import { useRouter } from 'vue-router';
import { unref } from 'vue';
import {
  onClickOutside,
  useDebounceFn,
  useEventListener,
  useMagicKeys,
  whenever
} from '@vueuse/core';

interface HistoryItem {
  ts_code: string;
  name: string;
}

interface Props {
  enableShortcutKey?: boolean;
  placeholder?: string;
  debounceTime?: number;
  type?: 'radio' | 'checkbox';
}

const router = useRouter();

// 属性定义
const props = withDefaults(defineProps<Props>(), {
  placeholder: '名称/代码...',
  debounceTime: 300,
  enableShortcutKey: true
});

// 事件定义
const emit = defineEmits<{
  (e: 'search', query: string): void;
  (e: 'select', item: StockInfo): void;
  (e: 'confirm', item: StockInfo): void;
}>();

// 响应式数据
const searchQuery = ref('');
const isDropdownOpen = ref(false);
const isLoading = ref(false);
const activeIndex = ref(-1);
const inputRef = ref<HTMLInputElement>();
const dropdownRef = ref<HTMLElement>();
const containerRef = ref<HTMLElement>();
// 搜索结果
const keys = useMagicKeys();
const cmd = isWindowsOs() ? keys['ctrl+f'] : keys['cmd+f'];
const stocks = ref<StockInfo[]>([]);
const historys = ref<HistoryItem[]>(Local.get('search_history') || []);
const selfStockCodes = ref<string[]>([]);
const checkbox = ref<string[]>([]);
const isNotOpen = ref(false);

// 观察cmd真实值
cmd &&
  whenever(cmd, () => {
    if (props.enableShortcutKey) {
      isDropdownOpen.value = !isDropdownOpen.value;
    }
  });

// 观察open真实值
whenever(isDropdownOpen, () => {
  nextTick(() => {
    inputRef.value?.focus();
  });
});

// 禁用浏览器默认cmd组合键
const preventDefaultBrowserSearchHotKey = (event: KeyboardEvent) => {
  if (event.key?.toLowerCase() === 'f' && (event.metaKey || event.ctrlKey)) {
    event.preventDefault();
  }
};

const toggleKeydownListener = () => {
  if (props.enableShortcutKey) {
    window.addEventListener('keydown', preventDefaultBrowserSearchHotKey);
  } else {
    window.removeEventListener('keydown', preventDefaultBrowserSearchHotKey);
  }
};

watch(() => props.enableShortcutKey, toggleKeydownListener);

// 处理搜索框聚焦
const handleFocus = () => {
  activeIndex.value = -1;
  isDropdownOpen.value = true;
  getSelfStocks();
};

// 处理输入
const handleInput = useDebounceFn(async () => {
  if (searchQuery.value) {
    // 模拟异步搜索
    isLoading.value = true;
    try {
      const { data } = await PostSearchStocks({
        key_word: searchQuery.value,
        page: 1,
        pageSize: 20
      });
      const list = data.items || [];
      stocks.value = list;
      emit('search', searchQuery.value);
      isLoading.value = false;
    } catch {
      isLoading.value = false;
    }
  }
}, 300);

// 选择项目
const selectItem = (item: StockInfo) => {
  if (props.type === 'radio') emit('select', item);
  else openStockInfo({ name: item.stock?.name || '', ts_code: item.stock?.ts_code || '' });
};

const openStockInfo = (item: { name: string; ts_code: string }) => {
  isDropdownOpen.value = false;
  isNotOpen.value = false;
  inputRef.value?.blur();
  setHistory({ ts_code: item.ts_code, name: item.name || '' });
  router.push({ name: 'stock', query: { code: item.ts_code } });
};

const setHistory = (history: HistoryItem) => {
  const list = [
    {
      ts_code: history.ts_code,
      name: history.name
    },
    ...historys.value.filter((f) => f.ts_code !== history.ts_code)
  ];
  if (list.length > 12) list.pop();
  historys.value = list;
  Local.set('search_history', unref(historys));
};

// 清除搜索
const clearSearch = () => {
  searchQuery.value = '';
  //   isDropdownOpen.value = false;
  inputRef.value?.focus();
};

const getSelfStocks = async () => {
  const { data } = await GetUserStocksV2({ category: '' });
  const list = data || [];
  selfStockCodes.value = list.filter((f) => !!f.stock?.ts_code).map((item) => item.stock.ts_code);
};

const onAddSelfStock = async (stock: StockInfo) => {
  checkbox.value = [stock.stock.ts_code];
  isNotOpen.value = true;
};

// 点击外部关闭下拉框（排除下拉框本身）
onClickOutside(
  containerRef,
  () => {
    // 临时解决StockSelfDownMenu会触发关闭的问题
    if (!isNotOpen.value) {
      isDropdownOpen.value = false;
      if (!searchQuery.value) stocks.value = [];
    } else {
      isNotOpen.value = false;
    }
  },
  {
    ignore: [dropdownRef, '.stock-self-menu-content']
  }
);

// 键盘导航
useEventListener('keydown', (e: KeyboardEvent) => {
  if (!isDropdownOpen.value) return;

  switch (e.key) {
    case 'ArrowDown':
      e.preventDefault();
      activeIndex.value = activeIndex.value < stocks.value.length - 1 ? activeIndex.value + 1 : 0;
      break;
    case 'ArrowUp':
      e.preventDefault();
      activeIndex.value = activeIndex.value > 0 ? activeIndex.value - 1 : stocks.value.length - 1;
      break;
    case 'Enter':
      e.preventDefault();
      if (activeIndex.value >= 0 && activeIndex.value < stocks.value.length) {
        selectItem(stocks.value[activeIndex.value]);
      }
      break;
    case 'Escape':
      e.preventDefault();
      isDropdownOpen.value = false;
      break;
  }
});

// 监听activeIndex变化，确保滚动到可见区域
watch(activeIndex, (newIndex) => {
  if (newIndex >= 0 && dropdownRef.value) {
    const activeElement = dropdownRef.value.querySelector(
      `[data-index="${newIndex}"]`
    ) as HTMLElement;
    if (activeElement) {
      activeElement.scrollIntoView({
        block: 'nearest',
        behavior: 'smooth'
      });
    }
  }
});
</script>

<style scoped>
/* 自定义滚动条样式 */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>
