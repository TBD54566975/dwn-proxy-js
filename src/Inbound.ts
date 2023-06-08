import { DwnMessage } from './types.js';
import {
  IHttpFunc,
  createServer,
  readOctetStream } from './Http.js';
import { parseDwm } from './JsonRpc.js';
import { Encoder, Message } from '@tbd54566975/dwn-sdk-js';

export interface IMiddleware {
  (message: DwnMessage, data?: string | void): Promise<any>;
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

const messageReply = obj => ({
  result: {
    reply: {
      status: {
        code: 200
      },
      entries: [
        {
          descriptor: {
            dataFormat: 'application/json'
          },
          encodedData: Encoder.stringToBase64Url(JSON.stringify(obj))
        }
      ],
      record: {}
    }
  }
});

export class Inbound implements IInbound {
  #handlers: Array<IHandler> = [];

  #useHandler: IHandlerFunc = (match, middleware) =>
    this.#handlers.push({
      match,
      middleware
    });

  #http: IHttpFunc = async (req, res) => {
    try {
      const message = parseDwm(req.headers['dwn-request'] as string);
      const data = await readOctetStream(req);

      Message.validateJsonSchema(message);

      const handler = this.#handlers.find(({ match }) => match(message));
      if (!handler) {
        res.statusCode = 404;
      } else {
        const dwnResponse = await handler.middleware(message, data);
        if (dwnResponse)
          res.setHeader('dwn-response', JSON.stringify(messageReply(dwnResponse)));
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