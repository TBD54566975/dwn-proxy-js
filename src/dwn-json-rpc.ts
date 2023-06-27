import type { DwnMessage, DwnMessageReply } from './dwn-http-server.js'

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

export interface JsonRpcParse {
  (req: JsonRpcRequest): DwnMessage
}

export const parseRequest: JsonRpcParse = req => {
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