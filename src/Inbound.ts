import { DwnMessage } from './types.js';
import {
  IHttpServer,
  IHttpHandler,
  HttpServer } from './Http.js';

export type Route = {
  protocol: string;
  schema: string;
  path: string;
}

export interface IMiddleware {
  (message: DwnMessage): void;
}

export type Middleware = {
  protocol: string;
  schema: string;
  middleware: IMiddleware;
}

export class Inbound implements IHttpServer {
  server: HttpServer;
  routes: Array<Route>;
  middlewares: Array<Middleware>;

  constructor() {
    this.server = new HttpServer();
  }

  addRoute = (protocol: string, schema: string, path: string) =>
    this.routes.push({ protocol, schema, path });

  addMiddleware = (protocol: string, schema: string, middleware: IMiddleware) =>
    this.middlewares.push({ protocol, schema, middleware });

  #handler: IHttpHandler = (req, res) => {
    console.log(req, res);
    /**
     * - parse DWM from req
     * - iterate handlers to find match
     *    - search routes first? routes take precent?
     * - if no match, then respond 404
     * - if middleware, then call
     * - make downstream http req
     */
  };

  listen = (port: number) => this.server.listen(port, this.#handler);
}