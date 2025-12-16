import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  // Using '.' instead of process.cwd() avoids TypeScript errors when Node types are not fully loaded
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react()],
    define: {
      // This allows the app to access process.env.API_KEY as defined in the code guidelines
      'process.env.API_KEY': JSON.stringify(env.API_KEY)
    }
  }
})