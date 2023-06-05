// TODO all of this is stubbed in

export type NextFunction = () => void;

export type DwnDescriptor = {
  schema: string;
  protocol: string;
}

export type DwnMessage = {
  descriptor: DwnDescriptor;
  data: any;
}