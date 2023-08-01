import { v4 as uuidv4 } from 'uuid'
import type { DwnMessage } from './dwn-types.js'
import type { DwnRequest, DwnResponse } from './dwn-request-response.js'

export type JsonRpcId = string | number | null
export type JsonRpcParams = DwnRequest // todo
export type JsonRpcVersion = '2.0'

export type JsonRpcRequest = {
  jsonrpc: JsonRpcVersion
  id?: JsonRpcId
  method: string
  params?: JsonRpcParams
}

export enum JsonRpcErrorCodes {
  // JSON-RPC 2.0 pre-defined errors
  InvalidRequest = -32600,
  MethodNotFound = -32601,
  InvalidParams = -32602,
  InternalError = -32603,
  ParseError = -32700,

  // App defined errors
  BadRequest = -50400, // equivalent to HTTP Status 400
  Unauthorized = -50401, // equivalent to HTTP Status 401
  Forbidden = -50403, // equivalent to HTTP Status 403
}

// todo
type Reply = any

export type JsonRpcResult = {
  reply: Reply
}

export type JsonRpcError = {
  code: JsonRpcErrorCodes;
  message: string;
  data?: any;
}

export type JsonRpcResponse = {
  jsonrpc: JsonRpcVersion
  id: JsonRpcId
  result?: JsonRpcResult
  error?: JsonRpcError
}

export const parseJsonRpcRequest = (req: JsonRpcRequest): DwnRequest => {
  if (!req.params) throw new Error('JSON-RPC must include the DwnRequest in the params property')
  return req.params
}

export const createJsonRpcRequest = (target: string, message: DwnMessage): JsonRpcRequest => {
  return {
    jsonrpc : '2.0',
    id      : uuidv4(),
    method  : 'dwn.processMessage', // hard coded
    params  : {
      target,
      message
    }
  }
}

export const parseJsonRpcResponse = (res: JsonRpcResponse): Reply | void => {
  return res.result?.reply
}

export const parseJsonRpcErrorResponse = (res: JsonRpcResponse): JsonRpcError | void => {
  return res.error
}

export const createJsonRpcResponse = (res: DwnResponse): JsonRpcResponse => {
  return {
    jsonrpc : '2.0',
    id      : uuidv4(),
    result  : {
      reply: res.reply
    }
  }
}

export const createJsonRpcErrorResponse = (code: JsonRpcErrorCodes, message: string, data?: any): JsonRpcResponse => {
  return {
    jsonrpc : '2.0',
    id      : uuidv4(),
    error   : {
      code,
      message,
      data
    }
  }
}