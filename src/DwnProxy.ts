import {
  DwnHttpServer,
  DwnMessage,
  IPreProcess,
  IRequestListener } from './dwn-http-server-js/DwnHttpServer.js';
import { SignatureInput } from '@tbd54566975/dwn-sdk-js';
import http from 'http';
import url from 'url';
import { DwnHttpClient } from './dwn-http-client-js/DwnHttpClient.js';
import { DidIonApi } from '@tbd54566975/dids';

type DwnRecord = {
  todo: string; // todo
}
interface IRecordsQuery {
  (message: DwnMessage): Promise<void | DwnRecord>;
}
interface IRecordsWrite {
  (message: DwnMessage, data: any): Promise<boolean>;
}
interface IRecords {
  query: (handler: IRecordsQuery) => void;
  write: (handler: IRecordsWrite) => void;
}
interface IDwn {
  records: IRecords;
}
interface IRestful {
  (req: http.IncomingMessage): Promise<void | DwnRecord>;
}
interface IPost {
  (path: string, handler: IRestful): void;
}
interface IRestfulHandler {
  method: string;
  path: string;
  handler: IRestful
}

type Options = Partial<{
  signatureInput: SignatureInput
}>;
export type DwnProxyOptions = Options;

export class DwnProxy {
  #options: Options;

  #server: DwnHttpServer;
  #client: DwnHttpClient;

  #recordsQuery: IRecordsQuery;
  #recordsWrite: IRecordsWrite;
  #restfulHandlers: Array<IRestfulHandler> = [];

  dwn: IDwn = {
    records: {
      query : handler => this.#recordsQuery = handler,
      write : handler => this.#recordsWrite = handler
    }
  };

  post: IPost = (path, handler) => this.#restfulHandlers.push({ method: 'POST', path, handler });

  #inbound: IPreProcess = async dwnRequest => {
    const interfaceMethod = `${dwnRequest.message.descriptor.interface}${dwnRequest.message.descriptor.method}`;
    if (interfaceMethod === 'RecordsQuery') {
      const record = await this.#recordsQuery(dwnRequest.message);
      if (record) {
        return {}; // todo reply
      }
    } else if (interfaceMethod === 'RecordsWrite') {
      const isValid = await this.#recordsWrite(dwnRequest.message, dwnRequest.data);
      return { halt: !isValid };
    } else {
      console.error('Interface method not supported', interfaceMethod);
      return { halt: true };
    }
  };

  #outbound: IRequestListener = async (req, res) => {
    try {
      const path = url.parse(req.url as string).pathname;
      const restfulHandler = this.#restfulHandlers.find(x => x.method === req.method && x.path === path);

      if (!restfulHandler) {
        res.statusCode = 404;
      } else {
        const record = await restfulHandler.handler(req);
        if (record)
          this.#client.send('some-did', record);
        res.statusCode = 202;
      }
    } catch (err) {
      console.error(err);
      res.statusCode = 500;
    }

    res.end();
  };

  listen = async (port: number, options?: Options) => {
    this.#options = options ?? {};

    // TODO this is temporary
    if (!this.#options.signatureInput) {
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
      this.#options.signatureInput = {
        privateJwk      : privateKeyJwk,
        protectedHeader : { alg: privateKeyJwk.crv, kid }
      };
    }

    this.#client = new DwnHttpClient({
      signatureInput: this.#options.signatureInput
    });

    this.#server = new DwnHttpServer();
    this.#server.listen(port, {
      fallback   : this.#outbound,
      dwnProcess : {
        preProcess: this.#inbound
      }
    });
  };
}