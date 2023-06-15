import { DwnHttpServer, DwnMessage, IPreProcess, IRequestListener } from './dwn-http-server-js/index.js';
import { SignatureInput } from '@tbd54566975/dwn-sdk-js';

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
type Options = Partial<{
  signatureInput: SignatureInput
}>;
export type DwnProxyOptions = Options;

export class DwnProxy {
  #options: Options;
  #server: DwnHttpServer;
  #recordsQuery: IRecordsQuery;
  #recordsWrite: IRecordsWrite;

  constructor(options?: Options) {
    this.#options = options ?? {};
  }

  dwn: IDwn = {
    records: {
      query : handler => this.#recordsQuery = handler,
      write : handler => this.#recordsWrite = handler
    }
  };

  #inbound: IPreProcess = async dwnRequest => {
    const interfaceMethod = `${dwnRequest.message.descriptor.interface}${dwnRequest.message.descriptor.method}`;
    if (interfaceMethod === 'RecordsQuery') {
      const record = await this.#recordsQuery(dwnRequest.message);
      if (record) {
        return {}; // todo reply
      }
    } else if (interfaceMethod === 'RecordsWrite') {
      const isWritten = await this.#recordsWrite(dwnRequest.message, dwnRequest.data);
      if (isWritten) {
        console.log('TODO dwn.processMessage() and send response');
      } else {
        return;
      }
    }
  };

  #outbound: IRequestListener = async (req, res) => {
    console.log(req, res);
  };

  listen = async (port: number) => {
    this.#server = new DwnHttpServer({
      fallback   : this.#outbound,
      dwnProcess : {
        preProcess: this.#inbound
      }
    });
    this.#server.listen(port);
  };
}