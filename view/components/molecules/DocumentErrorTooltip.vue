<script setup lang="ts">
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';

const props = defineProps({
  documentId: { type: Number, required: true },
  message: { type: String, required: true },
  productName: { type: String, required: true },
});
const { t } = useI18n();
const tooltipOpen = ref(false);
const tooltipDismissed = ref(false);
const tooltipId = computed(() => `compilatio-error-${props.documentId}`);

function showTooltip() {
  tooltipDismissed.value = false;
  tooltipOpen.value = true;
}

function hideTooltip() {
  tooltipOpen.value = false;
}

function dismissTooltip() {
  tooltipDismissed.value = true;
}
</script>

<template>
  <span
    class="relative w-full text-center"
    aria-live="polite"
    @mouseenter="showTooltip"
    @mouseleave="hideTooltip"
  >
    <button
      type="button"
      class="cursor-help border-0 bg-transparent p-0.5 font-sans text-xs text-danger-700 underline decoration-dotted compilatio-focus"
      :aria-describedby="tooltipId"
      @focus="showTooltip"
      @blur="hideTooltip"
      @click="showTooltip"
      @keydown.esc="dismissTooltip"
    >
      {{ t('apiError', { productName: props.productName }) }}
    </button>
    <span
      :id="tooltipId"
      role="tooltip"
      :class="tooltipOpen && !tooltipDismissed ? 'block' : 'hidden'"
      class="compilatio-tooltip"
      >{{ message }}</span
    >
  </span>
</template>
