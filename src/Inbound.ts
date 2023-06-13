import { Encoder, Message } from '@tbd54566975/dwn-sdk-js';
import { parseDwm } from './JsonRpc.js';
import { IRecordsQueryHandler, IRecordsWriteHandler, IHttpHandle } from './types.js';
import { readOctetStream } from './Http.js';

export interface IInbound {
  recordsQuery: IRecordsQueryHandler;
  recordsWrite: IRecordsWriteHandler;
  handle: IHttpHandle;
}

const messageReply = (obj, code = 200) => ({
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
});

export class Inbound implements IInbound {
  recordsQuery: IRecordsQueryHandler;
  recordsWrite: IRecordsWriteHandler;

  handle: IHttpHandle = async (req, res) => {
    try {
      const message = parseDwm(req.headers['dwn-request'] as string);

      let isValidSchema = false;
      try {
        Message.validateJsonSchema(message);
        isValidSchema = true;
      } catch (err) {
        res.setHeader('dwn-response', JSON.stringify(messageReply(undefined, 400)));
      }

      if (isValidSchema) {
        const interfaceMethod = `${message.descriptor.interface}${message.descriptor.method}`;
        if (interfaceMethod === 'RecordsQuery') {
          const record = await this.recordsQuery(message);
          if (record) {
            res.setHeader('dwn-response', JSON.stringify(messageReply(record, 400)));
          } else {
            console.log('TODO dwn.processMessage() and send response');
          }
        } else if (interfaceMethod === 'RecordsWrite') {
          const data = await readOctetStream(req);
          const isWritten = await this.recordsWrite(message, data);
          if (isWritten) {
            console.log('TODO dwn.processMessage() and send response');
          } else {
            // TODO what should I set the status to?
            res.setHeader('dwn-response', JSON.stringify(messageReply(undefined, 500)));
          }
        } else {
          res.setHeader('dwn-response', JSON.stringify(messageReply(undefined, 404)));
        }
      }
    } catch (err) {
      undefined;
    }
  };
}