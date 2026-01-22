<script setup lang="ts">
import PageContainer from '@renderer/components/page/PageContainer.vue';
import { computed, onMounted, ref, unref, watch } from 'vue';
import { token } from '@renderer/core/storage';
import { useDark } from '@vueuse/core';
import { PostSearchStocks } from '@renderer/api/xcdh';
import { Local } from '@renderer/core/win-storage';
import { Plus, X } from 'lucide-vue-next';
import ToggleRadio, { ToggleRadioOption } from '@renderer/components/ui/ToggleRadio.vue';
import StockKline from '@renderer/components/stock/StockKline.vue';
import { toast } from 'vue-sonner';
import SearchMenu from '@renderer/layout/components/header/SearchMenu.vue';
import { getRiseClassName } from '@renderer/lib/stock';

interface Item {
  id: string;
  url: string;
  name: string;
}

const VITE_API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const open = ref(false);
const isDark = useDark();
const stocks = ref<Item[]>([]);
const loading = ref(false);
const codes = ref<string[]>(Local.get('monitor-codes') || ['601698.SH', '600118.SH']);
const checked = ref<string[]>(Local.get('monitor-checked') || ['600118.SH', '600118.SH']);
// , '300750.SZ', '601888.SH', '002352.SZ', '603986.SH', '601899.SH'
const type = ref<0 | 1 | 2 | 3>(Local.get('klineType') ?? 1);
// K线选项
const themeOptions: ToggleRadioOption[] = [
  { label: '分时', value: 0 },
  { label: '日K', value: 1 },
  { label: '周K', value: 2 },
  { label: '月K', value: 3 },
  { label: '季K', value: 4 }
];
// 线选项
const klines = [5, 10, 20, 30, 60];
const calcParams = ref<number[]>(Local.get('CalcParams') || [5, 10, 20]);

const checkedStocks = computed(() => stocks.value.filter((v) => checked.value.includes(v.id)));

watch(isDark, () => {
  onRefresh();
});

const handleCalcParams = (value: number) => {
  if (calcParams.value.includes(value)) {
    calcParams.value = calcParams.value.filter((f) => f !== value);
  } else {
    calcParams.value.push(value);
  }
  Local.set('CalcParams', unref(calcParams));
};

const onRefresh = async () => {
  try {
    loading.value = true;
    const { data } = await PostSearchStocks({
      ts_codes: codes.value,
      page: 1,
      pageSize: 10
    });
    const items = data.items || [];
    const list: StockInfo[] = [];
    for (const code of codes.value) {
      const row = items.find((v) => v.stock.ts_code === code);
      if (row) list.push(row);
    }
    stocks.value = list.map((item) => ({
      id: item.stock.ts_code,
      url: `${VITE_API_BASE_URL}/k/index.html?code=${item.stock.ts_code}${isDark.value ? '&dark=1' : ''}&t=${token.value}#/`,
      name: item.stock.name
    }));
  } catch (error) {
    console.error(error);
  } finally {
    loading.value = false;
  }

  // src.value = `${VITE_API_BASE_URL}/k/index.html?code=001280.SZ${isDark.value ? '&dark=1' : ''}&t=${token.value}#/`;
};

const handleChecked = (value: string) => {
  if (checked.value.includes(value)) {
    checked.value = checked.value.filter((f) => f !== value);
  } else {
    checked.value.push(value);
  }
  Local.set('monitor-checked', checked.value);
};

const handlePlus = () => {
  if (checked.value) {
    open.value = true;
  } else {
    toast.warning('请先选择分组后添加。', { position: 'top-center' });
  }
};

const handleConfirm = async (code: string) => {
  if (codes.value.includes(code)) {
    toast.warning('股票已存在。', { position: 'top-center' });
    return;
  }
  if (!checked.value.includes(code)) {
    checked.value.push(code);
    Local.set('monitor-checked', checked.value);
  }
  codes.value.push(code);
  await onRefresh();
  Local.set('monitor-codes', codes.value);
};

const handleRemove = (index: number) => {
  codes.value.splice(index, 1);
  checked.value = checked.value.filter((f) => codes.value.includes(f));
  Local.set('monitor-codes', codes.value);
  Local.set('monitor-checked', checked.value);
  onRefresh();
};

onMounted(() => {
  onRefresh();
});
</script>
<template>
  <PageContainer>
    <template #header>
      <div class="flex gap-x-1 p-1">
        <button
          v-for="(stock, index) in stocks"
          class="min-w-10 inline-flex justify-center items-center text-sm transition-all duration-200 ease-in-out px-2 border cursor-pointer border-primary"
          :class="{ 'bg-red-500 text-white dark:bg-red-700': checked.includes(stock.id) }"
          @click="handleChecked(stock.id)"
        >
          <span>{{ stock.name }}</span>
          <X :size="16" class="ml-1" @click.stop="handleRemove(index)" />
        </button>
        <button
          class="min-w-10 inline-flex justify-center items-center text-sm transition-all duration-200 ease-in-out px-2 border cursor-pointer border-gray-500 dark:border-gray-300"
          @click="handlePlus"
        >
          <Plus :size="16" />
          添加股票
        </button>
      </div>
      <div class="flex items-center px-1 mt-2">
        <div class="flex items-center gap-x-1">
          <span class="text-sm text-gray-600 dark:text-gray-400">K线：</span>
          <ToggleRadio :options="themeOptions" v-model="type" />
        </div>
        <div v-show="![0].includes(type)" class="flex items-center justify-start ml-2">
          <div class="flex items-center gap-x-1">
            <span class="text-sm text-gray-600 dark:text-gray-400">MA：</span>
            <button
              v-for="value in klines"
              class="min-w-10 inline-flex justify-center items-center text-sm transition-all duration-200 ease-in-out bg-gray-200 dark:bg-gray-700 cursor-pointer"
              :class="{ 'bg-red-500 text-white dark:bg-red-700': calcParams.includes(value) }"
              @click="handleCalcParams(value)"
            >
              {{ value }}日
            </button>
          </div>
        </div>
        <div class="flex flex-col ml-auto">
          <div class="flex items-center" v-if="type === 1">
            <div class="flex items-center mr-2">
              <div class="w-3 flex justify-center">
                <span class="w-2 h-2 flex bg-amber-300 transform-3d rotate-45"></span>
              </div>
              <span class="text-xs ml-1">攻击标注</span>
            </div>
            <div class="flex items-center mr-2">
              <div class="w-3 flex justify-center">
                <span class="w-3 h-1.5 flex bg-red-500 border border-black dark:border-white" />
              </div>
              <span class="text-xs ml-1">涨停标注</span>
            </div>
            <div class="flex items-center mr-2">
              <div class="w-3 flex justify-center">
                <span class="w-3 h-1.5 flex bg-green-500 border border-black dark:border-white" />
              </div>
              <span class="text-xs ml-1">炸板标注</span>
            </div>
          </div>
          <div class="flex items-center" v-else-if="[2, 3, 4].includes(type)">
            <div class="flex items-center mr-2">
              <span class="w-2 h-2 flex bg-blue-400"></span>
              <span class="text-xs ml-1">建仓高点</span>
            </div>
            <div class="flex items-center mr-2">
              <span class="w-2 h-2 flex bg-gray-400"></span>
              <span class="text-xs ml-1">建仓低点</span>
            </div>
          </div>
        </div>
      </div>

      <SearchMenu
        v-model:open="open"
        :trigger="false"
        select
        :codes="checkedStocks.map((v) => v.id)"
        @confirm="handleConfirm"
      />
    </template>
    <div class="grid grid-cols-3 gap-2 p-1">
      <div
        v-for="stock in checkedStocks"
        :key="stock.id"
        class="flex flex-col items-center justify-center h-[40vh] outline outline-primary/50 relative"
      >
        <StockKline v-model="stock.id" hide-tool :type="type" :calcParams="calcParams">
          <template #header="{ info }">
            <div class="w-full flex items-center border-b-2 border-primary/30 px-2">
              <div class="flex items-center gap-x-1" :class="getRiseClassName(info)">
                <h1 class="text-xl leading-6 font-bold">{{ info.stock?.name }}</h1>
                <h1 class="text-xl font-bold">{{ info.real_time.lastPrice }}</h1>
                <div class="flex items-center justify-between text-lg ml-2 gap-x-0.5">
                  <span>
                    {{ info.real_time.rise_per > 0 ? '+' : '' }}{{ info.real_time.rise_per }}%
                  </span>
                  <span>/</span>
                  <span
                    >{{ info.real_time.rise_amt > 0 ? '+' : '' }}{{ info.real_time.rise_amt }}</span
                  >
                </div>
              </div>
              <span class="ml-auto text-sm">{{ info.stock?.ts_code }}</span>
            </div>
          </template>
        </StockKline>
        <!-- <webview v-if="stock.url" :src="stock.url" frameborder="0" class="w-full h-full" />
        <div class="absolute right-20 top-1 flex items-end">
          <h1 class="mr-2">{{ stock.id }}</h1>
          <h1 class="font-bold text-xl">{{ stock.name }}</h1>
        </div> -->
      </div>
    </div>
  </PageContainer>
</template>
