// vite.config.ts

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import legacy from '@vitejs/plugin-legacy' // <-- Import

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    legacy({ // <-- Add the plugin
      targets: ['defaults', 'not IE 11'] // You can configure supported browsers
    })
  ],
  // You can remove the build object or leave it; the legacy plugin is more important
  // build: {
  //   target: 'es2015' 
  // }
})