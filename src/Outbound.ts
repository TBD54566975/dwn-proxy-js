import http from 'http';
import { DwnMessage } from './types.js';

export interface IOutboundRestfulMiddleware {
  (req: http.IncomingMessage, res: http.OutgoingMessage): DwnMessage;
}

export interface IOutboundMethodMiddleware {
  (path: string,
    middleware?: ((req: http.IncomingMessage, res: http.OutgoingMessage) => DwnMessage)): void
}

export class Outbound {
  post: IOutboundMethodMiddleware = (path, middleware) => {
    console.log(path, middleware);
  };
}