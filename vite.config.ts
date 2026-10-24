/// <reference types="vitest" />
import { defineConfig, Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { createRAGApiMiddleware } from './server/apiMiddleware'

function ragServerPlugin(): Plugin {
  return {
    name: 'rag-server-api',
    configureServer(server) {
      server.middlewares.use(createRAGApiMiddleware());
    },
    configurePreviewServer(server) {
      server.middlewares.use(createRAGApiMiddleware());
    }
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), ragServerPlugin()],
  server: {
    port: 3000,
    open: false
  },
  preview: {
    port: 3000
  },
  test: {
    testTimeout: 90000,
    hookTimeout: 90000
  }
})
