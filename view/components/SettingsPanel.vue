<script>
export default {
  name: 'CompilatioSettingsPanel',

  data() {
    return {
      apiKey: '',
      apiUrl: '',
      analysisLaunchMode: 'manual',
      automaticIndexingEnabled: false,
      csrfToken: '',
      hasError: false,
      isLoading: true,
      isSaving: false,
      message: '',
      scheduledAnalysisAt: '',
      launchModes: [
        {
          value: 'automatic',
          label: 'Automatique',
          description: 'L’analyse démarre automatiquement dès que le document est indexé.',
        },
        {
          value: 'manual',
          label: 'Manuel',
          description: 'Un utilisateur autorisé déclenche lui-même chaque analyse.',
        },
        {
          value: 'scheduled',
          label: 'Planifié',
          description: 'Les analyses démarrent à la date et à l’heure configurées.',
        },
      ],
    };
  },

  computed: {
    canSave() {
      if (!this.apiKey && !this.apiKey.trim()) {
        return false;
      }

      return this.analysisLaunchMode !== 'scheduled' || Boolean(this.scheduledAnalysisAt);
    },
  },

  mounted() {
    const root = this.$el.closest('#compilatioSettingsPanelRoot');

    if (!root) {
      this.hasError = true;
      this.isLoading = false;
      this.message = 'Impossible de charger la configuration du plugin.';
      return;
    }

    this.apiUrl = root.dataset.apiUrl || '';
    this.csrfToken = root.dataset.csrfToken || '';
    this.loadSettings();
  },

  methods: {
    async loadSettings() {
        console.log(this.apiUrl);

      if (!this.apiUrl) {
        this.hasError = true;
        this.isLoading = false;
        this.message = 'L’URL de l’API de configuration est absente.';
        return;
      }

      try {
        const response = await fetch(this.apiUrl, {
          credentials: 'same-origin',
          headers: {
            Accept: 'application/json',
          },
        });
        const result = await response.json();

        if (!response.ok) {
          throw new Error(
            this.getErrorMessage(
              result,
              'Impossible de charger la configuration.',
            ),
          );
        }

        this.apiKey = result.apiKey || '';

        this.automaticIndexingEnabled = result.automaticIndexingEnabled === true;
        this.analysisLaunchMode = result.analysisLaunchMode || 'manual';
        this.scheduledAnalysisAt = this.toLocalDateTime(result.scheduledAnalysisAt);
      } catch (error) {
        this.hasError = true;
        this.message = error.message || 'Impossible de charger la configuration.';
      } finally {
        this.isLoading = false;
      }
    },

    async saveSettings() {
      const apiKey = this.apiKey.trim();

      if (!this.apiUrl || !this.csrfToken || !this.canSave) {
        this.hasError = true;
        this.message = 'Les informations de sécurité et la date planifiée sont obligatoires.';
        return;
      }

      this.hasError = false;
      this.isSaving = true;
      this.message = '';

      try {
        const response = await fetch(this.apiUrl, {
          method: 'PUT',
          credentials: 'same-origin',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            'X-Csrf-Token': this.csrfToken,
          },
          body: JSON.stringify({
            ...(apiKey ? { apiKey } : {}),
            automaticIndexingEnabled: this.automaticIndexingEnabled,
            analysisLaunchMode: this.analysisLaunchMode,
            scheduledAnalysisAt:
              this.analysisLaunchMode === 'scheduled'
                ? new Date(this.scheduledAnalysisAt).toISOString()
                : null,
          }),
        });
        const result = await response.json();

        if (!response.ok) {
          throw new Error(
            this.getErrorMessage(
              result,
              'Impossible d’enregistrer la clé API.',
            ),
          );
        }

        this.apiKey = result.apiKey || '';
        this.automaticIndexingEnabled = result.automaticIndexingEnabled === true;
        this.analysisLaunchMode = result.analysisLaunchMode || 'manual';
        this.scheduledAnalysisAt = this.toLocalDateTime(result.scheduledAnalysisAt);
        this.message = 'Les paramètres ont été enregistrés.';
      } catch (error) {
        this.hasError = true;
        this.message = error.message || 'Impossible d’enregistrer la clé API.';
      } finally {
        this.isSaving = false;
      }
    },

    getErrorMessage(result, fallback) {
      if (typeof result?.errorMessage === 'string') {
        return result.errorMessage;
      }

      if (typeof result?.error === 'string') {
        return result.error;
      }

      const firstError = result?.errors
        ? Object.values(result.errors).flat()[0]
        : null;

      return typeof firstError === 'string' ? firstError : fallback;
    },

    toLocalDateTime(value) {
      if (!value) {
        return '';
      }

      const date = new Date(value);
      const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);

      return localDate.toISOString().slice(0, 16);
    },
  },
};
</script>

<template>
  <section class="space-y-6 rounded-lg bg-white p-6 text-slate-900">
    <header class="space-y-5">
      <img
        src="../img/compilatio_logo.svg"
        alt="Compilatio Logo"
        class="h-12 w-auto"
      />
      <h3 class="text-lg font-semibold">Paramètres Compilatio</h3>
    </header>

    <form class="space-y-5" @submit.prevent="saveSettings">
      <div class="space-y-2">
        <label for="compilatio-api-key" class="block text-sm font-medium">
          Clé API Compilatio
        </label>

        <input
          id="compilatio-api-key"
          v-model="apiKey"
          type="text"
          name="apiKey"
          class="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
          :placeholder="apiKey ? 'Clé configurée — saisir une nouvelle valeur pour la remplacer' : 'Saisir la clé API'"
          :disabled="isLoading || isSaving"
        />

        <p class="text-sm text-slate-600">
          <template v-if="isLoading">
            Chargement de la configuration…
          </template>
          <template v-else-if="apiKey">
            Une clé API est actuellement configurée.
          </template>
          <template v-else>
            Aucune clé API n’est configurée pour cette revue.
          </template>
        </p>
      </div>

      <div v-if="apiKey" class="space-y-5">
        <div class="rounded-md border border-slate-200 p-4">
          <label class="flex cursor-pointer items-start gap-3">
            <input
              v-model="automaticIndexingEnabled"
              type="checkbox"
              class="mt-1 h-4 w-4 rounded border-slate-300 text-blue-700 focus:ring-blue-600"
              :disabled="isLoading || isSaving"
            />
            <span>
              <strong class="block text-sm font-medium">
                Activer l’indexation automatique
              </strong>
              <span class="block text-sm text-slate-600">
                Les documents éligibles pourront être envoyés automatiquement à Compilatio.
              </span>
            </span>
          </label>
        </div>

        <fieldset class="space-y-3">
          <legend class="text-sm font-medium">
            Mode de lancement des analyses
          </legend>

          <label
            v-for="mode in launchModes"
            :key="mode.value"
            class="flex cursor-pointer items-start gap-3 rounded-md border border-slate-200 p-3"
          >
            <input
              v-model="analysisLaunchMode"
              type="radio"
              name="analysisLaunchMode"
              :value="mode.value"
              class="mt-1 h-4 w-4 border-slate-300 text-blue-700 focus:ring-blue-600"
              :disabled="isLoading || isSaving"
            />
            <span>
              <strong class="block text-sm font-medium">{{ mode.label }}</strong>
              <span class="block text-sm text-slate-600">{{ mode.description }}</span>
            </span>
          </label>
        </fieldset>

        <div v-if="analysisLaunchMode === 'scheduled'" class="space-y-2">
          <label for="compilatio-scheduled-at" class="block text-sm font-medium">
            Date et heure de lancement
          </label>
          <input
            id="compilatio-scheduled-at"
            v-model="scheduledAnalysisAt"
            type="datetime-local"
            class="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
            :disabled="isLoading || isSaving"
            required
          />
          <p class="text-sm text-slate-600">
            La date est saisie dans le fuseau horaire de votre navigateur.
          </p>
        </div>
      </div>

      <p
        v-if="message"
        role="status"
        class="rounded-md px-3 py-2 text-sm"
        :class="hasError ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'"
      >
        {{ message }}
      </p>

      <button
        type="submit"
        class="rounded-md bg-blue-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
        :disabled="isLoading || isSaving || !canSave"
      >
        {{
          isSaving
            ? 'Enregistrement…'
              : apiKey
              ? 'Enregistrer les paramètres'
              : 'Valider et enregistrer la clé'
        }}
      </button>
    </form>
  </section>
</template>
