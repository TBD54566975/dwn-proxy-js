import { DwnMessage } from './types.js';
import {
  IHttpHandler,
  createServer,
  readOctetStream } from './Http.js';
import { parseDwm } from './JsonRpc.js';

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
  #protocols: Array<ProtocolRoute | ProtocolMiddleware> = [];

  protocol = {
    route: (protocol: string, schema: string, path: string) =>
      this.#protocols.push({ protocol, schema, path }),
    middleware: (protocol: string, schema: string, middleware: IMiddleware) =>
      this.#protocols.push({ protocol, schema, middleware })
  };

  #handler: IHttpHandler = async (req, res) => {
    const message = parseDwm(req.headers['dwn-request'] as string);
    console.log(message);

    const data = await readOctetStream(req);
    console.log(data);

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

  // listen = async (port: number) => await this.#server.listen(port, this.#handler);
  listen = async (port: number) => await createServer(port, this.#handler);
}