<script setup lang="ts">
import { Alert, Button } from '@elastisafe/components';
import AppHeader from '../../settings/components/organisms/AppHeader.vue';
import DeliverySettings from '../../settings/components/organisms/DeliverySettings.vue';
import PrivacySettings from '../../settings/components/organisms/PrivacySettings.vue';
import ThresholdSettings from '../../settings/components/organisms/ThresholdSettings.vue';
import SubmitFooter from '../../settings/components/organisms/SubmitFooter.vue';
import AccordionSection from '../../settings/components/molecules/AccordionSection.vue';
import CompilatioLogo from '../../img/compilatio_logo.vue';
import LetimioLogo from '../../img/letimio_logo.vue';
import { useOjsSettings } from '../../settings/ojs/useOjsSettings';
import { useTranslations } from '../../settings/lib/i18n';

const props = defineProps<{ apiUrl: string; csrfToken: string }>();
const { t } = useTranslations();
const product = window.pkpCompilatioDocuments.product;
const productStyleClass = product.id === 'compilatio' ? 'theme-magister' : 'theme-letimio';
const {
  apiKey, configuration, detections, isLoading, isSaving, loaded, hasApiKey,
  hasError, message, thresholdError, canSave, save, load, editApiKey, restoreApiKeyMask,
} = useOjsSettings(props.apiUrl, props.csrfToken);
</script>

<template>
  <main class="compilatio-settings-app min-h-screen bg-page" :class="productStyleClass">
    <div class="w-full max-w-235 mx-auto bg-white rounded-2xl border border-neutral-500">
      <AppHeader :platform="product.name" logo-url="" :allowed-file-types="[]">
        <template #logo>
          <component
            :is="product.id === 'compilatio' ? CompilatioLogo : LetimioLogo"
            class="w-32 h-16 shrink-0"
          />
        </template>
      </AppHeader>

      <div v-if="isLoading" role="status" class="flex items-center gap-3 p-6 text-sm">
        <span class="size-4 animate-spin rounded-full border-2 border-neutral-300 border-t-primary-600" aria-hidden="true"></span>
        {{ t('settings_loading') }}
      </div>

      <div v-else-if="!loaded" class="grid gap-4 p-4">
        <Alert color="danger" :description="message" role="alert" />
        <Button @click="load">{{ t('retry') }}</Button>
      </div>

      <form v-else class="grid gap-4 p-4" :aria-busy="isSaving" @submit.prevent="save">
        <fieldset class="contents" :disabled="isSaving">
          <AccordionSection heading-id="compilatio-api-key-heading" :title="t('section_title_api_key') + ' ' + product.name">
            <div class="flex flex-col gap-2 mt-6">
              <label for="compilatio-api-key" class="text-sm text-black">
                {{ t('api_key_label') }}
              </label>
              <input
                id="compilatio-api-key"
                v-model="apiKey"
                name="apiKey"
                type="text"
                autocomplete="off"
                spellcheck="false"
                @focus="editApiKey"
                @blur="restoreApiKeyMask"
                :required="!hasApiKey"
                :placeholder="hasApiKey ? t('api_key_placeholder_update') : t('api_key_placeholder')"
                class="rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-primary-500"
              />
              <p class="text-sm text-gray-500">
                {{ t('api_key_description') }}
              </p>
              <p v-if="hasApiKey" class="text-sm text-blue-600 font-medium">
                {{ t('api_key_configured') }}
              </p>
            </div>
          </AccordionSection>

          <DeliverySettings :configuration="configuration" :detections="detections" />
          <PrivacySettings :configuration="configuration" />
          <ThresholdSettings :configuration="configuration" :threshold-error="thresholdError" />
        </fieldset>

        <Alert v-if="message" :color="hasError ? 'danger' : 'success'" :description="message" role="status" />
        <p v-if="isSaving" role="status" class="px-5 text-sm">{{ t('settings_saving') }}</p>
        <fieldset class="contents" :disabled="!canSave">
          <SubmitFooter :is-modify="true" />
        </fieldset>
      </form>
    </div>
  </main>
</template>
