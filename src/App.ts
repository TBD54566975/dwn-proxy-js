import { DidIonApi } from '@tbd54566975/dids';
import { SignatureInput } from '@tbd54566975/dwn-sdk-js';
import { IRecordsQueryHandler, IRecordsWriteHandler, IRestfulHandler } from './types.js';
import { createServer } from './Http.js';
import http from 'http';

interface ISetKeys {
  (sig: SignatureInput): void;
}
interface IListen {
  (port: number): Promise<void>;
}
interface IRecords {
  query: (handler: IRecordsQueryHandler) => void;
  write: (handler: IRecordsWriteHandler) => void;
}
interface IRestful {
  (path: string, handler: IRestfulHandler): void;
}
interface IApp {
  keys: ISetKeys;
  records: IRecords;
  post: IRestful;
  listen: IListen;
}

export class App implements IApp {
  #signatureInput: SignatureInput;
  #records: {
    query: IRecordsQueryHandler;
    write: IRecordsWriteHandler;
  };
  #restful: Array<{
    method: string;
    path: string;
    handler: IRestfulHandler;
  }> = [];

  #httpHandler = async (req: http.IncomingMessage, res: http.OutgoingMessage) => {
    console.log(req, res);
  };

  keys: ISetKeys = sig => this.#signatureInput = sig;

  records: IRecords = {
    query : handler => this.#records.query = handler,
    write : handler => this.#records.write = handler
  };

  post: IRestful = (path, handler) => this.#restful.push({
    method: 'POST',
    path,
    handler
  });

  listen: IListen = async port => {
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

    await createServer(port, this.#httpHandler);

    console.log(`Listening on port ${port}`);
  };
}