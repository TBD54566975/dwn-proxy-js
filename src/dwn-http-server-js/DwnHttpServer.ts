import http from 'http';
import { RecordsWriteMessage, RecordsQueryMessage, MessageReply } from '@tbd54566975/dwn-sdk-js';

// TODO
//    let's use Express.js instead of the native http module
//    this way, the DwnHttpServer can support everything
//    Express.js supports as well

export interface IRequestListener {
  (req: http.IncomingMessage, res: http.ServerResponse): Promise<void>;
}

// TODO don't love this
export type DwnMessage = RecordsQueryMessage | RecordsWriteMessage;
type DwnRequest = {
  message: DwnMessage;
  data?: any; // TODO type this
}

export interface IPreProcess {
  (dwnRequest: DwnRequest): Promise<void | Partial<{
      halt: boolean;
      reply: MessageReply;
    }>>;
}
type Options = Partial<{
  fallback?: IRequestListener;
  dwnProcess?: Partial<{
    disable: boolean;
    preProcess: IPreProcess;
    postProcess: (dwnRequest: DwnRequest) => Promise<void>;
  }>;
}>;
export type DwnHttpServerOptions = Options;
interface IListen {
  (port: number, options?: Options): Promise<void>;
}

const readOctetStream = async (req: http.IncomingMessage): Promise<string | void> => {
  let data = '';
  await new Promise((resolve, reject) => {
    req.on('data', chunk =>
      data += chunk.toString('utf8')
    );
    req.on('end', () => resolve(data));
    req.on('error', reject);
  });
  return data;
};
const parseDwnRequest = async (req: http.IncomingMessage): Promise<DwnRequest | void> => {
  const raw = req.headers['dwn-request'] as string | void;
  if (raw) {
    const jsonRpc = JSON.parse(raw);
    const message = jsonRpc.params.message;
    const data = await readOctetStream(req);

    return {
      message,
      data
    };
  }
};

export class DwnHttpServer {
  #options: Options;

  #listener: IRequestListener = async (req, res) => {
    const dwnRequest = await parseDwnRequest(req);
    if (!dwnRequest) {
      if (this.#options.fallback) this.#options.fallback(req, res);
      else console.log('todo handle error response');
    } else {
      // todo what about overriding a RecordsQuery with your own record?
      let preProcessResult;
      if (this.#options.dwnProcess?.preProcess)
        preProcessResult = await this.#options.dwnProcess.preProcess(dwnRequest);

      if (!this.#options.dwnProcess?.disable && !preProcessResult.halt) {
        console.log('todo call dwn.processMessage()');
      }

      // todo postProcess should also receive the result of the dwn.processMessage()
      if (this.#options.dwnProcess?.postProcess)
        await this.#options.dwnProcess.postProcess(dwnRequest);

      console.log('todo respond to client');
    }
  };

  listen: IListen = async (port: number, options?: Options) => {
    this.#options = options ?? {};
    const server = http.createServer(this.#listener);
    await new Promise(resolve =>
      server.listen(port, 'localhost', () => resolve(undefined))
    );
  };
}