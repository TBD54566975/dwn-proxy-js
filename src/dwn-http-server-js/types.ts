import http from 'http';
import { RecordsWriteMessage, RecordsQueryMessage, MessageReply } from '@tbd54566975/dwn-sdk-js';

export interface IRequestListener {
  (req: http.IncomingMessage, res: http.ServerResponse): Promise<void>;
}

// TODO don't love this
export type DwnMessage = RecordsQueryMessage | RecordsWriteMessage;

export type DwnRequest = {
  target?: string;
  message: DwnMessage;
  data?: any; // TODO type this
}

export interface IPreProcess {
  (dwnRequest: DwnRequest): Promise<void | Partial<{
      halt: boolean;
      reply: MessageReply;
    }>>;
}

export type DwnHttpServerOptions = Partial<{
  did: string;
  fallback: IRequestListener;
  storagePrefix: string;
  dwnProcess: Partial<{
    disable: boolean;
    preProcess: IPreProcess;
    postProcess: (dwnRequest: DwnRequest) => Promise<void>;
  }>;
}>;

