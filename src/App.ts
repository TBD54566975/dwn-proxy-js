import { Inbound } from './Inbound.js';
import { Outbound } from './Outbound.js';

// export type IMiddleware = IInboundMiddleware | IOutboundMiddleware;

export class App {
  inbound: Inbound;
  outbound: Outbound;
  // middlewares: Array<IMiddleware>;

  constructor() {
    this.inbound = new Inbound();
    this.outbound = new Outbound();
  }

  // use = (middleware: IMiddleware) => {
  //   this.middlewares.push(middleware);
  // };

  listen = (inboundPort: number, outboundPort: number) => {
    console.log(inboundPort, outboundPort);
    this.inbound.listen(inboundPort);
  };
}