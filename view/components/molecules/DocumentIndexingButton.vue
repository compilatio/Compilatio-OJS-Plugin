<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import DocumentButton from '../atoms/DocumentButton.vue';
import { Icon } from '@elastisafe/components';

const props = defineProps({
  indexed: { type: Boolean, required: true },
  disabled: { type: Boolean, default: false },
});
defineEmits(['toggle']);
const { t } = useI18n();
const indexLabel = computed(() => t(props.indexed ? 'unindex' : 'index'));
</script>

<template>
  <DocumentButton
    class="border-neutral-200 bg-transparent text-primary-900 enabled:hover:bg-neutral-200"
    :label="indexLabel"
    :aria-label="`${t(props.indexed ? 'indexed' : 'notIndexed')} — ${indexLabel}`"
    :aria-pressed="props.indexed"
    :disabled="props.disabled"
    @click="$emit('toggle')"
  >
      <Icon :name="'books-solid'" class="size-5" />
      <span
      aria-hidden="true"
      class="absolute end-0.5 bottom-0.5 inline-flex size-3.5 items-center justify-center rounded-full"
      :class="props.indexed ? 'bg-success-200 text-success-700' : 'bg-danger-200 text-danger-700'"
    >
      <Icon :name="props.indexed ? 'check' : 'xmark'" class="size-3" />
    </span>
  </DocumentButton>
</template>
