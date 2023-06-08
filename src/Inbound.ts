import { DwnMessage } from './types.js';
import {
  createServer,
  readOctetStream } from './Http.js';
import { parseDwm } from './JsonRpc.js';
import { Message } from '@tbd54566975/dwn-sdk-js';
import http from 'http';

export interface IMiddleware {
  (message: DwnMessage, data?: string | void): Promise<void>;
}

export interface IMatchFunc {
  (msg: DwnMessage): boolean;
}

interface IHandlerFunc {
  (match: IMatchFunc, middleware: IMiddleware): void;
}

interface IHandler {
  match: IMatchFunc;
  middleware: IMiddleware;
}

interface IDwnProcessFunc {
  (msg: DwnMessage): void;
}

interface IHttpFunc {
  (req: http.IncomingMessage, res: http.ServerResponse, dwnProcess: IDwnProcessFunc): Promise<void>;
}

interface IListenFunc {
  (port: number, dwnProcess: IDwnProcessFunc): Promise<any>;
}

interface IInbound {
  records: {
    write: IHandlerFunc;
    query: IHandlerFunc;
  };
  listen: IListenFunc;
}

export class Inbound implements IInbound {
  #handlers: Array<IHandler> = [];

  #useHandler: IHandlerFunc = (match, middleware) =>
    this.#handlers.push({
      match,
      middleware
    });

  #http: IHttpFunc = async (req, res, dwnProcess) => {
    // TODO build response
    res.statusCode = 200;
    const response = {
      result: {
        reply: {
          status: {
            code   : 200,
            detail : 'all is well'
          },
          record: {}
        }
      }
    };
    res.setHeader('dwn-response', JSON.stringify(response));
    res.end();

    return;
    try {
      const message = parseDwm(req.headers['dwn-request'] as string);
      console.log(JSON.stringify(message));
      const data = await readOctetStream(req);

      Message.validateJsonSchema(message);

      const handler = this.#handlers.find(({ match }) => match(message));
      if (!handler) {
        res.statusCode = 404;
      } else {
        handler.middleware(message, data);
        dwnProcess(message);
        res.statusCode = 202;
      }
    } catch (err) {
      console.error(err);
      res.statusCode = 500;
    }

    res.end();
  };

  records = {
    write : this.#useHandler,
    query : this.#useHandler
  };

  listen: IListenFunc = async (port, dwnProcess) => {
    await createServer(port, (req, res) => this.#http(req, res, dwnProcess));
  };
}