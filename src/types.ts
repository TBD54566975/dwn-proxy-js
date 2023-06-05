// TODO all of this is stubbed in

export type NextFunction = () => void;

export const DwnInterface = {
  Records: 'Records'
};

export const DwnMethod = {
  Write : 'Write',
  Query : 'Query'
};

export type DwnDescriptor = {
  interface: string;
  method: string;
  protocol?: string;
  schema?: string;
}

export type DwnMessage = {
  descriptor: DwnDescriptor;
  data: any;
}