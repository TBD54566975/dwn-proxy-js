import { DwnMessage } from './dwn-http-server-js/types.js';
import { DidState } from '@tbd54566975/dids';
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
  target?: string;
  descriptors?: any;
  data: any;
}

export interface IRestful {
  (req: http.IncomingMessage): Promise<void | OutboundDwnIntent>;
}

export interface IRestfulHandler {
  path: string;
  handler: IRestful;
}

export type DidStateWithSignatureInput = DidState & {
  signatureInput: SignatureInput;
}

export type DwnProxyOptions = Partial<{
  didState: DidStateWithSignatureInput;
  serviceEndpoint: string;
}>;