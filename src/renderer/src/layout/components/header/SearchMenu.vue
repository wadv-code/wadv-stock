<script setup lang="ts">
import { PostSearchStocks } from '@renderer/api/xcdh';
import { Button } from '@renderer/components/ui/button';
import { useIsMobile } from '@renderer/core/hooks';
import { isWindowsOs } from '@renderer/lib/is';
import { useDebounceFn, useMagicKeys, whenever } from '@vueuse/core';
import { Search, SearchCode } from 'lucide-vue-next';
import { nextTick, onMounted, onUnmounted, ref, unref, watch } from 'vue';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@renderer/components/ui/dialog';
import { Local } from '@renderer/core/win-storage';

const { isMobile } = useIsMobile();

interface Props {
  enableShortcutKey?: boolean;
  trigger?: boolean;
  codes?: string[];
}

interface HistoryItem {
  ts_code: string;
  name: string;
}

const modelValue = defineModel<boolean>({
  default: false
});

const props = withDefaults(defineProps<Props>(), {
  enableShortcutKey: true,
  trigger: true
});

const emit = defineEmits(['confirm']);

const loading = ref(false);
const keys = useMagicKeys();
const open = ref(modelValue.value);
const keyword = ref('');
const searchInputRef = ref<HTMLInputElement>();
const cmd = isWindowsOs() ? keys['ctrl+k'] : keys['cmd+k'];
const stocks = ref<StockInfo[]>([]);
const historys = ref<HistoryItem[]>(Local.get('search_history') || []);

// 观察cmd真实值
cmd &&
  whenever(cmd, () => {
    if (props.enableShortcutKey) {
      open.value = !open.value;
    }
  });

// 观察open真实值
whenever(open, () => {
  nextTick(() => {
    searchInputRef.value?.focus();
  });
});

// 禁用浏览器默认cmd组合键
const preventDefaultBrowserSearchHotKey = (event: KeyboardEvent) => {
  if (event.key?.toLowerCase() === 'k' && (event.metaKey || event.ctrlKey)) {
    event.preventDefault();
  }
};

const getRiseClass = (chg: number) => {
  if (isNaN(chg)) return '';
  if (chg > 0) return 'text-red-500';
  if (chg < 0) return 'text-green-500';
  return 'text-gray-500';
};

const toggleKeydownListener = () => {
  if (props.enableShortcutKey) {
    window.addEventListener('keydown', preventDefaultBrowserSearchHotKey);
  } else {
    window.removeEventListener('keydown', preventDefaultBrowserSearchHotKey);
  }
};

watch(() => props.enableShortcutKey, toggleKeydownListener);

watch(modelValue, (newValue) => {
  open.value = newValue;
});

const onSearch = useDebounceFn(async (value: string) => {
  if (!value) {
    stocks.value = [];
    return;
  }
  try {
    loading.value = true;
    const { data } = await PostSearchStocks({ key_word: value, page: 1, pageSize: 20 });
    const list = data.items || [];
    stocks.value = list;
  } finally {
    loading.value = false;
  }
}, 500);

const setHistory = (history: HistoryItem) => {
  const list = [
    {
      ts_code: history.ts_code,
      name: history.name
    },
    ...historys.value.filter((f) => f.ts_code !== history.ts_code)
  ];
  if (list.length > 10) list.pop();
  historys.value = list;
  Local.set('search_history', unref(historys));
};

const onConfirm = (stock: StockInfo) => {
  setHistory({ ts_code: stock.stock.ts_code, name: stock.stock?.name || '' });
  emit('confirm', stock.stock.ts_code);
  open.value = false;
  modelValue.value = false;
};

const onHistoryConfirm = (history: HistoryItem) => {
  setHistory(history);
  emit('confirm', history.ts_code);
  open.value = false;
  modelValue.value = false;
};

watch(keyword, onSearch);

onMounted(() => {
  toggleKeydownListener();
  onUnmounted(() => {
    window.removeEventListener('keydown', preventDefaultBrowserSearchHotKey);
  });
});
</script>
<template>
  <Dialog v-model:open="open" v-if="!isMobile">
    <DialogTrigger v-if="trigger" as-child>
      <div
        class="md:bg-accent group flex h-6 cursor-pointer items-center gap-2 rounded-2xl border-none bg-none px-1 outline-none"
      >
        <Search
          class="text-muted-foreground group-hover:text-foreground size-4 group-hover:opacity-100"
        />
        <span
          class="text-muted-foreground group-hover:text-foreground hidden text-xs duration-300 md:block"
        >
          {{ $t('common.search') }}
        </span>
        <span
          v-if="enableShortcutKey"
          class="bg-background border-foreground/60 text-muted-foreground group-hover:text-foreground relative hidden rounded-sm rounded-r-xl px-1.5 py-1 text-xs leading-none group-hover:opacity-100 md:block"
        >
          {{ isWindowsOs() ? 'Ctrl' : '⌘' }}
          <kbd>K</kbd>
        </span>
        <span v-else></span>
      </div>
    </DialogTrigger>
    <DialogContent class="max-w-3xl">
      <DialogHeader>
        <DialogTitle>
          <div class="flex items-center border px-2 mr-2 rounded-md">
            <Search class="text-muted-foreground mr-2 size-4" />
            <input
              ref="searchInputRef"
              v-model="keyword"
              :placeholder="$t('common.searchKeyword')"
              class="ring-none placeholder:text-muted-foreground w-[80%] rounded-md border border-none bg-transparent p-2 pl-0 text-sm font-normal outline-none ring-0 ring-offset-transparent focus-visible:ring-transparent"
            />
          </div>
        </DialogTitle>
        <DialogDescription>
          <div class="flex items-center flex-wrap gap-1">
            <div
              v-for="history in historys"
              :key="history.ts_code"
              class="border border-primary text-primary px-2 py-0.5 cursor-pointer leading-4 rounded-sm"
              @click="onHistoryConfirm(history)"
            >
              <p>{{ history.name }}</p>
              <p>{{ history.ts_code }}</p>
            </div>
          </div>
          <!-- {{ $t('common.searchStock') }} -->
        </DialogDescription>
      </DialogHeader>
      <div class="max-h-64 min-h-20 overflow-y-auto">
        <div
          v-for="stock in stocks"
          :key="stock.stock.ts_code"
          class="px-2 py-1 flex items-center justify-between cursor-pointer border border-sidebar-border rounded-md mb-1 hover:bg-primary/10"
        >
          <div class="flex flex-col">
            <div class="flex items-center gap-x-2">
              <span class="font-bold text-lg">{{ stock.stock.name }}</span>
              <div
                class="flex items-end text-xs rounded-xs gap-x-1"
                :class="getRiseClass(stock.real_time.rise_amt)"
              >
                <span class="font-bold text-lg">{{ stock.real_time.lastPrice }}</span>
                <span class="mb-1">
                  {{ stock.real_time.rise_amt }} / {{ stock.real_time.rise_per }}%
                </span>
              </div>
            </div>
            <div class="text-xs flex items-center gap-x-2 text-muted-foreground">
              <span>{{ stock.stock.ts_code }}</span>
              <span>{{ stock.stock.industry }}</span>
            </div>
          </div>
          <DialogClose v-if="!codes?.includes(stock.stock.ts_code)" as-child>
            <Button type="button" @click="onConfirm(stock)">{{ $t('common.confirm') }}</Button>
          </DialogClose>
          <span v-else class="text-orange-500 text-sm">已加入</span>
        </div>
        <div v-if="stocks.length === 0" class="flex justify-center items-center">
          <div class="my-10 flex flex-col justify-center items-center text-muted-foreground gap-2">
            <SearchCode :size="50" />
            <span>{{ $t('common.noStock') }}</span>
          </div>
        </div>
      </div>
      <DialogFooter class="sm:justify-start">
        <DialogClose as-child>
          <Button type="button" variant="secondary">
            {{ $t('common.close') }}
          </Button>
        </DialogClose>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
