<script setup lang="ts">
import { Button } from '@elastisafe/components'
import { useTranslations } from '../../lib/i18n'

defineProps<{
  isModify: boolean
}>()

const { t } = useTranslations()
</script>

<template>
  <footer
    class="flex items-stretch justify-between gap-4 px-5 py-4"
  >
    <div>
      <strong class="block text-sm">
        {{ isModify ? t('submit_save_title') : t('submit_ready_title') }}
      </strong>
      <p class="mt-1 text-xs text-muted">
        {{ t('submit_footer_help') }}
      </p>
    </div>
    <Button type="submit">
      {{ isModify ? t('save') : t('submit_add_button') }}
    </Button>
  </footer>
</template>
