import { App, Request, Response, NextFunction } from '@tbd54566975/dwn-sdk-js';

const app = new App();

app.use((req: Request, res: Response, next: NextFunction) => {
  console.log('Add any middleware for all requests');
});

app.inbound.use((req: Request, res: Response, next: NextFunction) => {
  console.log('Add any middleware for inbound requests');
});

app.outbound.use((req: Request, res: Response, next: NextFunction) => {
  // this is a useful for augmenting the outbound communication
  console.log('Add any middleware for outbound requests');
});
