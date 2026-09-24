<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import type { Thresholds } from '../../types/settings';

const props = defineProps({
  score: { type: [Number, String], default: null },
  thresholds: { type: Object as () => Thresholds, required: true },
});
const { locale } = useI18n();
const formattedScore = computed(() => {
  const value = props.score;
  return null !== value && undefined !== value && Number.isFinite(Number(value))
    ? new Intl.NumberFormat(locale.value.replace('_', '-'), { maximumFractionDigits: 1 }).format(
        Number(value),
      ) + '%'
    : '';
});
const scoreColor = computed(() => {
  const value = Number(props.score);

  if (value >= props.thresholds.critical) {
    return 'text-danger-500';
  }

  if (value >= props.thresholds.warning) {
    return 'text-warning-600';
  }

  return 'text-success-600';
});
</script>

<template>
  <span
    class="compilatio-document-score whitespace-nowrap text-center text-xl font-bold"
    :class="scoreColor"
  >
    {{ formattedScore }}
  </span>
</template>
