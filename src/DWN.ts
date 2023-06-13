import http from 'http';
import { Encoder, Message } from '@tbd54566975/dwn-sdk-js';
import { DwnMessage } from './types.js';
import { parseDwm } from './JsonRpc.js';
import { readOctetStream } from './Http.js';

interface IParse {
  (req: http.IncomingMessage): Promise<{
    isValid: boolean;
    message: DwnMessage;
    data: string | void;
  }>;
}
export const parse: IParse = async req => {
  const message = parseDwm(req.headers['dwn-request'] as string);
  const data = await readOctetStream(req);

  let isValid = false;
  try {
    Message.validateJsonSchema(message);
    isValid = true;
  } catch (err) {
    console.error('Invalid DWN Message schema', err);
  }

  return {
    isValid,
    message,
    data
  };
};

interface IRespond {
  (res: http.ServerResponse, data?: any, code?: number): void;
}
export const respond: IRespond = (res, obj, code = 200) =>
  res.setHeader('dwn-response', JSON.stringify(
    {
      result: {
        reply: {
          status: {
            code
          },
          entries: [
            {
              descriptor: {
                dataFormat: 'application/json'
              },
              encodedData: obj ? Encoder.stringToBase64Url(JSON.stringify(obj)) : undefined
            }
          ],
          record: {}
        }
      }
    }
  ));
