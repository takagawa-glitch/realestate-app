import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Vite の設定（React プラグインを利用）
export default defineConfig({
  plugins: [react()],
})
