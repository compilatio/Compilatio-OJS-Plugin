<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import type { PropType } from 'vue';
import type { DocumentAction } from '../../types/document';
import DocumentButton from '../atoms/DocumentButton.vue';
import { Icon } from '@elastisafe/components';

defineProps({
  action: { type: Object as PropType<DocumentAction>, required: true },
  disabled: { type: Boolean, default: false },
});
defineEmits(['activate']);
const { t } = useI18n();
</script>

<template>
  <DocumentButton
    class="border-transparent bg-primary-500 text-neutral-50 enabled:hover:bg-primary-700"
    :label="t(action.label)"
    :disabled="disabled || 'loading' === action.kind"
    @click="$emit('activate', action.kind)"
  >
    <Icon
      :name="action.icon"
      :class="'loading' === action.kind ? 'size-5 animate-spin motion-reduce:animate-none' : 'size-5'"
    />
  </DocumentButton>
</template>
