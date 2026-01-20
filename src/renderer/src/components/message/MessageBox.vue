<script setup lang="ts">
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { $t } from '@renderer/locales';

export interface MessageBoxProps {
  title?: string;
  message?: string;
  content?: string;
  confirmButtonText?: string;
  cancelButtonText?: string;
}

const modelValue = defineModel<boolean>({ default: true });
const emit = defineEmits(['confirm', 'cancel']);
defineProps<MessageBoxProps>();

const handleCancel = () => {
  emit('cancel');
};

const handleConfirm = () => {
  emit('confirm');
};
</script>

<template>
  <Dialog v-model:open="modelValue">
    <!-- <DialogTrigger as-child>
        <Button variant="outline"> Open Dialog </Button>
      </DialogTrigger> -->
    <DialogContent class="sm:max-w-106.25">
      <DialogHeader>
        <DialogTitle>{{ title ?? '提示' }}</DialogTitle>
        <DialogDescription>
          {{ message ?? '是否继续？' }}
        </DialogDescription>
      </DialogHeader>
      <div v-if="content" v-html="content" class="max-h-200 overflow-y-auto"></div>
      <DialogFooter>
        <DialogClose as-child @click="handleCancel">
          <Button variant="outline">{{ confirmButtonText ?? $t('common.cancel') }}</Button>
        </DialogClose>
        <Button @click="handleConfirm">{{
          confirmButtonText ?? $t('common.confirmUpdate')
        }}</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
