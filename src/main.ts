export { App } from './App.js';

import { App } from './App.js';
const app = new App();
const INBOUND_PORT = 3000;
const OUTBOUND_PORT = 3001;
app.listen(INBOUND_PORT, OUTBOUND_PORT);