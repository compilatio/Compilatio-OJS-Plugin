<script setup lang="ts">
import type { ConfigurationState } from '../../types'
import AccordionSection from '../molecules/AccordionSection.vue'
import RadioCard from '../atoms/RadioCard.vue'
import { useTranslations } from '../../lib/i18n'

defineProps<{
  configuration: ConfigurationState
}>()

const { t } = useTranslations()
</script>

<template>
  <AccordionSection heading-id="privacy-heading" :title="t('section_title_privacy')">
    <h2 class="mt-6 mb-2 primary-text text-sm font-bold">{{ t('privacy_library_title') }}</h2>
    <div class="flex flex-col gap-2 px-4 py-2">
      <RadioCard v-model="configuration.defaultIndexing" name="default_indexing" :value="true" :title="t('privacy_index_title')">
        {{ t('privacy_index_description') }}
      </RadioCard>
      <RadioCard v-model="configuration.defaultIndexing" name="default_indexing" :value="false" :title="t('privacy_no_index_title')">
        {{ t('privacy_no_index_description') }}
      </RadioCard>
    </div>
  </AccordionSection>
</template>
