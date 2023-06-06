import { DidIonApi, DidState } from '@tbd54566975/dids';
import { Inbound } from './Inbound.js';
import { Outbound } from './Outbound.js';
import { Dwn, DataStoreLevel, EventLogLevel, MessageStoreLevel } from '@tbd54566975/dwn-sdk-js';

// export type IMiddleware = IInboundMiddleware | IOutboundMiddleware;

export class App {
  inbound: Inbound;
  outbound: Outbound;

  #didState: DidState;
  #dwn: Dwn;
  // middlewares: Array<IMiddleware>;

  constructor () {
    this.inbound = new Inbound();
    this.outbound = new Outbound();
  }

  // use = (middleware: IMiddleware) => {
  //   this.middlewares.push(middleware);
  // };

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

    const dataStore = new DataStoreLevel({ blockstoreLocation: 'data/DATASTORE' });
    const eventLog = new EventLogLevel({ location: 'data/EVENTLOG' });
    const messageStore = new MessageStoreLevel({
      blockstoreLocation : 'data/MESSAGESTORE',
      indexLocation      : 'data/INDEX'
    });

    this.#dwn = await Dwn.create({ eventLog, dataStore, messageStore });

    await this.inbound.listen(this.#dwn, inboundPort);

    console.log(`Listening to inbound on ${inboundPort}`);
    console.log(`Listening to outbound on ${outboundPort}`);
    console.log(`Created & receiving DID: ${this.#didState.id}`);
  };
}