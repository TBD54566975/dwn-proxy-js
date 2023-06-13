import http from 'http';

// TODO this whole file is bleh
export interface IRecordsQueryHandler {
  (message: DwnMessage): Promise<void | DwnRecord>;
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

// TODO these don't belong here
export type DwnDescriptor = {
  interface: string;
  method: string;
  protocol?: string;
  schema?: string;
  filter: any;
}
export type DwnMessage = {
  descriptor: DwnDescriptor;
  data: any;
}
export type DwnRecord = { // TODO this is obviously wrong
  targetDid: string;
  record: any;
}