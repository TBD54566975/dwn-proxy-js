import { DwnMessage } from './types.js';
import {
  IHttpFunc,
  createServer,
  readOctetStream } from './Http.js';
import { parseDwm } from './JsonRpc.js';
import { Encoder, Message } from '@tbd54566975/dwn-sdk-js';

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

interface IInbound {
  records: {
    write: IHandlerFunc;
    query: IHandlerFunc;
  };
  listen: (port: number) => Promise<any>;
}

export class Inbound implements IInbound {
  #handlers: Array<IHandler> = [];

  #useHandler: IHandlerFunc = (match, middleware) =>
    this.#handlers.push({
      match,
      middleware
    });

  #http: IHttpFunc = async (req, res) => {
    const response = {
      result: {
        reply: {
          status: {
            code   : 200,
            detail : 'all is well'
          },
          entries: [
            {
              descriptor: {
                dataFormat: 'text/plain'
              },
              // encodedData: 'hello',
              encodedData: Encoder.stringToBase64Url('hello world!')
              // data: Buffer.from('testing', 'utf-8')
            }
          ],
          record: {}
        }
      }
    };
    res.setHeader('dwn-response', JSON.stringify(response));
    res.statusCode = 202;
    res.end();
    return;

    try {
      const message = parseDwm(req.headers['dwn-request'] as string);
      const data = await readOctetStream(req);

      Message.validateJsonSchema(message);

      const handler = this.#handlers.find(({ match }) => match(message));
      if (!handler) {
        res.statusCode = 404;
      } else {
        handler.middleware(message, data);
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

  listen = async (port: number) => await createServer(port, this.#http);
}