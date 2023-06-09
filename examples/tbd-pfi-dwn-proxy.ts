import { App, IInboundMatchFunc, IInboundMiddleware, IOutboundMiddleware } from '../src/main.js';

const PROTOCOL = 'https://tbdex.io/protocol';

const app = new App();

//#region Offer
const OFFER = 'https://tbdex.io/schemas/offering';
type Offer = {
  some: string;
  data: number;
}
const isOffer: IInboundMatchFunc = ({ filter: { protocol, schema } }) =>
  protocol === PROTOCOL && schema === OFFER;
const offer: IInboundMiddleware<Offer> = async msg => {
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
const isRfq: IInboundMatchFunc = ({ protocol, schema }) =>
  protocol === PROTOCOL && schema === RFQ;
const rfq: IInboundMiddleware<void> = async msg => {
  console.log(msg);
  // POST to the PFI backend
};
app.inbound.records.write(isRfq, rfq);
//#endregion

//#region Quote
const quote: IOutboundMiddleware<any> = async (req) => {
  console.log(req);
  return {
    targetDid : '123',
    data      : {
      something: 123
    }
  };
};
app.outbound.post('/api/quote', quote);
//#endregion

//#region Order
const ORDER = 'https://tbdex.io/schemas/order';
const isOrder: IInboundMatchFunc = ({ protocol, schema }) =>
  protocol === PROTOCOL && schema === ORDER;
const order: IInboundMiddleware<void> = async msg => {
  console.log(msg);
  // POST to the PFI backend
};
app.inbound.records.write(isOrder, order);
//#endregion

const INBOUND_PORT = 3000;
const OUTBOUND_PORT = 3001;
app.listen(INBOUND_PORT, OUTBOUND_PORT);