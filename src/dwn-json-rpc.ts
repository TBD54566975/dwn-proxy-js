import type { DwnRequest, DwnResponse } from './dwn-types.js'

export type JsonRpcId = string | number | null
export type JsonRpcParams = DwnRequest // todo
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

export const parseRequest = (req: JsonRpcRequest): DwnRequest => {
  return req.params
}

export const createResponse = (res: DwnResponse): JsonRpcResponse => {
  return {
    jsonrpc : '2.0',
    id      : '',
    result  : {
      reply: res.reply
    }
  }
}