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

    const { keys } = this.#didState;
    const [ key ] = keys;
    const { privateKeyJwk } = key;
    const kidFragment = privateKeyJwk.kid || key.id;
    const kid = `${this.#didState.id}#${kidFragment}`;
    const signatureInput = {
      privateJwk      : privateKeyJwk,
      protectedHeader : { alg: privateKeyJwk.crv, kid }
    };

    await this.inbound.listen(inboundPort);
    await this.outbound.listen(outboundPort, signatureInput);

    console.log(`Listening to inbound on ${inboundPort}`);
    console.log(`Listening to outbound on ${outboundPort}`);
    console.log(`Hosted DID: ${this.#didState.id}`);
  };
}