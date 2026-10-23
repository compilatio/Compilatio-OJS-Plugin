<script setup lang="ts">
import { useTranslations } from '../../lib/i18n'

defineProps<{
  platform: string
  logoUrl: string
  allowedFileTypes: string[]
}>()

const { t } = useTranslations()
</script>

<template>
  <header class="flex items-center gap-4 w-full p-4 border-b border-neutral-300">
    <slot name="logo">
      <img class="size-16 object-contain" :src="logoUrl" :alt="platform" />
    </slot>
    <div>
      <h1 class="text-2xl font-bold primary-text sm:text-3xl">
        {{ t('settings') }} {{ platform }}
      </h1>
      <p class="mt-1 max-w-3xl text-sm leading-6 secondary-text">
        {{ t('settings_desc') }}
      </p>
    </div>
  </header>
</template>
