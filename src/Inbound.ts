import { DwnMessage, DwnDescriptor } from './types.js';
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
  (descriptor: DwnDescriptor): boolean;
}

interface IHandler {
  match: IMatchFunc;
  middleware: IMiddleware;
}

interface IHandlerFunc {
  (match: IMatchFunc, middleware: IMiddleware): void;
}

interface IHandlers {
  // [kw] different interface-methods could have different handler sigantures
  //      currently, they're all IHandler, but we could tailor the DX
  //      to have custom signatures for the different interface-methods
  RecordsWrite: Array<IHandler>;
  RecordsQuery: Array<IHandler>;
}

interface IInbound {
  records: {
    write: IHandlerFunc;
    query: IHandlerFunc;
  };
  listen: (port: number) => Promise<any>;
}

const messageReply = (obj, code = 200) => ({
  result: {
    reply: {
      status: {
        code
      },
      entries: [
        {
          descriptor: {
            dataFormat: 'application/json'
          },
          encodedData: obj ? Encoder.stringToBase64Url(JSON.stringify(obj)) : undefined
        }
      ],
      record: {}
    }
  }
});

export class Inbound implements IInbound {
  #handlers: IHandlers = {
    RecordsWrite : [],
    RecordsQuery : []
  };

  #http: IHttpFunc = async (req, res) => {
    try {
      const message = parseDwm(req.headers['dwn-request'] as string);
      const data = await readOctetStream(req);

      let isValidSchema = false;
      try {
        Message.validateJsonSchema(message);
        isValidSchema = true;
      } catch (err) {
        res.setHeader('dwn-response', JSON.stringify(messageReply(undefined, 400)));
      }

      if (isValidSchema) {
        const handler =
          this.#handlers[message.descriptor.interface + message.descriptor.method]
            .find(({ match }) => match(message.descriptor));

        if (!handler)
          res.setHeader('dwn-response', JSON.stringify(messageReply(undefined, 404)));
        else
          res.setHeader('dwn-response',
            JSON.stringify(messageReply(await handler.middleware(message, data))));
      }
    } catch (err) {
      console.error(err);
      res.setHeader('dwn-response', JSON.stringify(messageReply(undefined, 500)));
    }

    res.statusCode = 200;
    res.end();
  };

  records = {
    write : (match, middleware) => this.#handlers.RecordsWrite.push({ match, middleware }),
    query : (match, middleware) => this.#handlers.RecordsQuery.push({ match, middleware })
  };

  listen = async (port: number) => await createServer(port, this.#http);
}