import http from 'http';

export interface IRecordsQueryHandler {
  (message: DwnMessage): Promise<void | DwnRecord>;
}
export interface IRecordsWriteHandler {
  (message: DwnMessage): Promise<boolean>;
}
export interface IRestfulHandler {
  (req: http.IncomingMessage): Promise<void | DwnRecord>;
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
export type DwnRecord = {
  something: string;
}