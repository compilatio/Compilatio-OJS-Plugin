import { resolve } from 'node:path';
import vue from '@vitejs/plugin-vue';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
    __VUE_I18N_FULL_INSTALL__: true,
    __VUE_I18N_LEGACY_API__: false,
    __INTLIFY_PROD_DEVTOOLS__: false,
  },

  plugins: [
    vue(),
    tailwindcss(),
  ],

  build: {
    emptyOutDir: false,
    lib: {
      entry: resolve(__dirname, 'view/PlagiarismPanel.entry.js'),
      name: 'CompilatioPlagiarismPanelRuntime',
      formats: ['iife'],
      fileName: () => 'PlagiarismPanel.runtime.js',
    },
    minify: false,
    outDir: resolve(__dirname, 'view/build'),
    rollupOptions: {
      external: ['vue'],
      output: {
        extend: true,
        globals: {
          vue: 'pkp.modules.vue',
        },
      },
    },
  },
});
