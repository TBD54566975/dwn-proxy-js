import { DidIonApi, DidState } from '@tbd54566975/dids';
import { Inbound } from './Inbound.js';
import { Outbound } from './Outbound.js';

// export type IMiddleware = IInboundMiddleware | IOutboundMiddleware;

export class App {
  inbound: Inbound;
  outbound: Outbound;

  #didState: DidState;
  // middlewares: Array<IMiddleware>;

  constructor () {
    this.inbound = new Inbound();
    this.outbound = new Outbound();

    /**
     * - ??? start a DWN??? is that even necessary in this exact moment?
     */
  }

  // use = (middleware: IMiddleware) => {
  //   this.middlewares.push(middleware);
  // };

  listen = async (inboundPort: number, outboundPort: number) => {
    this.#didState = await new DidIonApi().create({
      services: [{
        id              : '#dwn',
        type            : 'DecentralizedWebNode',
        serviceEndpoint : {
          nodes: [ `http://localhost:${inboundPort}` ]
        }
      }]
    });

    this.inbound.listen(inboundPort);

    console.log(`Listening to inbound on ${inboundPort}`);
    console.log(`Listening to outbound on ${outboundPort}`);
    console.log(this.#didState);
  };
}