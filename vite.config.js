import { defineConfig } from 'vite'
import { copyFileSync, mkdirSync, existsSync } from 'fs'
import { resolve } from 'path'

export default defineConfig({
  base: '/',
  publicDir: 'public',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      input: {
        main: './index.html'
      }
    },
    copyPublicDir: true
  },
  plugins: [
    {
      name: 'copy-worklets',
      closeBundle() {
        const destDir = resolve('dist/band_pass_lfc');
        if (!existsSync(destDir)) mkdirSync(destDir, { recursive: true });
        copyFileSync(
          resolve('band_pass_lfc/processor.js'),
          resolve(destDir, 'processor.js')
        );
        // processor.js imports "../constants.js" (resolves to /constants.js)
        copyFileSync(resolve('constants.js'), resolve('dist/constants.js'));
      }
    }
  ],
  server: {
    port: 3000,
    open: true
  },
  worker: {
    format: 'iife'
  }
})
