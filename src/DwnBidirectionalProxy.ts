import { SignatureInput } from '@tbd54566975/dwn-sdk-js';
import { IRestfulHandler } from './types.js';
import Http from './Http.js';
import { IOutbound, Outbound } from './Outbound.js';
import { DidIonApi } from '@tbd54566975/dids';
import DwnHttp from './DwnHttp.js';
import DwnProxy from './DwnProxy.js';

interface IRestful {
  (path: string, handler: IRestfulHandler): void;
}
interface IListen {
  (port: number): Promise<void>;
}

export class DwnBidirectionalProxy {
  #signatureInput?: SignatureInput;
  #outbound: IOutbound;

  dwn: DwnProxy;

  constructor(signatureInput?: SignatureInput) {
    this.#signatureInput = signatureInput;
    this.#outbound = new Outbound(this.#signatureInput);
    this.dwn = new DwnProxy();
  }

  post: IRestful = (path, handler) => this.#outbound.post(path, handler);

  listen: IListen = async port => {
    // TODO this is temporary
    if (!this.#signatureInput) {
      const didState = await new DidIonApi().create({
        services: [{
          id              : 'dwn',
          type            : 'DecentralizedWebNode',
          serviceEndpoint : {
            nodes: [ `http://localhost:${port}` ]
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

      this.#outbound.setKeys(this.#signatureInput);
    }

    await Http.createServer(port, async (req, res) => {
      const dwnRequest = await DwnHttp.parse(req);
      if (dwnRequest) {
        const reply = await this.dwn.handle(dwnRequest.message, dwnRequest.data);
        DwnHttp.reply(res, reply);
      } else {
        this.#outbound.handle(req, res);
        // TODO I think I can place the dwnClient here instead
      }
    });
    console.log(`Listening on port ${port}`);
  };
}