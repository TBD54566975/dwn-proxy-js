import { Message, RecordsWriteMessage, RecordsQueryMessage } from '@tbd54566975/dwn-sdk-js';

export type DwnMessage = RecordsQueryMessage | RecordsWriteMessage;

interface IValidate {
  (message: DwnMessage): boolean;
}

export class DwnMessageValidator {
  static validate: IValidate = message => {
    let isValid = false;
    try {
      Message.validateJsonSchema(message);
      isValid = true;
    } catch (err) {
      console.error('Invalid DWN Message schema', err);
    }
    return isValid;
  };
}