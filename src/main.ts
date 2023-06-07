export { App } from './App.js';

import { App } from './App.js';
import { IMatchFunc } from './Inbound.js';

const app = new App();

const isRfq: IMatchFunc = msg =>
  msg.descriptor.protocol === 'tbdex' && msg.descriptor.schema === 'rfq';
app.inbound.records.write(isRfq, '/some/api/rfq');

const INBOUND_PORT = 3000;
const OUTBOUND_PORT = 3001;
app.listen(INBOUND_PORT, OUTBOUND_PORT);