import { IInboundMiddleware, Inbound } from './Inbound.js';
import { IOutboundMiddleware, Outbound } from './Outbound.js';

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