<script setup lang="ts">
import { computed } from 'vue'
import type { ConfigurationState, DetectionConfiguration } from '../../types'
import AccordionSection from '../molecules/AccordionSection.vue'
import DetectionSettings from './DetectionSettings.vue'
import RadioCard from '../atoms/RadioCard.vue'
import { useTranslations } from '../../lib/i18n'

const props = defineProps<{
  configuration: ConfigurationState
  detections: DetectionConfiguration[]
}>()

const { t } = useTranslations()
const isScheduled = computed(() => '0' === props.configuration.autoAnalysis)
</script>

<template>
  <AccordionSection heading-id="delivery-heading" :title="t('section_title_analysis')">
    <h2 class="mt-6 mb-2 primary-text text-sm font-bold">{{ t('start_analysis') }}</h2>
    <div class="flex flex-col gap-1.5 px-4 py-2">
      <RadioCard v-model="configuration.autoAnalysis" name="auto_analysis" value="2" :title="t('start_manual')"/>
      <RadioCard v-model="configuration.autoAnalysis" name="auto_analysis" value="1" :title="t('start_auto')"/>
      <RadioCard v-model="configuration.autoAnalysis" name="auto_analysis" value="0" :title="t('start_timed')"/>
    </div>
    
    <div
      v-if="isScheduled"
      class="mt-2 mb-4 px-4 flex items-center justify-between gap-2"
    >
      <div class="flex flex-col gap-0.5">
        <label for="time_analysis" class="text-sm font-semibold text-black">
          {{ t('start_datetime') }}
        </label>
        <span class="text-xs text-gray-500">
          {{ t('start_datetime_help') }}
        </span>
      </div>
      <input
        id="time_analysis"
        v-model="configuration.timeAnalysis"
        type="datetime-local"
        class="rounded-lg border border-line-strong 
        bg-white px-1.5 py-1 
        text-ink outline-none 
        hover:border-neutral-500"
        name="time_analysis"
        required
      />
    </div>

    <DetectionSettings :detections="detections" :configuration="configuration" />
  </AccordionSection>
</template>
