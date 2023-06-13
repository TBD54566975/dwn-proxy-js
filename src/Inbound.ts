import { IRecordsQueryHandler, IRecordsWriteHandler, IHttpHandle } from './types.js';
import DwnHttp from './DwnHttp.js';

export interface IInbound {
  recordsQuery: IRecordsQueryHandler;
  recordsWrite: IRecordsWriteHandler;
  handle: IHttpHandle;
}

export class Inbound implements IInbound {
  recordsQuery: IRecordsQueryHandler;
  recordsWrite: IRecordsWriteHandler;

  handle: IHttpHandle = async (req, res) => {
    try {
      const { isValid, message, data } = await DwnHttp.parse(req);

      if (isValid) {
        const interfaceMethod = `${message.descriptor.interface}${message.descriptor.method}`;
        if (interfaceMethod === 'RecordsQuery') {
          const record = await this.recordsQuery(message);
          if (record) {
            DwnHttp.reply(res, record);
          } else {
            console.log('TODO dwn.processMessage() and send response');
          }
        } else if (interfaceMethod === 'RecordsWrite') {
          const isWritten = await this.recordsWrite(message, data);
          if (isWritten) {
            console.log('TODO dwn.processMessage() and send response');
          } else {
            // TODO what should I set the status to?
            DwnHttp.reply(res, undefined, 500);
          }
        } else {
          DwnHttp.reply(res, undefined, 404);
        }
      }
    } catch (err) {
      // TODO
      console.error(err);
    }
  };
}