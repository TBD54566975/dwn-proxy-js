import http from 'http';

export type NextFunction = () => void;
export type DwnMessage = {
  some: string;
}
export type DwnDescriptor = {
  schema: string;
  protocol: string;
}

//#region inbound
export interface IInboundMiddleware {
  (message: DwnMessage, next: NextFunction): void;
}
export interface IInboundDwnMiddleware {
  write: (descriptor: DwnDescriptor, middleware: IInboundMiddleware) => void;
}
export interface IInboundRoute {
  match: (message: DwnMessage) => boolean;
  use: IInboundMiddleware;
}
export class Inbound {
  routes: Array<IInboundRoute>;
  middlewares: Array<IInboundMiddleware>;

  use = (middleware: IInboundMiddleware) => {
    this.middlewares.push(middleware);
  };

  records: IInboundDwnMiddleware = {
    write: (descriptor, middleware) => {
      console.log(descriptor, middleware);
    }
  };
}
//#endregion

//#region outbound
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
//#endregion

export type IMiddleware = IInboundMiddleware | IOutboundMiddleware;

export class App {
  inbound: Inbound;
  outbound: Outbound;
  middlewares: Array<IMiddleware>;

  use = (middleware: IMiddleware) => {
    this.middlewares.push(middleware);
  };

  listen = (inboundPort: number, outboundPort: number) => {
    console.log(inboundPort, outboundPort);
  };
}