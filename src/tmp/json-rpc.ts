import { MultiTenantDwm, DwnMessage } from './types.js';

type JsonRpc = {
  jsonrpci: string;
  id: string;
  method: string;
  params: MultiTenantDwm
}

export const parseDwm = (raw: string): DwnMessage => {
  const jsonRpc = JSON.parse(raw) as JsonRpc;
  const message = jsonRpc.params.message;
  return message;
};
