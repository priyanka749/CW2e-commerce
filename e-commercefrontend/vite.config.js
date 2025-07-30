// import tailwindcss from '@tailwindcss/vite';
// import react from '@vitejs/plugin-react';
// import fs from 'fs';
// import path from 'path';
// import { defineConfig } from 'vite';
//  default defineConfig({
// //   plugins: [react(), tailwindcss(),],
// // })


import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    https: {
      key: fs.readFileSync(path.resolve(__dirname, 'cert/localhost-key.pem')),
      cert: fs.readFileSync(path.resolve(__dirname, 'cert/localhost.pem')),
    },
    port: 5173, // original Vite port
    historyApiFallback: true, // Enable SPA fallback for all routes
  },
});