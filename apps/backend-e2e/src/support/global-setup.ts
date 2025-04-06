/* eslint-disable */
import { spawn, ChildProcess } from 'child_process';
import { join } from 'path';
import axios from 'axios';

// Declare global namespace to add __SERVER__ property
declare global {
  var __SERVER__: ChildProcess;
}

const baseUrl = 'http://localhost';
const port = 3000;

module.exports = async function () {
  // Start the backend server
  console.log('Starting backend server...');
  const serverProcess = spawn('pnpm', ['dlx', 'nx', 'serve', 'backend'], {
    stdio: 'pipe',
    shell: true,
    env: { ...process.env, PORT: port.toString() },
    cwd: join(__dirname, '..', '..', '..', '..'),
  });

  // Store the server process so we can kill it in the teardown
  global.__SERVER__ = serverProcess;

  // Wait for the server to start
  let hitTimeout = false;
  const startTimeout = setTimeout(() => (hitTimeout = true), 15000);
  let isServerRunning = false;
  while (!isServerRunning && !hitTimeout) {
    try {
      await axios.get(`${baseUrl}:${port}/api/messages`);
      isServerRunning = true;
      clearTimeout(startTimeout); // Clear the timeout if the server is running
    } catch (error) {
      // Wait a bit before trying again
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  console.log('Backend server started successfully!');

  // Set the base URL for the tests
  process.env.API_BASE_URL = `${baseUrl}:${port}`;

  console.log(`Backend server started on ${baseUrl}:${port}`);
};
