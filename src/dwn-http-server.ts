import express from 'express'
import type { Express, Request, Response } from 'express'
import cors from 'cors'
import { DwnRequest, DwnResponse } from './dwn-types.js'
import { Dwn } from '@tbd54566975/dwn-sdk-js'
import { parseRequest, createResponse } from './dwn-json-rpc.js'

export interface IHandler {
  (req: DwnRequest): Promise<DwnResponse | void>
}

type Options = {
  dwn: Dwn
  handler?: (req: DwnRequest) => Promise<DwnResponse | void>
  fallback?: (req: Request, res: Response) => Promise<void>
  // [kw] can parameterize the json-rpc parsing
}

export default class DwnHttpServer {
  #options: Options
  #api: Express

  constructor(options: Options) {
    this.#options = options
    this.#api = express()

    this.#api.use(cors({ exposedHeaders: 'dwn-response' }))
    this.#api.get('/health', (_, res) => res.json({ ok: true }))

    this.#api.get('/', (_req, res) => {
      // return a plain text string
      res.setHeader('content-type', 'text/plain')
      return res.send('please use a web5 client, for example: https://github.com/TBD54566975/web5-js ')
    })

    this.#api.post('/', async (req: Request, res: Response) => {
      try {
        let dwnRequest: DwnRequest
        try {
          dwnRequest = parseRequest(JSON.parse(req.headers['dwn-request'] as string))
          if (!dwnRequest.data) {
            const contentLength = req.headers['content-length']
            const transferEncoding = req.headers['transfer-encoding']
            const requestDataStream = (parseInt(contentLength) > 0 || transferEncoding !== undefined) ? req : undefined
            dwnRequest.data = requestDataStream
          }
        } catch (err) {
          // todo handle parse error (400)
          return
        }

        const dwnResponse = this.#options.handler ? await this.#options.handler(dwnRequest) : undefined

        if (!dwnResponse) {
          const reply = await this.#options.dwn.processMessage(dwnRequest.target, dwnRequest.message, dwnRequest.data as any)
          res.json(reply)
        } else if (dwnResponse.data) {
          res.setHeader('content-type', 'application/octet-stream')
          res.setHeader('dwn-response', JSON.stringify(createResponse(dwnResponse)))
          dwnResponse.data.pipe(res)
        } else {
          res.json(createResponse(dwnResponse))
        }
      } catch (err) {
        // todo handle catch-all error (500)
      }
    })

    if (this.#options.fallback)
      this.#api.use(this.#options.fallback)
  }

  listen = (port: number, callback?: () => void) => this.#api.listen(port, callback)
}