export { App } from './App.js';

import { App } from './App.js';
const app = new App();
app.inbound.protocol.route('tbdex', 'offer', '/some/api/offer');
const INBOUND_PORT = 3000;
const OUTBOUND_PORT = 3001;
app.listen(INBOUND_PORT, OUTBOUND_PORT);