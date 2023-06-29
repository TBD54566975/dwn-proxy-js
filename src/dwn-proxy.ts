import { DwnHttpClient } from './dwn-http-client.js'
import { DwnHttpServer, readReq } from './dwn-http-server.js'
import type { DwnRequest, DwnResponse } from './dwn-types.js'
import { Dwn, SignatureInput } from '@tbd54566975/dwn-sdk-js'

interface IHandler {
  (dwnRequest: DwnRequest): Promise<void | DwnResponse>
}
interface IMatch {
  (req: DwnRequest): boolean
}
interface IAddHandler {
  (match: IMatch, handler: IHandler): void
}
interface IHandlerMatch {
  match: IMatch
  handler: IHandler
}

type DidStateWithSignatureInput = {
  id: string
  signatureInput: SignatureInput
}
export type DwnProxyOptions = Partial<{
  serviceEndpoint: string
  didState: DidStateWithSignatureInput
}>

export class DwnProxy {
  server: DwnHttpServer
  client: DwnHttpClient
  options: DwnProxyOptions
  dwn: Dwn
  #handlers: Array<IHandlerMatch> = []

  constructor(options: DwnProxyOptions) {
    this.options = options
  }

  #inbound = async (request: DwnRequest): Promise<DwnResponse | void> => {
    // [kw] could use a has map of sorts instead of iterating every time
    for (const { match, handler } of this.#handlers) {
      const isMatch = match(request)
      if (isMatch) {
        if (request.data) // go ahead and read the data into an object
          request.data = await readReq(request.data)
        return await handler(request)
      }
    }

    throw new Error('Unable to find middleware')
  }

  addHandler: IAddHandler = (match, handler) => this.#handlers.push({ match, handler })

  async listen(port: number) {
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