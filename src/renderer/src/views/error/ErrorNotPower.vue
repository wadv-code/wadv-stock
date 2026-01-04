<script setup lang="ts">
import { Button } from '@renderer/components/ui/button';
</script>
<template>
  <div class="w-full h-full flex items-center justify-center">
    <div class="text-center">
      <h1 class="text-9xl font-extrabold text-red-500 mb-4">401</h1>
      <h2 class="text-3xl font-bold mb-2">{{ $t('error.notPower.title') }}</h2>
      <p class="text-gray-600 mb-8">{{ $t('error.notPower.description') }}</p>
      <RouterLink to="/">
        <Button>
          {{ $t('common.backToHome') }}
        </Button>
      </RouterLink>
    </div>
  </div>
</template>
