import {
  DwnMessage,
  DwnDescriptor } from './types.js';
import HttpServer from './HttpServer.js';
import http from 'http';

export type HttpRoute = {
  path: string;
  method: string;
  // headers: any;
  // body: any;
};

// export interface IInboundMiddleware {
//   (message: DwnMessage, next: NextFunction): void;
// }

export interface IInboundDwnInterface {
  (descriptor: DwnDescriptor,
    route: http.RequestOptions,
    middleware?: ((message: DwnMessage) => any)): void;
}

export interface IRecords {
  write: IInboundDwnInterface;
  query: IInboundDwnInterface;
}

// export interface IInboundRoute {
//   match: (message: DwnMessage) => boolean;
//   use: IInboundDwnMiddleware;
// }

export class Inbound extends HttpServer {
  // routes: Array<IInboundRoute>;
  // middlewares: Array<IInboundMiddleware>;

  // use = (middleware: IInboundMiddleware) => {
  //   this.middlewares.push(middleware);
  // };

  records: IRecords = {
    write: (descriptor, route, middleware) => {
      console.log(descriptor, route, middleware);
    },
    query: (descriptor, route, middleware) => {
      console.log(descriptor, route, middleware);
    }
  };
}