import { DwnMessage } from './types.js';
import {
  IHttpFunc,
  createServer,
  readOctetStream } from './Http.js';
import { parseDwm } from './JsonRpc.js';

interface IMiddleware {
  (message: DwnMessage, data?: string | void): Promise<void>;
}

interface IHandlerOptions {
  http?: {
    path: string;
    // TODO other things
  };
  middleware?: IMiddleware;
}

export interface IMatchFunc {
  (msg: DwnMessage): boolean;
}

interface IUseFunc {
  (match: IMatchFunc, a: IHandlerOptions | string, middleware?: IMiddleware): void;
}

interface IHandler {
  match: IMatchFunc;
  options: IHandlerOptions;
}

interface IInbound {
  records: {
    write: IUseFunc;
    query: IUseFunc;
  };
  listen: (port: number) => Promise<any>;
}

export class Inbound implements IInbound {
  #handlers: Array<IHandler> = [];

  #useHandler: IUseFunc = (a, b, c) => {
    const match = a;
    let options: IHandlerOptions;

    if (typeof b === 'string')
      options = { http: { path: b } };
    else
      options = b;

    if (c) options.middleware = c;

    this.#handlers.push({
      match,
      options
    });
  };

  #http: IHttpFunc = async (req, res) => {
    const message = parseDwm(req.headers['dwn-request'] as string);
    // TODO dwn-sdk-js Message.validateJsonSchema

    const data = await readOctetStream(req);

    const handler = this.#handlers.find(({ match }) => match(message));
    if (!handler) {
      res.statusCode = 404;
    } else {
      res.statusCode = 202;
      if (handler.options.middleware) handler.options.middleware(message, data);
      // forward http
    }

    res.end();
  };

  records = {
    write : this.#useHandler,
    query : this.#useHandler
  };

  listen = async (port: number) => await createServer(port, this.#http);
}