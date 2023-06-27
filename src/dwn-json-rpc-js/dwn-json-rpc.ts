import { Request } from 'express'
import type { Readable as IsomorphicReadable } from 'readable-stream'
import { JsonRpcRequest } from './dwn-server-copy-pasta/lib/json-rpc'

export type DwnRequest = {
  target: string
  message: any // TODO dwn-sdk-js
  data?: IsomorphicReadable
}

export class DwnJsonRpc {
  static parse = (req: Request): DwnRequest | void => {
    try {
      const contentLength = req.headers['content-length']
      const transferEncoding = req.headers['transfer-encoding']
      const requestDataStream =
        (parseInt(contentLength) > 0 || transferEncoding !== undefined) ? req as IsomorphicReadable : undefined

      const dwnRequest = JSON.parse(req.headers['dwn-request'] as string) as JsonRpcRequest

      return {
        target  : dwnRequest.params.target,
        message : dwnRequest.params.message,
        data    : requestDataStream
      }
    } catch (err) {
      console.error('Unable to parse DwnJsonRpc', err)
      return undefined
    }
  }
}