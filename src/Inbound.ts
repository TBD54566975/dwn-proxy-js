import { DwnMessage } from './types.js';
import {
  IHttpServer,
  IHttpHandler,
  HttpServer } from './Http.js';

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

export class Inbound implements IHttpServer {
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

  #handler: IHttpHandler = (req, res) => {
    console.log(req, res);
    /**
     * - parse DWM from req
     * - iterate handlers to find match
     * - if no match, then respond 404
     * - else respond 202
     * - if middleware, then call
     * - make downstream http req
     */
  };

  listen = async (port: number) => await this.#server.listen(port, this.#handler);
}