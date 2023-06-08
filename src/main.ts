export { App } from './App.js';

import { App } from './App.js';
import { IMatchFunc, IMiddleware } from './Inbound.js';

const app = new App();

const PROTOCOL = 'https://tbdex.io/protocol';
const OFFER = 'https://tbdex.io/schemas/offering';
const RFQ = 'https://tbdex.io/schemas/RFQ';
const ORDER = 'https://tbdex.io/schemas/order';

const isOffer: IMatchFunc = ({ filter: { protocol, schema } }) =>
  protocol === PROTOCOL && schema === OFFER;
const offer: IMiddleware = async msg => {
  console.log(msg);
  /**
   * - check cache
   *    - if exists then return
   *    - else, make GET to PFI Core
   * - return offer message
   * */
  return { some: 'offer', data: 123 };
};
app.inbound.records.query(isOffer, offer);

const isRfq: IMatchFunc = ({ protocol, schema }) =>
  protocol === PROTOCOL && schema === RFQ;
const rfq: IMiddleware = async msg => {
  console.log(msg);
  // POST to the PFI backend
};
app.inbound.records.write(isRfq, rfq);

// TODO Quote outbound

const isOrder: IMatchFunc = ({ protocol, schema }) =>
  protocol === PROTOCOL && schema === ORDER;
const order: IMiddleware = async msg => {
  console.log(msg);
  // POST to the PFI backend
};
app.inbound.records.write(isOrder, order);

const INBOUND_PORT = 3000;
const OUTBOUND_PORT = 3001;
app.listen(INBOUND_PORT, OUTBOUND_PORT);