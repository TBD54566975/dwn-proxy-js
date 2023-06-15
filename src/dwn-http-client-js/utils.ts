import { RecordsWrite, SignatureInput } from '@tbd54566975/dwn-sdk-js';
import { DidIonApi, DwnServiceEndpoint } from '@tbd54566975/dids';

// TODO don't love this
export const resolveEndpoint = async (did: string): Promise<string> => {
  // TODO use resolver cache
  const doc = (await new DidIonApi().resolve(did)).didDocument;
  if (!doc) throw new Error(); // TODO
  const service = doc.service?.find(x => x.type === 'DecentralizedWebNode');
  if (!service) throw new Error(); // TODO
  return (service.serviceEndpoint as DwnServiceEndpoint).nodes[0];
};

export const createMessage = async (signature: SignatureInput, data: string): Promise<RecordsWrite> => {
  return await RecordsWrite.create({
    data                        : Buffer.from(data, 'utf-8'),
    dataFormat                  : 'text/plain',
    authorizationSignatureInput : signature
  });
};

export const sendMessage = async (endpoint: string, target: string, message: RecordsWrite, data?: any): Promise<void> => {
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
