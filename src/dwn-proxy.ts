import { DwnHttpClient } from './dwn-http-client.js'
import { DwnHttpServer, readReq } from './dwn-http-server.js'
import { generateDidState } from './dwn-did.js'
import type { DwnRequest, DwnResponse, DidStateWithSignatureInput } from './dwn-types.js'
import { Dwn } from '@tbd54566975/dwn-sdk-js'

interface IMatch {
  (req: DwnRequest): boolean
}
interface IHandler {
  (dwnRequest: DwnRequest): Promise<void | DwnResponse>
}
interface IMatchHandler {
  match: IMatch
  handler: IHandler
}

export type DwnProxyOptions = Partial<{
  serviceEndpoint: string
  didState: DidStateWithSignatureInput
}>

export class DwnProxy {
  options: DwnProxyOptions
  server: DwnHttpServer
  client: DwnHttpClient
  dwn: Dwn
  #handlers: Array<IMatchHandler> = []

  constructor(options: DwnProxyOptions) {
    this.options = options
  }

  #inbound = async (request: DwnRequest): Promise<DwnResponse | void> => {
    // [kw] could use a has map of sorts instead of iterating every time
    for (const { match, handler } of this.#handlers) {
      const isMatch = match(request)
      if (isMatch) {
        if (request.payload) // go ahead and read the payload into an object
          request.payload = await readReq(request.payload)
        return await handler(request)
      }
    }

    throw new Error('Unable to find middleware')
  }

  addHandler = (match: IMatch, handler: IHandler) => this.#handlers.push({ match, handler })

  async listen(port: number) {
    if (!this.options.didState)
      this.options.didState = await generateDidState(this.options.serviceEndpoint ?? `http://0.0.0.0:${port}`)

    this.dwn = await Dwn.create()

    this.server = new DwnHttpServer({
      dwn     : this.dwn,
      handler : this.#inbound
    })

    this.server.listen(port, () => {
      console.log(`server listening on port ${port}`)
    })

    this.client = new DwnHttpClient()
  }
}