// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Aggiunge una regola per risolvere automaticamente i moduli Firebase corretti
  resolve: {
    mainFields: [], // Lascia che Rollup/Vite decida i campi principali
  },
  build: {
    rollupOptions: {
      output: {
        // Impedisce a Rollup di esternalizzare involontariamente Firebase
        manualChunks: undefined,
      },
    },
  },
});