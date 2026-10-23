<script setup lang="ts">
import type { ConfigurationState } from '../../types'
import AccordionSection from '../molecules/AccordionSection.vue'
import InfoTooltip from '../atoms/InfoTooltip.vue'
import ThresholdInputRow from '../molecules/ThresholdInputRow.vue'
import { useTranslations } from '../../lib/i18n'

defineProps<{
  configuration: ConfigurationState
  thresholdError: boolean
}>()

const { t } = useTranslations()
</script>

<template>
  <AccordionSection
    heading-id="threshold-heading"
    :title="t('section_title_threshold')"
    :description="t('section_title_threshold_description')"
  >
    <div class="flex flex-col text-sm text-black">
      <ThresholdInputRow
        id="warning_threshold"
        v-model="configuration.warningThreshold"
        name="warning_threshold"
        :label="t('thresholds_green')"
        dot-color-class="bg-success-500"
        :tooltip-text="t('thresholds_green_help')"
        :invalid="thresholdError"
      />

      <ThresholdInputRow
        id="critical_threshold"
        v-model="configuration.criticalThreshold"
        name="critical_threshold"
        :label="t('thresholds_orange')"
        dot-color-class="bg-warning-500"
        :tooltip-text="t('thresholds_orange_help')"
        :invalid="thresholdError"
      />

      <article class="flex items-center gap-1 px-4 py-1">
        <span class="size-2.5 rounded-full bg-danger-500 mr-1.5"></span>
        <div class="flex items-center gap-1">
          <span>{{ t('thresholds_red') }}</span>
          <InfoTooltip :text="t('thresholds_red_help')" class="ml-2" />
        </div>
      </article>
    </div>

    <p
      v-show="thresholdError"
      id="threshold_error"
      class="mt-3 rounded-lg border border-neutral-100  px-3 py-2.5 font-bold text-primary-500"
      role="alert"
    >
      {{ t('thresholds_warning') }}
    </p>
  </AccordionSection>
</template>
