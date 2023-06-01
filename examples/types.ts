import http from 'http';

export type Request = http.IncomingMessage;
export type Response = http.OutgoingMessage;
export type NextFunction = () => void;

export interface IMiddleware {
  (req: Request, res: Response, next: NextFunction): void;
}

export interface IRoute {
  match: (req: Request) => boolean;
  use: IMiddleware;
}

export class Handle {
  routes: Array<IRoute>;
  middlewares: Array<IMiddleware>;

  use = (middleware: IMiddleware) => {
    this.middlewares.push(middleware);
  };
}

export type DwnMessage = {
  some: string;
}

export interface IRest {
  (req: Request, res: Response): DwnMessage;
}

export interface IRestRoute {
  (path: string, rest: IRest): void
}

export class Outbound extends Handle {
  get: IRestRoute = (path, rest) => {
    console.log(path, rest);
  };

  post: IRestRoute = (path, rest) => {
    console.log(path, rest);
  };
}

export class App {
  inbound: Handle;
  outbound: Outbound;
  middlewares: Array<IMiddleware>;

  use = (middleware: IMiddleware) => {
    this.middlewares.push(middleware);
  };

  listen = (inboundPort: number, outboundPort: number) => {
    console.log(inboundPort, outboundPort);
  };
}