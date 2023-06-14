import { DwnMessage } from './DwnMessage.js';
import { MessageReply } from '@tbd54566975/dwn-sdk-js';

export interface IRecordsQueryHandler {
  (message: DwnMessage): Promise<void | MessageReply>;
}
export interface IRecordsWriteHandler {
  (message: DwnMessage, data: any): Promise<boolean>;
}
interface IHandler {
  (message: DwnMessage, data: string | void): Promise<void | MessageReply>;
}
interface IHandlers {
  recordsQuery?: IRecordsQueryHandler;
  recordsWrite?: IRecordsWriteHandler;
}
interface IRecords {
  query: (handler: IRecordsQueryHandler) => void;
  write: (handler: IRecordsWriteHandler) => void;
}
interface IHandle {
  (message: DwnMessage, data: string | void): Promise<void | MessageReply>;
}
export interface IDwn {
  records: IRecords;
  handle: IHandle;
}

export default class Dwn implements IDwn {
  #handlers: IHandlers = {};

  #recordsQuery: IHandler = async message => {
    if (!this.#handlers.recordsQuery) {
      // todo probably handle gracefully here, rather than throw an error
      throw new Error('Handler not defined');
    }

    const reply = await this.#handlers.recordsQuery(message);
    if (reply) {
      return reply;
    } else {
      console.log('TODO dwn.processMessage() and send response');
    }
  };

  #recordsWrite: IHandler = async (message, data) => {
    if (!this.#handlers.recordsWrite) {
      // todo probably handle gracefully here, rather than throw an error
      throw new Error('Handler not defined');
    }

    const isWritten = await this.#handlers.recordsWrite(message, data);
    if (isWritten) {
      console.log('TODO dwn.processMessage() and send response');
    } else {
      return;
    }
  };

  records: IRecords = {
    query : handler => this.#handlers.recordsQuery = handler,
    write : handler => this.#handlers.recordsWrite = handler
  };

  handle: IHandle = async (message, data) => {
    const interfaceMethod = `${message.descriptor.interface}${message.descriptor.method}`;
    switch (interfaceMethod) {
      case 'RecordsQuery':
        return this.#recordsQuery(message);
      case 'RecordsWrite':
        return this.#recordsWrite(message, data);
      default:
        // todo
    }
  };
}