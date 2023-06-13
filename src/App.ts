import { SignatureInput } from '@tbd54566975/dwn-sdk-js';
import { IRecordsQueryHandler, IRecordsWriteHandler, IRestfulHandler } from './types.js';
import Http from './Http.js';
import { IInbound, Inbound } from './Inbound.js';
import { IOutbound, Outbound } from './Outbound.js';
import { DidIonApi } from '@tbd54566975/dids';

interface IRecords {
  query: (handler: IRecordsQueryHandler) => void;
  write: (handler: IRecordsWriteHandler) => void;
}
interface IDwn {
  records: IRecords;
}
interface IRestful {
  (path: string, handler: IRestfulHandler): void;
}
interface IListen {
  (port: number): Promise<void>;
}
export interface IApp {
  dwn: IDwn;
  post: IRestful;
  listen: IListen;
}

export class App implements IApp {
  #signatureInput?: SignatureInput;
  #inbound: IInbound;
  #outbound: IOutbound;

  constructor(signatureInput?: SignatureInput) {
    // this.#inbound = new Inbound();
    // this.#outbound = new Outbound(signatureInput);
    this.#signatureInput = signatureInput;
  }

  dwn: IDwn = {
    records: {
      query : handler => this.#inbound.recordsQuery = handler,
      write : handler => this.#inbound.recordsWrite = handler
    }
  };

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
    }

    this.#inbound = new Inbound();
    this.#outbound = new Outbound(this.#signatureInput);

    await Http.createServer(port, async (req, res) => {
      const isInbound = !!req.headers['dwn-request'];
      if (isInbound) this.#inbound.handle(req, res);
      else this.#outbound.handle(req, res);
    });
    console.log(`Listening on port ${port}`);
  };
}