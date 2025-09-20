import { createServer } from 'vite';
import { resolve } from 'path';

async function startServer() {
  const server = await createServer({
    root: resolve('.'),
    server: {
      port: 3001,
      host: true
    }
  });
  
  await server.listen();
  
  console.log('VITE server running on http://localhost:3001/');
}

startServer().catch((error) => {
  console.error('Failed to start VITE server:', error);
  process.exit(1);
});