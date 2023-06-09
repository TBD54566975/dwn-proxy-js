import { DidIonApi } from '@tbd54566975/dids';
import { Inbound } from './Inbound.js';
import { Outbound } from './Outbound.js';
import { SignatureInput } from '@tbd54566975/dwn-sdk-js';

export class App {
  inbound: Inbound;
  outbound: Outbound;

  #signatureInput: SignatureInput;

  constructor () {
    this.inbound = new Inbound();
    this.outbound = new Outbound();
  }

  signature = (sig: SignatureInput) => this.#signatureInput = sig;

  listen = async (inboundPort: number, outboundPort: number) => {
    if (!this.#signatureInput) {
      const didState = await new DidIonApi().create({
        services: [{
          id              : 'dwn',
          type            : 'DecentralizedWebNode',
          serviceEndpoint : {
            nodes: [ `http://localhost:${inboundPort}` ]
          }
        }]
      });

      console.log(`Created DID and hosting: ${didState.id}`);

      const { keys } = didState;
      const [ key ] = keys;
      const { privateKeyJwk } = key;
      const kidFragment = privateKeyJwk.kid || key.id;
      const kid = `${didState.id}#${kidFragment}`;
      this.#signatureInput = {
        privateJwk      : privateKeyJwk,
        protectedHeader : { alg: privateKeyJwk.crv, kid }
      };
    }

    await this.inbound.listen(inboundPort);
    await this.outbound.listen(outboundPort, this.#signatureInput);

    console.log(`Listening to inbound on ${inboundPort}`);
    console.log(`Listening to outbound on ${outboundPort}`);
  };
}