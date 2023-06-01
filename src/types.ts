// TODO all of this is stubbed in

export type NextFunction = () => void;

export type ForwardHttp = {
  path: string;
  method: string;
  // headers: any;
  // body: any;
};

export type DwnDescriptor = {
  schema: string;
  protocol: string;
}

export type DwnMessage = {
  descriptor: DwnDescriptor;
}