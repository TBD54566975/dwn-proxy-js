export { App } from './App.js';

import { App } from './App.js';
import { IMatchFunc, IMiddleware } from './Inbound.js';

const app = new App();

const isOffer: IMatchFunc = msg =>
  msg.descriptor.protocol === 'tbdex' && msg.descriptor.schema === 'offer';
const getOffer: IMiddleware = async msg => {
  console.log(msg);
  /**
   * - check cache
   *    - if exists then return
   *    - else, make GET to PFI Core
   * - return offer message
   * */
};
app.inbound.records.query(isOffer, getOffer);

const isRfq: IMatchFunc = msg =>
  msg.descriptor.protocol === 'tbdex' && msg.descriptor.schema === 'rfq';
const postRfq: IMiddleware = async msg => {
  console.log(msg);
  // POST to the PFI backend
};
app.inbound.records.write(isRfq, postRfq);

// TODO Quote outbound

const isExecute: IMatchFunc = msg =>
  msg.descriptor.protocol === 'tbdex' && msg.descriptor.schema === 'execute';
const postExecute: IMiddleware = async msg => {
  console.log(msg);
  // POST to the PFI backend
};
app.inbound.records.write(isExecute, postExecute);

const INBOUND_PORT = 3000;
const OUTBOUND_PORT = 3001;
app.listen(INBOUND_PORT, OUTBOUND_PORT);