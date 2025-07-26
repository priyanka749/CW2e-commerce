import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import { defineConfig } from 'vite';

// To use HTTPS, generate certificates with:
// mkdir cert
// openssl req -x509 -newkey rsa:2048 -nodes -keyout cert/localhost-key.pem -out cert/localhost.pem -days 365 -subj "/CN=localhost"

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
      // host: '0.0.0.0',
    https: {
      key: fs.readFileSync(path.resolve(__dirname, 'cert/localhost-key.pem')),
      cert: fs.readFileSync(path.resolve(__dirname, 'cert/localhost.pem')),
    },
    // port: 3000 // or your preferred port
  },
});