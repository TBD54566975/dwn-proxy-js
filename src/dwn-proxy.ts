import { DwnHttpClient } from './dwn-http-client.js'
import { DwnHttpServer, readReq } from './dwn-http-server.js'
import type { DwnRequest, DwnResponse } from './dwn-types.js'
import { Dwn, SignatureInput } from '@tbd54566975/dwn-sdk-js'

interface IInbound {
  (dwnRequest: DwnRequest): ((dwnRequest: DwnRequest) => Promise<void | DwnResponse>) | void
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
  #handlers: Array<IInbound> = []

  constructor(options: DwnProxyOptions) {
    this.options = options
  }

  #inbound = async (request: DwnRequest): Promise<DwnResponse | void> => {
    // [kw] could use a has map of sorts instead of iterating every time
    for (const handler of this.#handlers) {
      const func = handler(request)
      if (func) {
        if (request.data) // go ahead and read the data into an object
          request.data = await readReq(request.data)
        return await func(request)
      }
    }

    throw new Error('Unable to find middleware')
  }

  addHandler = (lambda: (req: DwnRequest) => boolean, handler: ((dwnRequest: DwnRequest) => Promise<void | DwnResponse>)) =>
    this.#handlers.push(req => lambda(req) ? handler : undefined)

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