import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react()],
    // Reemplaza 'nombre-de-tu-repo' con el nombre exacto de tu repositorio en GitHub
    base: '/Mug-Studio/', 
    define: {
      // Esto permite que 'process.env.API_KEY' funcione en producción
      'process.env.API_KEY': JSON.stringify(env.API_KEY)
    }
  };
});