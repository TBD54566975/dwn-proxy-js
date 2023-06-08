import { DidIonApi, DidState } from '@tbd54566975/dids';
import { Inbound } from './Inbound.js';
import { Outbound } from './Outbound.js';

export class App {
  inbound: Inbound;
  outbound: Outbound;

  #didState: DidState;

  constructor () {
    this.inbound = new Inbound();
    this.outbound = new Outbound();
  }

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

    await this.inbound.listen(inboundPort);

    console.log(`Listening to inbound on ${inboundPort}`);
    console.log(`Listening to outbound on ${outboundPort}`);
    console.log(`Created & receiving DID: ${this.#didState.id}`);
  };
}