import http from 'http';
import DwnJsonRpc from './DwnJsonRpc.js';
import { DwnMessage } from './DwnMessage.js';
import Http from './Http.js';
import { Encoder } from '@tbd54566975/dwn-sdk-js';

interface IParse {
  (req: http.IncomingMessage): Promise<void | {
    message: DwnMessage;
    data: string | void;
  }>;
}

interface IReply {
  // TODO type the record
  (res: http.ServerResponse, record?: any, code?: number): void;
}

export default class DwnHttp {
  static parse: IParse = async req => {
    if (req.headers['dwn-request']) {
      const message = DwnJsonRpc.parse(req.headers['dwn-request'] as string);
      const data = await Http.readOctetStream(req);

      return {
        message,
        data
      };
    }
  };

  static reply: IReply = (res, record, code = 200) =>
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