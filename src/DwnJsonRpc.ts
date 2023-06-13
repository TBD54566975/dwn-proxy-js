import { DwnMessage } from './types.js';

interface MultiTenantDwm {
  target: string;
  message: DwnMessage;
}

interface JsonRpc {
  jsonrpci: string;
  id: string;
  method: string;
  params: MultiTenantDwm
}

export default class DwnJsonRpc {
  static parse = (raw: string): DwnMessage => {
    const jsonRpc = JSON.parse(raw) as JsonRpc;
    const message = jsonRpc.params.message;
    return message;
  };
}