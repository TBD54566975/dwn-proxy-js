import type { DwnMessage, DwnMessageReply } from './dwn-types.js'

export type JsonRpcId = string | number | null
export type JsonRpcParams = DwnMessage // todo
export type JsonRpcVersion = '2.0'

export interface JsonRpcRequest {
  jsonrpc: JsonRpcVersion
  id?: JsonRpcId
  method: string
  params?: JsonRpcParams
}

export interface JsonRpcResponse {
  jsonrpc: JsonRpcVersion
  id: JsonRpcId
  result: any
  error?: undefined
}

export const parseRequest = (req: JsonRpcRequest): DwnMessage => {
  console.log('todo', req)
  return {
    todo: ''
  }
}

export const createResponse = (reply: DwnMessageReply): JsonRpcResponse => {
  console.log(reply)
  return {
    jsonrpc : '2.0',
    id      : '',
    result  : {}
  }
}