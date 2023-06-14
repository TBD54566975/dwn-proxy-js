import http from 'http';
import { DwnMessage } from './DwnMessage.js';
import { MessageReply } from '@tbd54566975/dwn-sdk-js';

// TODO this whole file is bleh
export interface IRecordsQueryHandler {
  (message: DwnMessage): Promise<void | MessageReply>;
}
export interface IRecordsWriteHandler {
  (message: DwnMessage, data: any): Promise<boolean>;
}
export interface IRestfulHandler {
  (req: http.IncomingMessage): Promise<void | DwnRecord>;
}
export interface IHttpHandle {
  (req: http.IncomingMessage, res: http.ServerResponse): Promise<void>;
}


// TODO this doesn't belong here
export type DwnRecord = {
  targetDid: string;
  record: any;
}