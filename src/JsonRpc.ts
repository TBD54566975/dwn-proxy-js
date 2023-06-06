import { DwnMessage } from './types.js';

export type MultiTenantDwm = {
  target: string;
  message: DwnMessage;
}

type JsonRpc = {
  jsonrpci: string;
  id: string;
  method: string;
  params: MultiTenantDwm
}

export const parseDwm = (raw: string): MultiTenantDwm => {
  const jsonRpc = JSON.parse(raw) as JsonRpc;
  return jsonRpc.params;
};