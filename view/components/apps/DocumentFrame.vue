<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import type { PropType } from 'vue';
import type { CompilatioDocument } from '../../types/document';
import type { CompilatioDocumentsApi } from '../../types/documentsApi';
import DocumentScore from '../atoms/DocumentScore.vue';
import DocumentIndexingButton from '../molecules/DocumentIndexingButton.vue';
import DocumentAnalysisButton from '../molecules/DocumentAnalysisButton.vue';
import DocumentErrorTooltip from '../molecules/DocumentErrorTooltip.vue';
import { useDocumentActions } from '../../composables/useDocumentActions.js';
import Compilatiologo from '../../img/compilatio_magister_logo_short.vue';
import Letimiologo from '../../img/letimio_logo_short.vue';

const emit = defineEmits<{ updated: [document: CompilatioDocument] }>();
const { t } = useI18n();

type Thresholds = {
  warning: number;
  critical: number;
};

const props = defineProps({
  document: { type: Object as PropType<CompilatioDocument>, required: true },
  api: { type: Object as PropType<CompilatioDocumentsApi>, required: true },
  thresholds: { type: Object as PropType<Thresholds>, required: true },
});

const { data, pending, error, action, perform } = useDocumentActions(
  props.document,
  props.api,
  t,
  (updated) => emit('updated', updated),
);

const product = props.api.getConfig().product;
const productClassStyle = 'compilatio' === product.id ? 'service-magister' : 'service-letimio';
</script>

<template>
  <span
    class="inline-block box-border w-49 rounded-l-sm bg-neutral-100 p-1 align-middle"
    :class="productClassStyle"
    :data-status="data.status"
  >
    <span class="flex items-center gap-1">
      <span
        class="flex size-8 items-center justify-center"
        role="img"
        :aria-label="product.name + ' logo'"
      >
        <Compilatiologo v-if="'compilatio' === product.id" />
        <Letimiologo v-else />
      </span>
      <DocumentScore
        v-if="!error"
        class="min-w-10 flex-1"
        :score="data.score ?? undefined"
        :thresholds="props.thresholds"
      />
      <DocumentErrorTooltip
        v-else
        :document-id="data.submissionFileId"
        :message="error"
        :product-name="product.name"
      />
      <span 
        v-if="!error"
        class="size-9"
      >
        <DocumentIndexingButton
          v-if="data.canIndex"
          :indexed="data.indexed"
          :disabled="Boolean(pending)"
          @toggle="perform('index')"
        />
      </span>
      <span class="size-9">
        <DocumentAnalysisButton
          v-if="action"
          :action="action"
          :disabled="Boolean(pending)"
          @activate="perform"
        />
      </span>
    </span>
  </span>
</template>
