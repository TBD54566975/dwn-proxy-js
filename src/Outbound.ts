import { IRestfulHandler, IHttpHandle } from './types.js';
import url from 'url';
import { SignatureInput } from '@tbd54566975/dwn-sdk-js';
import DwnClient from './DwnClient.js';

interface IHandler {
  method: string;
  path: string;
  handler: IRestfulHandler
}
interface ISetKeys {
  (signatureInput: SignatureInput): void;
}
interface IRestful {
  (path: string, handler: IRestfulHandler): void;
}
export interface IOutbound {
  setKeys: ISetKeys;
  post: IRestful;
  handle: IHttpHandle;
}

export class Outbound implements IOutbound {
  #handlers: Array<IHandler> = [];
  #dwnClient: DwnClient;

  constructor(signatureInput: SignatureInput) {
    if (signatureInput)
      this.#dwnClient = new DwnClient(signatureInput);
  }

  setKeys: ISetKeys = signatureInput => this.#dwnClient = new DwnClient(signatureInput);

  post: IRestful = (path, handler) => this.#handlers.push({
    method: 'POST',
    path,
    handler
  });

  handle: IHttpHandle = async (req, res) => {
    try {
      const path = url.parse(req.url as string).pathname;
      const handler = this.#handlers.find(x => x.method === req.method && x.path === path);

      if (!handler) {
        res.statusCode = 404;
      } else {
        const record = await handler.handler(req);
        if (record)
          this.#dwnClient.send('some-did', record);
        res.statusCode = 202;
      }
    } catch (err) {
      console.error(err);
      res.statusCode = 500;
    }

    res.end();
  };
}