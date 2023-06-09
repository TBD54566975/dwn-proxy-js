export { App } from './App.js';

import { App } from './App.js';
import { IMatchFunc, IMiddleware } from './Inbound.js';

const PROTOCOL = 'https://tbdex.io/protocol';

const app = new App();

//#region Offer
const OFFER = 'https://tbdex.io/schemas/offering';
type Offer = {
  some: string;
  data: number;
}
const isOffer: IMatchFunc = ({ filter: { protocol, schema } }) =>
  protocol === PROTOCOL && schema === OFFER;
const offer: IMiddleware<Offer> = async msg => {
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
//#endregion

//#region RFQ
const RFQ = 'https://tbdex.io/schemas/RFQ';
const isRfq: IMatchFunc = ({ protocol, schema }) =>
  protocol === PROTOCOL && schema === RFQ;
const rfq: IMiddleware<void> = async msg => {
  console.log(msg);
  // POST to the PFI backend
};
app.inbound.records.write(isRfq, rfq);
//#endregion

//#region Quote
app.outbound.post('/api/quote', async (req) => {
  console.log(req);
  return {
    targetDid : '123',
    data      : {
      something: 123
    }
  };
});
//#endregion

//#region Order
const ORDER = 'https://tbdex.io/schemas/order';
const isOrder: IMatchFunc = ({ protocol, schema }) =>
  protocol === PROTOCOL && schema === ORDER;
const order: IMiddleware<void> = async msg => {
  console.log(msg);
  // POST to the PFI backend
};
app.inbound.records.write(isOrder, order);
//#endregion

const INBOUND_PORT = 3000;
const OUTBOUND_PORT = 3001;
app.listen(INBOUND_PORT, OUTBOUND_PORT);