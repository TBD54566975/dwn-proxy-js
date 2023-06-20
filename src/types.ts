import { DwnMessage } from './dwn-http-server-js/types.js';
import { SignatureInput } from '@tbd54566975/dwn-sdk-js';
import http from 'http';

export type DwnRecord = {
  todo: string; // todo
}

export interface IRecordsQuery {
  (message: DwnMessage): Promise<void | DwnRecord>;
}

export interface IRecordsWrite {
  (message: DwnMessage, data: any): Promise<boolean>;
}

export type OutboundDwnIntent = {
  targetDid: string;
  record: DwnRecord;
}

export interface IRestful {
  (req: http.IncomingMessage): Promise<void | OutboundDwnIntent>;
}

export interface IRestfulHandler {
  path: string;
  handler: IRestful;
}

export type DwnProxyOptions = Partial<{
  signatureInput: SignatureInput;
  serviceEndpoint: string;
}>;