import { defineConfig } from 'vite'
import { copyFileSync, mkdirSync } from 'fs'
import { resolve } from 'path'

export default defineConfig({
  base: '/grepaudio/',
  publicDir: 'public',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      input: {
        main: './index.html'
      }
    },
    // Copy additional files after build
    copyPublicDir: true
  },
  server: {
    port: 3000,
    open: true
  },
  // Ensure workers and non-module scripts are included
  worker: {
    format: 'iife'
  }
})
