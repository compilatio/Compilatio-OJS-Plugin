<script setup lang="ts">
import InfoTooltip from '../atoms/InfoTooltip.vue'
import { useTranslations } from '../../lib/i18n'

defineProps<{
  id: string
  name: string
  label: string
  dotColorClass: string
  tooltipText: string
  invalid: boolean
}>()

const model = defineModel<number>({ required: true })
const { t } = useTranslations()
</script>

<template>
  <article class="flex items-center gap-1 px-4 py-1">
    <span class="size-2.5 rounded-full mr-1.5" :class="dotColorClass"></span>
    <label :for="id" class="flex items-center">
      <span>{{ label }}</span>
      <input
        :id="id"
        v-model.number="model"
        type="number"
        class="mx-2 p-1 rounded-lg border border-neutral-300 text-center outline-none"
        :name="name"
        min="0"
        max="100"
        :aria-invalid="invalid"
        aria-describedby="threshold_error"
        required
      />
      <span>{{ t('thresholds') }}</span>
      <InfoTooltip :text="tooltipText" class="ml-2" />
    </label>
  </article>
</template>
