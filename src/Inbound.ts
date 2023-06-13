import { IRecordsQueryHandler, IRecordsWriteHandler, IHttpHandle } from './types.js';
import { parse, respond } from './DWN.js';

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
      const { isValid, message, data } = await parse(req);

      if (isValid) {
        const interfaceMethod = `${message.descriptor.interface}${message.descriptor.method}`;
        if (interfaceMethod === 'RecordsQuery') {
          const record = await this.recordsQuery(message);
          if (record) {
            respond(res, record);
          } else {
            console.log('TODO dwn.processMessage() and send response');
          }
        } else if (interfaceMethod === 'RecordsWrite') {
          const isWritten = await this.recordsWrite(message, data);
          if (isWritten) {
            console.log('TODO dwn.processMessage() and send response');
          } else {
            // TODO what should I set the status to?
            respond(res, undefined, 500);
          }
        } else {
          respond(res, undefined, 404);
        }
      }
    } catch (err) {
      undefined;
    }
  };
}