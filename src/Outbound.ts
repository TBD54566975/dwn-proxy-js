import http from 'http';
import { DwnMessage, NextFunction } from './types.js';

export interface IOutboundMiddleware {
  (req: http.IncomingMessage, res: http.OutgoingMessage, next: NextFunction): void;
}

export interface IOutboundRestfulMiddleware {
  (path: string, middleware: ((req: http.IncomingMessage, res: http.OutgoingMessage) => DwnMessage)): void
}

export interface IOutboundRoute {
  match: (req: http.IncomingMessage) => boolean;
  use: IOutboundMiddleware;
}

export class Outbound {
  routes: Array<IOutboundRoute>;
  middlewares: Array<IOutboundMiddleware>;

  use = (middleware: IOutboundMiddleware) => {
    this.middlewares.push(middleware);
  };

  get: IOutboundRestfulMiddleware = (path, middleware) => {
    console.log(path, middleware);
  };

  post: IOutboundRestfulMiddleware = (path, middleware) => {
    console.log(path, middleware);
  };
}