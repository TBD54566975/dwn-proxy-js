import { IRecordsQueryHandler, IRecordsWriteHandler } from './types.js';
import { DwnMessage, DwnMessageValidator } from './DwnMessage.js';
import { MessageReply } from '@tbd54566975/dwn-sdk-js';

interface IHandle {
  (message: DwnMessage, data: string | void): Promise<MessageReply | void>;
}
export interface IInbound {
  recordsQuery: IRecordsQueryHandler;
  recordsWrite: IRecordsWriteHandler;
  handle: IHandle;
}

export class Inbound implements IInbound {
  recordsQuery: IRecordsQueryHandler;
  recordsWrite: IRecordsWriteHandler;

  handle: IHandle = async (message, data) => {
    try {
      if (DwnMessageValidator.validate(message)) {
        const interfaceMethod = `${message.descriptor.interface}${message.descriptor.method}`;
        if (interfaceMethod === 'RecordsQuery') {
          const reply = await this.recordsQuery(message);
          if (reply) {
            return reply;
          } else {
            console.log('TODO dwn.processMessage() and send response');
          }
        } else if (interfaceMethod === 'RecordsWrite') {
          const isWritten = await this.recordsWrite(message, data);
          if (isWritten) {
            console.log('TODO dwn.processMessage() and send response');
          } else {
            return;
          }
        } else {
          return;
        }
      }
    } catch (err) {
      // TODO
      console.error(err);
    }
  };
}