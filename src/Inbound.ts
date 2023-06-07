import { DwnMessage } from './types.js';
import {
  IHttpHandler,
  createServer,
  readOctetStream } from './Http.js';
import { parseDwm } from './JsonRpc.js';

export interface IHandlerHttp {
  path: string;
  // TODO other things
}

export interface IMiddleware {
  (message: DwnMessage): Promise<void>;
}

export interface IHandlerOptions {
  http?: IHandlerHttp;
  middleware?: IMiddleware;
}

export interface IMatchFunc {
  (msg: DwnMessage): boolean;
}

interface IHandlerFunc {
  (match: IMatchFunc, a: IHandlerOptions | string, middleware?: IMiddleware): void
}
interface IRecords {
  write: IHandlerFunc;
}

export interface IHandler {
  match: IMatchFunc;
  options: IHandlerOptions;
}

export class Inbound {
  #handlers: Array<IHandler> = [];

  records: IRecords = {
    write: (match, a, middleware) => {
      let options: IHandlerOptions;
      let path: string;

      if (typeof a === 'string') {
        path = a;
      } else {
        options = a;
      }

      let handler: IHandler = {
        match,
        options: options ?? {}
      };
      if (path) handler.options.http = { path };
      if (middleware) handler.options.middleware = middleware;

      this.#handlers.push(handler);
    }
  };

  #handler: IHttpHandler = async (req, res) => {
    let message = parseDwm(req.headers['dwn-request'] as string);
    console.log(message);
    message = { ...message, descriptor: { ...message.descriptor, protocol: 'tbdex', schema: 'rfq' } };
    console.log(message);

    const data = await readOctetStream(req);
    console.log(data);

    const handler = this.#handlers.find(({ match }) => match(message));
    console.log(handler);
    if (!handler) {
      res.statusCode = 404;
    } else {
      res.statusCode = 202;
      if (handler.options.middleware) handler.options.middleware(message);
      console.log(handler.options.http);
      // forward http
    }

    res.end();
  };

  // listen = async (port: number) => await this.#server.listen(port, this.#handler);
  listen = async (port: number) => await createServer(port, this.#handler);
}