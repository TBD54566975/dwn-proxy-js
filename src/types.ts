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