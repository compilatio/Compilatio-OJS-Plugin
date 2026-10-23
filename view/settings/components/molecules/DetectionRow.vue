<script setup lang="ts">
import type { DetectionConfiguration } from '../../types'
import { detectionDescriptionKey, detectionIcon, detectionLabelKey } from '../../lib/detectionMeta'
import { useTranslations } from '../../lib/i18n'

import ToggleSwitchField from '../atoms/ToggleSwitchField.vue'
import { Icon } from '@elastisafe/components'

defineProps<{
  detection: DetectionConfiguration
}>()

const { t } = useTranslations()
</script>

<template>
  <div class="flex items-center justify-between gap-3 p-4"
    :class="!detection.configurable && !detection.enabled ? 'bg-neutral-100' : ''">
    <div class="min-w-0">
      <label :for="`d_${detection.process}`" class="cursor-pointer">
        <div class="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-sm font-semibold text-black ">
          <div class="size-7 flex items-center justify-center shrink-0 border rounded border-gray-300">
            <Icon :name="detectionIcon(detection.process)" class="text-black size-5" />
          </div>
          {{ t(detectionLabelKey(detection.process)) }}
        </div>
      </label>
      <p class="mt-1 text-xs text-gray-500">
        {{ t(detectionDescriptionKey(detection.process)) }}
      </p>
    </div>
    <div>
      <ToggleSwitchField v-if="detection.configurable" :id="`d_${detection.process}`" :name="`detections[${detection.process}][enabled]`"
        :disabled="!detection.configurable" :aria-label="t(detectionLabelKey(detection.process))" v-model="detection.enabled">
      </ToggleSwitchField>
      <span v-else
        class="inline-flex rounded-full px-2 py-0.5 text-[11px] font-bold"
        :class="detection.enabled ? 'bg-green-100 text-green-800' : 'bg-neutral-100 text-neutral-800'">
        {{ detection.enabled ? t('detection_always_enabled') : t('detection_disabled_by_admin') }}
      </span>
    </div>
  </div>
</template>
