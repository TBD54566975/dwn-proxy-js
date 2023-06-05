import http from 'http';
import { DwnMessage } from './types.js';

// export interface IOutboundMiddleware {
//   (req: http.IncomingMessage, res: http.OutgoingMessage, next: NextFunction): void;
// }

export interface IOutboundRestfulMiddleware {
  (req: http.IncomingMessage, res: http.OutgoingMessage): DwnMessage;
}

export interface IOutboundMethodMiddleware {
  (path: string,
    middleware?: ((req: http.IncomingMessage, res: http.OutgoingMessage) => DwnMessage)): void
}

// export interface IOutboundRoute {
//   match: (req: http.IncomingMessage) => boolean;
//   use: IOutboundRestfulMiddleware;
// }

export class Outbound {
  // routes: Array<IOutboundRoute>;
  // middlewares: Array<IOutboundMiddleware>;

  // use = (middleware: IOutboundMiddleware) => {
  //   this.middlewares.push(middleware);
  // };

  // get: IOutboundMethodMiddleware = (path, middleware) => {
  //   console.log(path, middleware);
  // };

  post: IOutboundMethodMiddleware = (path, middleware) => {
    console.log(path, middleware);
  };
}