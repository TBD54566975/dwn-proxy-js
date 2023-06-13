import http from 'http';
import { DwnMessage } from './types.js';
import { DwnJsonRpc } from './DwnJsonRpc.js';
import { readOctetStream } from './Http.js';
import { Encoder, Message } from '@tbd54566975/dwn-sdk-js';

interface IParse {
  (req: http.IncomingMessage): Promise<{
    isValid: boolean;
    message: DwnMessage;
    data: string | void;
  }>;
}

interface IReply {
  // TODO type the record
  (res: http.ServerResponse, record?: any, code?: number): void;
}

export class DwnHttp {
  static parse: IParse = async req => {
    const message = DwnJsonRpc.parse(req.headers['dwn-request'] as string);
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

  static reply: IReply = (res, record, code) =>
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
                encodedData: record ? Encoder.stringToBase64Url(JSON.stringify(record)) : undefined
              }
            ],
            record: {}
          }
        }
      }
    ));
}