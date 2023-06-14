import { DwnMessage } from './DwnMessage.js';
import { MessageReply } from '@tbd54566975/dwn-sdk-js';

export interface IRecordsQueryHandler {
  (message: DwnMessage): Promise<void | MessageReply>;
}

export default class DwnRecordsQuery {
  #handler: IRecordsQueryHandler;

  constructor(handler: IRecordsQueryHandler) {
    this.#handler = handler;
  }

  handle: IRecordsQueryHandler = async message => {
    const reply = await this.#handler(message);
    if (reply) {
      return reply;
    } else {
      console.log('TODO dwn.processMessage() and send response');
    }
  };
}
