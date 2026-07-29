(function(vue) {
  "use strict";
  const _imports_0 = "data:image/svg+xml,%3c?xml%20version='1.0'%20encoding='UTF-8'?%3e%3csvg%20id='Calque_1'%20data-name='Calque%201'%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%201509.47%20214'%3e%3cdefs%3e%3cstyle%3e%20.cls-1%20{%20fill:%20%23ef83b3;%20}%20.cls-2%20{%20fill:%20%23e62d38;%20}%20%3c/style%3e%3c/defs%3e%3cg%3e%3cpath%20class='cls-2'%20d='M98.65,114.47c-6.1-6.15-14.77-9.72-24.81-9.72-20.09,0-34.65,14.67-34.65,34.89s14.57,34.89,34.65,34.89c10.04,0,18.71-3.57,24.81-9.91l27.57,27.36c-13.39,13.48-31.9,22.01-52.38,22.01C33.08,214,0,180.69,0,139.65s33.08-74.35,73.84-74.35c20.28,0,38.59,8.13,51.98,21.61l-27.17,27.56Z'/%3e%3cpath%20class='cls-2'%20d='M221.98,65.31c40.76,0,73.84,33.51,73.84,74.55s-33.08,74.15-73.84,74.15-73.65-33.11-73.65-74.15,32.88-74.55,73.65-74.55ZM221.98,104.16c-19.3,0-35.05,15.86-35.05,35.49s15.75,35.49,35.05,35.49,35.25-16.06,35.25-35.49-15.75-35.49-35.25-35.49Z'/%3e%3cpath%20class='cls-2'%20d='M406.67,120.42l60.06-55.12h17.53v148.7h-38.99v-76.33l-38.59,35.49-38.79-35.29v76.13h-38.99V65.31h17.53l60.25,55.12Z'/%3e%3cpath%20class='cls-2'%20d='M530.28,65.31h62.22c29.93,0,54.35,24.58,54.35,54.72s-24.22,54.52-53.56,54.52h-24.22v39.45h-38.79V65.31ZM568.82,140.84h19.22c11.82,0,21.27-9.32,21.27-21.21s-9.45-21.41-21.27-21.41h-19.22v42.63Z'/%3e%3cpath%20class='cls-2'%20d='M680.42,65.31h38.79v148.7h-38.79V65.31Z'/%3e%3cpath%20class='cls-2'%20d='M873.77,214l68.92-148.7h17.53l69.51,148.7h-38.79l-9.06-19.43h-60.45l-8.86,19.43h-38.79ZM936.58,161.66h30.13l-14.96-32.71-15.16,32.71Z'/%3e%3cpath%20class='cls-2'%20d='M1036.24,65.31h116.37v38.66h-39.19v110.03h-38.79v-110.03h-38.4v-38.66Z'/%3e%3cpath%20class='cls-2'%20d='M1191.29,65.31h38.79v148.7h-38.79V65.31Z'/%3e%3cpath%20class='cls-2'%20d='M1346.39,65.31c40.76,0,73.84,33.51,73.84,74.55s-33.08,74.15-73.84,74.15-73.64-33.11-73.64-74.15,32.88-74.55,73.64-74.55ZM1346.39,104.16c-19.3,0-35.05,15.86-35.05,35.49s15.75,35.49,35.05,35.49,35.25-16.06,35.25-35.49-15.75-35.49-35.25-35.49Z'/%3e%3cpolygon%20class='cls-2'%20points='804.5%20174.75%20804.5%2065.31%20765.71%2065.31%20765.71%20214%20836.88%20214%20855.57%20174.75%20804.5%20174.75'/%3e%3c/g%3e%3cg%3e%3cpolygon%20class='cls-2'%20points='1509.47%2065.25%201509.46%2065.26%201509.47%2065.26%201509.47%2065.25'/%3e%3cpolygon%20class='cls-2'%20points='1444.21%200%201444.21%2065.26%201509.46%2065.26%201509.47%2065.25%201509.47%200%201444.21%200'/%3e%3c/g%3e%3cpolygon%20class='cls-1'%20points='1471.55%2065.26%201509.46%2065.26%201471.55%20103.16%201471.55%2065.26'/%3e%3c/svg%3e";
  const _export_sfc = (sfc, props) => {
    const target = sfc.__vccOpts || sfc;
    for (const [key, val] of props) {
      target[key] = val;
    }
    return target;
  };
  const _sfc_main = {
    name: "CompilatioSettingsPanel",
    data() {
      return {
        apiKey: "",
        apiUrl: "",
        analysisLaunchMode: "manual",
        automaticIndexingEnabled: false,
        csrfToken: "",
        hasError: false,
        isLoading: true,
        isSaving: false,
        message: "",
        scheduledAnalysisAt: "",
        launchModes: [
          {
            value: "automatic",
            label: "Automatique",
            description: "L’analyse démarre automatiquement dès que le document est indexé."
          },
          {
            value: "manual",
            label: "Manuel",
            description: "Un utilisateur autorisé déclenche lui-même chaque analyse."
          },
          {
            value: "scheduled",
            label: "Planifié",
            description: "Les analyses démarrent à la date et à l’heure configurées."
          }
        ]
      };
    },
    computed: {
      canSave() {
        if (!this.apiKey && !this.apiKey.trim()) {
          return false;
        }
        return this.analysisLaunchMode !== "scheduled" || Boolean(this.scheduledAnalysisAt);
      }
    },
    mounted() {
      const root = this.$el.closest("#compilatioSettingsPanelRoot");
      if (!root) {
        this.hasError = true;
        this.isLoading = false;
        this.message = "Impossible de charger la configuration du plugin.";
        return;
      }
      this.apiUrl = root.dataset.apiUrl || "";
      this.csrfToken = root.dataset.csrfToken || "";
      this.loadSettings();
    },
    methods: {
      async loadSettings() {
        console.log(this.apiUrl);
        if (!this.apiUrl) {
          this.hasError = true;
          this.isLoading = false;
          this.message = "L’URL de l’API de configuration est absente.";
          return;
        }
        try {
          const response = await fetch(this.apiUrl, {
            credentials: "same-origin",
            headers: {
              Accept: "application/json"
            }
          });
          const result = await response.json();
          if (!response.ok) {
            throw new Error(
              this.getErrorMessage(
                result,
                "Impossible de charger la configuration."
              )
            );
          }
          this.apiKey = result.apiKey || "";
          this.automaticIndexingEnabled = result.automaticIndexingEnabled === true;
          this.analysisLaunchMode = result.analysisLaunchMode || "manual";
          this.scheduledAnalysisAt = this.toLocalDateTime(result.scheduledAnalysisAt);
        } catch (error) {
          this.hasError = true;
          this.message = error.message || "Impossible de charger la configuration.";
        } finally {
          this.isLoading = false;
        }
      },
      async saveSettings() {
        const apiKey = this.apiKey.trim();
        if (!this.apiUrl || !this.csrfToken || !this.canSave) {
          this.hasError = true;
          this.message = "Les informations de sécurité et la date planifiée sont obligatoires.";
          return;
        }
        this.hasError = false;
        this.isSaving = true;
        this.message = "";
        try {
          const response = await fetch(this.apiUrl, {
            method: "PUT",
            credentials: "same-origin",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
              "X-Csrf-Token": this.csrfToken
            },
            body: JSON.stringify({
              ...apiKey ? { apiKey } : {},
              automaticIndexingEnabled: this.automaticIndexingEnabled,
              analysisLaunchMode: this.analysisLaunchMode,
              scheduledAnalysisAt: this.analysisLaunchMode === "scheduled" ? new Date(this.scheduledAnalysisAt).toISOString() : null
            })
          });
          const result = await response.json();
          if (!response.ok) {
            throw new Error(
              this.getErrorMessage(
                result,
                "Impossible d’enregistrer la clé API."
              )
            );
          }
          this.apiKey = result.apiKey || "";
          this.automaticIndexingEnabled = result.automaticIndexingEnabled === true;
          this.analysisLaunchMode = result.analysisLaunchMode || "manual";
          this.scheduledAnalysisAt = this.toLocalDateTime(result.scheduledAnalysisAt);
          this.message = result.message || "Les paramètres ont été enregistrés.";
        } catch (error) {
          this.hasError = true;
          this.message = error.message || "Impossible d’enregistrer la clé API.";
        } finally {
          this.isSaving = false;
        }
      },
      getErrorMessage(result, fallback) {
        if (typeof (result == null ? void 0 : result.errorMessage) === "string") {
          return result.errorMessage;
        }
        if (typeof (result == null ? void 0 : result.error) === "string") {
          return result.error;
        }
        const firstError = (result == null ? void 0 : result.errors) ? Object.values(result.errors).flat()[0] : null;
        return typeof firstError === "string" ? firstError : fallback;
      },
      toLocalDateTime(value) {
        if (!value) {
          return "";
        }
        const date = new Date(value);
        const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 6e4);
        return localDate.toISOString().slice(0, 16);
      }
    }
  };
  const _hoisted_1 = { class: "space-y-6 rounded-lg bg-white p-6 text-slate-900" };
  const _hoisted_2 = { class: "space-y-2" };
  const _hoisted_3 = ["placeholder", "disabled"];
  const _hoisted_4 = { class: "text-sm text-slate-600" };
  const _hoisted_5 = {
    key: 0,
    class: "space-y-5"
  };
  const _hoisted_6 = { class: "rounded-md border border-slate-200 p-4" };
  const _hoisted_7 = { class: "flex cursor-pointer items-start gap-3" };
  const _hoisted_8 = ["disabled"];
  const _hoisted_9 = { class: "space-y-3" };
  const _hoisted_10 = ["value", "disabled"];
  const _hoisted_11 = { class: "block text-sm font-medium" };
  const _hoisted_12 = { class: "block text-sm text-slate-600" };
  const _hoisted_13 = {
    key: 0,
    class: "space-y-2"
  };
  const _hoisted_14 = ["disabled"];
  const _hoisted_15 = ["disabled"];
  function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("section", _hoisted_1, [
      _cache[10] || (_cache[10] = vue.createElementVNode("header", { class: "space-y-5" }, [
        vue.createElementVNode("img", {
          src: _imports_0,
          alt: "Compilatio Logo",
          class: "h-12 w-auto"
        }),
        vue.createElementVNode("h3", { class: "text-lg font-semibold" }, "Paramètres Compilatio")
      ], -1)),
      vue.createElementVNode("form", {
        class: "space-y-5",
        onSubmit: _cache[4] || (_cache[4] = vue.withModifiers((...args) => $options.saveSettings && $options.saveSettings(...args), ["prevent"]))
      }, [
        vue.createElementVNode("div", _hoisted_2, [
          _cache[5] || (_cache[5] = vue.createElementVNode("label", {
            for: "compilatio-api-key",
            class: "block text-sm font-medium"
          }, " Clé API Compilatio ", -1)),
          vue.withDirectives(vue.createElementVNode("input", {
            id: "compilatio-api-key",
            "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => $data.apiKey = $event),
            type: "text",
            name: "apiKey",
            class: "w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20",
            placeholder: $data.apiKey ? "Clé configurée — saisir une nouvelle valeur pour la remplacer" : "Saisir la clé API",
            disabled: $data.isLoading || $data.isSaving
          }, null, 8, _hoisted_3), [
            [vue.vModelText, $data.apiKey]
          ]),
          vue.createElementVNode("p", _hoisted_4, [
            $data.isLoading ? (vue.openBlock(), vue.createElementBlock(vue.Fragment, { key: 0 }, [
              vue.createTextVNode(" Chargement de la configuration… ")
            ], 64)) : $data.apiKey ? (vue.openBlock(), vue.createElementBlock(vue.Fragment, { key: 1 }, [
              vue.createTextVNode(" Une clé API est actuellement configurée. ")
            ], 64)) : (vue.openBlock(), vue.createElementBlock(vue.Fragment, { key: 2 }, [
              vue.createTextVNode(" Aucune clé API n’est configurée pour cette revue. ")
            ], 64))
          ])
        ]),
        $data.apiKey ? (vue.openBlock(), vue.createElementBlock("div", _hoisted_5, [
          vue.createElementVNode("div", _hoisted_6, [
            vue.createElementVNode("label", _hoisted_7, [
              vue.withDirectives(vue.createElementVNode("input", {
                "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => $data.automaticIndexingEnabled = $event),
                type: "checkbox",
                class: "mt-1 h-4 w-4 rounded border-slate-300 text-blue-700 focus:ring-blue-600",
                disabled: $data.isLoading || $data.isSaving
              }, null, 8, _hoisted_8), [
                [vue.vModelCheckbox, $data.automaticIndexingEnabled]
              ]),
              _cache[6] || (_cache[6] = vue.createElementVNode("span", null, [
                vue.createElementVNode("strong", { class: "block text-sm font-medium" }, " Activer l’indexation automatique "),
                vue.createElementVNode("span", { class: "block text-sm text-slate-600" }, " Les documents éligibles pourront être envoyés automatiquement à Compilatio. ")
              ], -1))
            ])
          ]),
          vue.createElementVNode("fieldset", _hoisted_9, [
            _cache[7] || (_cache[7] = vue.createElementVNode("legend", { class: "text-sm font-medium" }, " Mode de lancement des analyses ", -1)),
            (vue.openBlock(true), vue.createElementBlock(vue.Fragment, null, vue.renderList($data.launchModes, (mode) => {
              return vue.openBlock(), vue.createElementBlock("label", {
                key: mode.value,
                class: "flex cursor-pointer items-start gap-3 rounded-md border border-slate-200 p-3"
              }, [
                vue.withDirectives(vue.createElementVNode("input", {
                  "onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => $data.analysisLaunchMode = $event),
                  type: "radio",
                  name: "analysisLaunchMode",
                  value: mode.value,
                  class: "mt-1 h-4 w-4 border-slate-300 text-blue-700 focus:ring-blue-600",
                  disabled: $data.isLoading || $data.isSaving
                }, null, 8, _hoisted_10), [
                  [vue.vModelRadio, $data.analysisLaunchMode]
                ]),
                vue.createElementVNode("span", null, [
                  vue.createElementVNode("strong", _hoisted_11, vue.toDisplayString(mode.label), 1),
                  vue.createElementVNode("span", _hoisted_12, vue.toDisplayString(mode.description), 1)
                ])
              ]);
            }), 128))
          ]),
          $data.analysisLaunchMode === "scheduled" ? (vue.openBlock(), vue.createElementBlock("div", _hoisted_13, [
            _cache[8] || (_cache[8] = vue.createElementVNode("label", {
              for: "compilatio-scheduled-at",
              class: "block text-sm font-medium"
            }, " Date et heure de lancement ", -1)),
            vue.withDirectives(vue.createElementVNode("input", {
              id: "compilatio-scheduled-at",
              "onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => $data.scheduledAnalysisAt = $event),
              type: "datetime-local",
              class: "rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20",
              disabled: $data.isLoading || $data.isSaving,
              required: ""
            }, null, 8, _hoisted_14), [
              [vue.vModelText, $data.scheduledAnalysisAt]
            ]),
            _cache[9] || (_cache[9] = vue.createElementVNode("p", { class: "text-sm text-slate-600" }, " La date est saisie dans le fuseau horaire de votre navigateur. ", -1))
          ])) : vue.createCommentVNode("", true)
        ])) : vue.createCommentVNode("", true),
        $data.message ? (vue.openBlock(), vue.createElementBlock("p", {
          key: 1,
          role: "status",
          class: vue.normalizeClass(["rounded-md px-3 py-2 text-sm", $data.hasError ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"])
        }, vue.toDisplayString($data.message), 3)) : vue.createCommentVNode("", true),
        vue.createElementVNode("button", {
          type: "submit",
          class: "rounded-md bg-blue-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50",
          disabled: $data.isLoading || $data.isSaving || !$options.canSave
        }, vue.toDisplayString($data.isSaving ? "Enregistrement…" : $data.apiKey ? "Enregistrer les paramètres" : "Valider et enregistrer la clé"), 9, _hoisted_15)
      ], 32)
    ]);
  }
  const SettingsPanel = /* @__PURE__ */ _export_sfc(_sfc_main, [["render", _sfc_render]]);
  window.CompilatioSettingsPanel = SettingsPanel;
})(pkp.modules.vue);
