import { createApp } from './app.js';
import { env } from './lib/env.js';

const app = createApp();

app.listen(env.apiPort, () => {
  console.log(`EasyInvoice API listening on http://localhost:${env.apiPort}`);
});
