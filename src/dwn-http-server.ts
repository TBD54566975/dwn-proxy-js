import express from 'express'
import type { Express, Request, Response } from 'express'
import cors from 'cors'
import { validateDwnRequestSchema, type DwnRequest, type DwnResponse } from './dwn-request-response.js'
import { Dwn } from '@tbd54566975/dwn-sdk-js'
import {  createJsonRpcErrorResponse, createJsonRpcResponse, JsonRpcErrorCodes, parseJsonRpcRequest } from './dwn-json-rpc.js'

export interface IHandler {
  (req: DwnRequest): Promise<DwnResponse | void>
}

type Options = {
  dwn: Dwn
  handler?: (req: DwnRequest) => Promise<DwnResponse | void>
  // [kw] can parameterize the json-rpc parsing
}

export const readReq = async <T = any>(req: Request): Promise<T | void> => {
  let chunks = ''
  for await (const chunk of req) chunks += chunk
  if (chunks) return JSON.parse(chunks)
}

export class DwnHttpServer {
  #options: Options
  api: Express

  constructor(options: Options) {
    this.#options = options
    this.api = express()

    this.api.use(cors({ exposedHeaders: 'dwn-response' }))
    this.api.get('/health', (_, res) => res.json({ ok: true }))

    this.api.get('/', (_, res) => {
      res.setHeader('content-type', 'text/plain')
      return res.send('please use a web5 client, for example: https://github.com/TBD54566975/web5-js ')
    })

    this.api.post('/', async (req: Request, res: Response) => {
      try {
        let dwnRequest: DwnRequest

        // N.B. parse out the dwn-request from the JSON-RPC abstraction within the http request
        try {
          dwnRequest = parseJsonRpcRequest(JSON.parse(req.headers['dwn-request'] as string))
          if (!dwnRequest.payload) {
            const contentLength = req.headers['content-length'] ?? '0'
            const transferEncoding = req.headers['transfer-encoding']
            const requestDataStream = (parseInt(contentLength) > 0 || transferEncoding !== undefined) ? req : undefined
            if (requestDataStream)
              dwnRequest.payload = await readReq(requestDataStream)
          }
        } catch (err) {
          console.error('Failed to parse dwn-request or payload', err)
          return res.status(400).json(createJsonRpcErrorResponse(JsonRpcErrorCodes.BadRequest, err.message))
        }

        // N.B. validate the dwn-request JSON format
        try {
          const errors = validateDwnRequestSchema(dwnRequest)
          if (errors.length > 0) {
            console.error('dwn-request JSON schema validation failed', errors)
            return res.status(400).json(createJsonRpcErrorResponse(JsonRpcErrorCodes.BadRequest, 'validation error', errors))
          }
        } catch(err) {
          console.error('Failed to validate dwn-request JSON schema', err)
          return res.status(400).json(createJsonRpcErrorResponse(JsonRpcErrorCodes.BadRequest, err.message))
        }

        // N.B. validate the DWN tenante
        try {
          const validationError = await this.#options.dwn.validateTenant(dwnRequest.target)
          if (validationError) {
            console.error('tenant validation failed', validationError)
            return res.status(400).json(createJsonRpcErrorResponse(JsonRpcErrorCodes.BadRequest, 'validation error', validationError))
          }
        } catch(err) {
          console.error('Failed to validate DWN tenant', err)
          return res.status(500).json(createJsonRpcErrorResponse(JsonRpcErrorCodes.InternalError, err.message))
        }

        // N.B. validate the DWN Message integrity
        try {
          const validationError = await this.#options.dwn.validateMessageIntegrity(dwnRequest.message)
          if (validationError) {
            console.error('DWN Message integrity check failed', validationError)
            return res.status(400).json(createJsonRpcErrorResponse(JsonRpcErrorCodes.BadRequest, 'validation error', validationError))
          }
        } catch (err) {
          console.error('Failed to validate DWN Message integrity', err)
          return res.status(500).json(createJsonRpcErrorResponse(JsonRpcErrorCodes.InternalError, err.message))
        }

        console.log('kw dbg', this.#options.handler)
        const dwnResponse = this.#options.handler ? await this.#options.handler(dwnRequest) : undefined
        console.log('kw dbg', dwnResponse)

        if (!dwnResponse) {
          const reply = await this.#options.dwn.processMessage(dwnRequest.target, dwnRequest.message, dwnRequest.payload as any)
          res.json(createJsonRpcResponse({ reply }))
        } else if (dwnResponse.payload) {
          res.setHeader('content-type', 'application/octet-stream')
          res.setHeader('dwn-response', JSON.stringify(createJsonRpcResponse(dwnResponse)))
          dwnResponse.payload.pipe(res)
        } else {
          res.json(createJsonRpcResponse(dwnResponse))
        }
      } catch (err) {
        console.error('Catch-all failed to process DWN Message', err)
        return res.status(500).json(createJsonRpcErrorResponse(JsonRpcErrorCodes.InternalError, err.message))
      }
    })
  }

  listen = (port: number, callback?: () => void) => this.api.listen(port, callback)
}