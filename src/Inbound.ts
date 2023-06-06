import { DwnMessage } from './types.js';
import { IHttpDwnHandler,HttpServer } from './Http.js';
import { parseDwm } from './JsonRpc.js';
import { Dwn } from '@tbd54566975/dwn-sdk-js';

export type ProtocolRoute = {
  protocol: string;
  schema: string;
  path: string;
}

export interface IMiddleware {
  (message: DwnMessage): void;
}

export type ProtocolMiddleware = {
  protocol: string;
  schema: string;
  middleware: IMiddleware;
}

export class Inbound {
  #server: HttpServer;
  #protocols: Array<ProtocolRoute | ProtocolMiddleware> = [];

  constructor() {
    this.#server = new HttpServer();
  }

  protocol = {
    route: (protocol: string, schema: string, path: string) =>
      this.#protocols.push({ protocol, schema, path }),
    middleware: (protocol: string, schema: string, middleware: IMiddleware) =>
      this.#protocols.push({ protocol, schema, middleware })
  };

  #handler: IHttpDwnHandler = async (dwn, req, res) => {
    const { target, message } = parseDwm(req.headers['dwn-request'] as string);

    console.log(`Target: ${target}`);
    console.log(message);

    const reply = await dwn.processMessage(target, message, req as any);
    console.log(reply);
    // RecordsRead messages return record data as a stream to for accommodate large amounts of data
    if ('record' in reply) {
      // TODO: Import `RecordsReadReply` from dwn-sdk-js once release with https://github.com/TBD54566975/dwn-sdk-js/pull/346 is available
      console.log(reply.record);
    }

    res.statusCode = 202;
    res.end();
    /**
     * - parse DWM from req
     * - iterate handlers to find match
     * - if no match, then respond 404
     * - else respond 202
     * - if middleware, then call
     * - make downstream http req
     */
  };

  listen = async (dwn: Dwn, port: number) =>
    await this.#server.listen(port, (req, res) => this.#handler(dwn, req, res));
}