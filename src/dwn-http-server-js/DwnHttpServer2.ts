import express, {
  Express,
  Request,
  Response,
  NextFunction } from 'express';

type Options = Partial<{
  preProcess: (message: any, data: any) => Promise<boolean>;
  postProcess: (message: any, data: any) => Promise<void>;
}>
interface IUse {
  (handler: (req: Request, res: Response, next: NextFunction) => void): Express;
}
interface IHandle {
  (req: Request, res: Response): Promise<void>;
}
interface IRest {
  (path: string, handler: IHandle): Express;
}
interface IListen {
  (port: number, options: Options | void, callback: () => void): void;
}

class ExpressServer {
  protected api: Express;

  constructor() {
    this.api = express();
  }

  use: IUse = handler =>
    this.api.use(handler);

  get: IRest = (path, handler) =>
    this.api.get(path, handler);

  post: IRest = (path, handler) =>
    this.api.post(path, handler);

  // todo other methods like put, delete, etc. as needed

  listen: IListen = (port, _, callback) =>
    this.api.listen(port, callback);
}

const parseDwnRequest = (req: Request) => {
  const dwnRequest = req.headers['dwn-request'];
  if (dwnRequest) return JSON.parse(dwnRequest as string);
  return;
};

class DwnHttpServer extends ExpressServer {
  #options: Options;

  #dwm: IHandle = async (req, res) => {
    const message = parseDwnRequest(req);
    const data = req; // does this work?

    if (this.#options.preProcess) this.#options.preProcess(message, data);

    // dwn.processMessage()

    if (this.#options.postProcess) this.#options.postProcess(message, data);
  };

  listen: IListen = (port, options, callback) => {
    this.#options = options ?? {};
    super.post('/', this.#dwm);
    return super.listen(port, undefined, callback);
  };
}

// Usage

const preProcess = async (message, data) => {
  // this is called prior-to dwn.processMessage()
  console.log(message, data);
  return true;
};
const postProcess = async (message, data) => {
  // this is called after dwn.processMessage()
  // TODO probably could send in the results of dwn.processMessage() as a param here
  console.log(message, data);
};

const server = new DwnHttpServer();
server.use((req, res, next) => {
  console.log('Time of request:', Date.now());
  next();  // Don't forget to call next()!
});
server.get('/', async (req: Request, res: Response) => {
  res.send('Hello from custom server!');
});
server.listen(
  3000,
  {
    preProcess,
    postProcess
  },
  () => {
    console.log('Server running on port 3000');
  });
