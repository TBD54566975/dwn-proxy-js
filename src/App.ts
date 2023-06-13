import { SignatureInput } from '@tbd54566975/dwn-sdk-js';
import { IRecordsQueryHandler, IRecordsWriteHandler, IRestfulHandler } from './types.js';
import { createServer } from './Http.js';
import { IInbound, Inbound } from './Inbound.js';
import { IOutbound, Outbound } from './Outbound.js';

interface IRecords {
  query: (handler: IRecordsQueryHandler) => void;
  write: (handler: IRecordsWriteHandler) => void;
}
interface IRestful {
  (path: string, handler: IRestfulHandler): void;
}
interface IListen {
  (port: number): Promise<void>;
}
export interface IApp {
  records: IRecords;
  post: IRestful;
  listen: IListen;
}

export class App implements IApp {
  #inbound: IInbound;
  #outbound: IOutbound;

  constructor(sig?: SignatureInput) {
    this.#inbound = new Inbound();
    this.#outbound = new Outbound(sig);
  }

  records: IRecords = {
    query : handler => this.#inbound.recordsQuery = handler,
    write : handler => this.#inbound.recordsWrite = handler
  };

  post: IRestful = (path, handler) => this.#outbound.post(path, handler);

  listen: IListen = async port => {
    await this.#outbound.generateKeys(`http://localhost:${port}`);
    await createServer(port, async (req, res) => {
      const isInbound = !!req.headers['dwn-request'];
      if (isInbound) this.#inbound.handle(req, res);
      else this.#outbound.handle(req, res);
    });
    console.log(`Listening on port ${port}`);
  };
}