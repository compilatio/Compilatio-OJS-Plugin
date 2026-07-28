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
    name: "CompilatioSettingsPanel"
  };
  const _hoisted_1 = { class: "space-y-6 rounded-lg bg-white p-6 text-slate-900" };
  function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("section", _hoisted_1, [..._cache[0] || (_cache[0] = [
      vue.createElementVNode("header", { class: "space-y-5" }, [
        vue.createElementVNode("img", {
          src: _imports_0,
          alt: "Compilatio Logo",
          class: "h-12 w-auto"
        }),
        vue.createElementVNode("h3", { class: "text-lg font-semibold" }, "Paramètres Compilatio")
      ], -1)
    ])]);
  }
  const SettingsPanel = /* @__PURE__ */ _export_sfc(_sfc_main, [["render", _sfc_render]]);
  window.CompilatioSettingsPanel = SettingsPanel;
})(pkp.modules.vue);
