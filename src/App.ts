import { DidIonApi, DidState } from '@tbd54566975/dids';
import { Inbound } from './Inbound.js';
import { Outbound } from './Outbound.js';
import {
  Dwn,
  DataStoreLevel,
  EventLogLevel,
  MessageStoreLevel } from '@tbd54566975/dwn-sdk-js';
import { DwnMessage } from './types.js';

export class App {
  inbound: Inbound;
  outbound: Outbound;

  #didState: DidState;
  #dwn: Dwn;

  constructor () {
    this.inbound = new Inbound();
    this.outbound = new Outbound();
  }

  #dwnProcess = (message: DwnMessage) =>
    this.#dwn.processMessage(this.#didState.id, message);

  listen = async (inboundPort: number, outboundPort: number) => {
    this.#didState = await new DidIonApi().create({
      services: [{
        id              : 'dwn',
        type            : 'DecentralizedWebNode',
        serviceEndpoint : {
          nodes: [ `http://localhost:${inboundPort}` ]
        }
      }]
    });

    this.#dwn = await Dwn.create({
      eventLog     : new EventLogLevel({ location: 'data/EVENTLOG' }),
      dataStore    : new DataStoreLevel({ blockstoreLocation: 'data/DATASTORE' }),
      messageStore : new MessageStoreLevel({
        blockstoreLocation : 'data/MESSAGESTORE',
        indexLocation      : 'data/INDEX'
      }) });

    await this.inbound.listen(inboundPort, this.#dwnProcess);

    console.log(`Listening to inbound on ${inboundPort}`);
    console.log(`Listening to outbound on ${outboundPort}`);
    console.log(`Created & receiving DID: ${this.#didState.id}`);
  };
}