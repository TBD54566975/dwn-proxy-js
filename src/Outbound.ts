import http from 'http';
import url from 'url';
import { IHttpFunc, createServer } from './Http.js';
import { RecordsWrite, SignatureInput } from '@tbd54566975/dwn-sdk-js';
import { DidIonApi, DwnServiceEndpoint } from '@tbd54566975/dids';

interface IMiddlewareDwnIntent<T> {
  targetDid: string;
  // assuming RecordsWrite only right now
  data: T;
}

export interface IOutboundMiddleware<T> {
  (req: http.IncomingMessage): Promise<IMiddlewareDwnIntent<T>>;
}

export interface IRestful<T> {
  (path: string, middleware: IOutboundMiddleware<T>): void
}

interface IHandler {
  method: string;
  path: string;
  middleware: IOutboundMiddleware<any>;
}

const resolveEndpoint = async (did: string): Promise<string> => {
  // TODO use resolver cache
  const doc = (await new DidIonApi().resolve(did)).didDocument;
  if (!doc) return; // TODO
  const service = doc.service.find(x => x.type === 'DecentralizedWebNode');
  if (!service) return; // TODO
  return (service.serviceEndpoint as DwnServiceEndpoint).nodes[0];
};

const createMessage = async (signature: SignatureInput, data: string): Promise<RecordsWrite> => {
  return await RecordsWrite.create({
    data                        : Buffer.from(data, 'utf-8'),
    dataFormat                  : 'text/plain',
    authorizationSignatureInput : signature
  });
};

const sendMessage = async (endpoint: string, target: string, message: RecordsWrite, data?: any): Promise<void> => {
  const rpc = {
    'jsonrpc' : '2.0',
    'id'      : '90a7309e-d5ad-4404-b609-7d050a1dff17',
    'method'  : 'dwn.processMessage',
    'params'  : {
      target,
      message
    }
  };

  const fetchOpts = {
    method  : 'POST',
    headers : {
      'dwn-request': JSON.stringify(rpc)
    }
  };
  if (data) {
    fetchOpts.headers['content-type'] = 'application/octet-stream';
    fetchOpts['body'] = data;
  }

  const resp = await fetch(endpoint, fetchOpts);
  console.log(resp.status);
};

export class Outbound {
  #handlers: Array<IHandler> = [];
  #signatureInput: any;

  #http: IHttpFunc = async (req, res) => {
    try {
      const path = url.parse(req.url).pathname;
      const handler = this.#handlers.find(x => x.method === req.method && x.path === path);

      if (!handler) {
        res.statusCode = 404;
      } else {
        handler.middleware(req).then(async intent => {
          const endpoint = await resolveEndpoint(intent.targetDid);
          const message = await createMessage(this.#signatureInput, JSON.stringify(intent));
          await sendMessage(endpoint, intent.targetDid, message);
        });
        res.statusCode = 202;
      }
    } catch (err) {
      console.error(err);
      res.statusCode = 500;
    }

    res.end();
  };

  post: IRestful<any> = (path, middleware) => {
    console.log(path, middleware);
  };

  listen = async (port: number, signatureInput: SignatureInput) => {
    await createServer(port, this.#http);
    this.#signatureInput = signatureInput;
  };
}