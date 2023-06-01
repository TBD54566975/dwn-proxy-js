import {
  DwnMessage,
  DwnDescriptor,
  ForwardHttp,
  NextFunction } from './types.js';

export interface IInboundMiddleware {
  (message: DwnMessage, next: NextFunction): void;
}

export interface IInboundDwnMiddleware {
  (message: DwnMessage): ForwardHttp;
}

export interface IInboundDwnInterfaceMiddleware {
  write: (descriptor: DwnDescriptor, middleware: IInboundDwnMiddleware) => void;
}

export interface IInboundRoute {
  match: (message: DwnMessage) => boolean;
  use: IInboundDwnMiddleware;
}

export class Inbound {
  routes: Array<IInboundRoute>;
  middlewares: Array<IInboundMiddleware>;

  use = (middleware: IInboundMiddleware) => {
    this.middlewares.push(middleware);
  };

  records: IInboundDwnInterfaceMiddleware = {
    write: (descriptor, middleware) => {
      console.log(descriptor, middleware);
    }
  };
}