<script setup lang="ts">
import type { ConfigurationState, DetectionConfiguration } from '../../types'
import DetectionRow from '../molecules/DetectionRow.vue'
import { useTranslations } from '../../lib/i18n'

defineProps<{
  detections: DetectionConfiguration[]
  configuration: ConfigurationState
}>()

const { t } = useTranslations()
</script>

<template>
  <div class="border-t border-neutral-300">
    <h2 class="mt-6 primary-text text-sm font-bold">
      {{ t('section_title_detections') }}
    </h2>

    <div v-if="detections.length" class="overflow-hidden flex flex-col">
        <DetectionRow v-for="detection in detections" :key="detection.process" :detection="detection" />
    </div>
  </div>
</template>
