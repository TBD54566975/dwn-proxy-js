import http from 'http';
import url from 'url';
import { IHttpFunc, createServer } from './Http.js';
import {
  resolveEndpoint,
  createMessage,
  sendMessage } from './dwn.js';

interface IMiddlewareDwnIntent<T> {
  targetDid: string;
  // assuming RecordsWrite only right now
  data: T;
}

export interface IMiddleware<T> {
  (req: http.IncomingMessage): Promise<IMiddlewareDwnIntent<T>>;
}

export interface IRestful<T> {
  (path: string, middleware: IMiddleware<T>): void
}

interface IHandler {
  method: string;
  path: string;
  middleware: IMiddleware<any>;
}

export class Outbound {
  #handlers: Array<IHandler> = [];

  #http: IHttpFunc = async (req, res) => {
    try {
      const path = url.parse(req.url).pathname;
      const handler = this.#handlers.find(x => x.method === req.method && x.path === path);

      if (!handler) {
        res.statusCode = 404;
      } else {
        handler.middleware(req).then(async intent => {
          const endpoint = await resolveEndpoint(intent.targetDid);
          const message = await createMessage(intent);
          await sendMessage(endpoint, message);
        });
        res.statusCode = 202;
      }
    } catch (err) {
      console.error(err);
      res.statusCode = 500;
    }

    res.end();
  };

  post: IRestful<any> = (path, middleware) => {
    console.log(path, middleware);
  };

  listen = async (port: number) => await createServer(port, this.#http);
}