import { DidIonApi, DwnServiceEndpoint } from '@tbd54566975/dids';
import { IRestfulHandler, IHttpHandle } from './types.js';
import url from 'url';
import { RecordsWrite, SignatureInput } from '@tbd54566975/dwn-sdk-js';

interface IHandler {
  method: string;
  path: string;
  handler: IRestfulHandler
}
interface IRestful {
  (path: string, handler: IRestfulHandler): void;
}
interface IGenerateKeys { // TODO this is incorrect design
  (endpoint: string): Promise<void>;
}
export interface IOutbound {
  generateKeys: IGenerateKeys;
  post: IRestful;
  handle: IHttpHandle;
}

export class Outbound implements IOutbound {
  #signatureInput: SignatureInput;
  #handlers: Array<IHandler> = [];

  constructor(sig?: SignatureInput) {
    this.#signatureInput = sig;
  }

  generateKeys = async endpoint => {
    if (!this.#signatureInput) {
      const didState = await new DidIonApi().create({
        services: [{
          id              : 'dwn',
          type            : 'DecentralizedWebNode',
          serviceEndpoint : {
            nodes: [ endpoint ]
          }
        }]
      });

      console.log(`Created DID and hosting: ${didState.id}`);

      const { keys } = didState;
      const [ key ] = keys;
      const { privateKeyJwk } = key;
      const kidFragment = privateKeyJwk.kid || key.id;
      const kid = `${didState.id}#${kidFragment}`;
      this.#signatureInput = {
        privateJwk      : privateKeyJwk,
        protectedHeader : { alg: privateKeyJwk.crv, kid }
      };
    }
  };

  post: IRestful = (path, handler) => this.#handlers.push({
    method: 'POST',
    path,
    handler
  });

  handle: IHttpHandle = async (req, res) => {
    try {
      const path = url.parse(req.url as string).pathname;
      const handler = this.#handlers.find(x => x.method === req.method && x.path === path);

      if (!handler) {
        res.statusCode = 404;
      } else {
        const message = await handler.handler(req);
        if (message) {
          // TODO send the message onwards
          const targetDid = 'TODO';
          const endpoint = await resolveEndpoint(targetDid);
          const recordsWriteMessage = await createMessage(this.#signatureInput, JSON.stringify(message));
          await sendMessage(endpoint, targetDid, recordsWriteMessage);
        }
        res.statusCode = 202;
      }
    } catch (err) {
      console.error(err);
      res.statusCode = 500;
    }

    res.end();
  };
}

// TODO don't love this
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
    'id'      : '90a7309e-d5ad-4404-b609-7d050a1dff17', // TODO
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