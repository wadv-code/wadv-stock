<template>
  <Button type="primary" :loading="loading" :disabled="!!time" @click.prevent="handleSend">
    <span v-if="!time">{{ $t('common.smsCode') }}</span>
    <span v-else>{{ `${second - time}s ${$t('common.resend')}` }}</span>
  </Button>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { Button } from '@renderer/components/ui/button';
import { Local } from '@renderer/core/win-storage';
import { useTimeIntervalFn } from '@renderer/core/useTimeIntervalFn';
import { toast } from 'vue-sonner';
import { $t } from '@renderer/locales';
import { GetGetVcode } from '@renderer/api/login';

interface Props {
  phone?: string;
  second?: number;
  disabled?: boolean;
}

const { second = 60, disabled = false, phone } = defineProps<Props>();

const loading = ref(false);
const time = ref(0);
const startTime = ref<number>(Local.get('smsCodeStartTime') || 0);

const onRefresh = () => {
  if (startTime.value) {
    const currentTime = Date.now();
    time.value = Math.ceil((currentTime - startTime.value) / 1000);
    if (time.value >= second) {
      time.value = 0;
      startTime.value = 0;
      Local.remove('smsCodeStartTime');
      pause();
    }
  } else {
    time.value = 0;
    pause();
  }
};

const handleSend = async () => {
  if (disabled) return;
  if (!phone) {
    toast.error($t('tips.phoneRequired'));
    return;
  }
  try {
    loading.value = true;
    await GetGetVcode({ phone });
    toast.success($t('tips.sendSuccess'));
    startTime.value = Date.now();
    Local.set('smsCodeStartTime', startTime.value);
    onRefresh();
    resume();
  } catch {
    toast.error($t('tips.sendFailed'));
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  onRefresh();
});

const { pause, resume } = useTimeIntervalFn(onRefresh, { time: 500 });
</script>

<style scoped>
.sms-code-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  background-color: #409eff;
  color: #fff;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.sms-code-btn:hover:not(.disabled) {
  background-color: #66b1ff;
}

.sms-code-btn.disabled {
  background-color: #c0ccda;
  cursor: not-allowed;
  color: #fff;
}
</style>
