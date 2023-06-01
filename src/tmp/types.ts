import { DwnInterfaceName, DwnMethodName } from '@tbd54566975/dwn-sdk-js';

export enum Protocol {
  TBDex = 'TBDex'
}

// TODO these don't belong here, they belong in a dedicated @types/dwn package
export type DwnMessage = {
  descriptor: {
    interface: DwnInterfaceName;
    method: DwnMethodName;
    protocol: Protocol;
  };
  authorization: any;
}

export type MultiTenantDwm = {
  target: string;
  message: DwnMessage;
}