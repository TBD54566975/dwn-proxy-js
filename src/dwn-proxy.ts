import { DwnHttpClient } from './dwn-http-client.js'
import { DwnHttpServer } from './dwn-http-server.js'
import { generateDidState } from './dwn-did.js'
import type { DwnRequest, DwnResponse, DidStateWithSignatureInput } from './dwn-types.js'
import { Dwn } from '@tbd54566975/dwn-sdk-js'
import type { MessageStore, DataStore, EventLog, TenantGate } from '@tbd54566975/dwn-sdk-js'
import { MessageStoreLevel, DataStoreLevel, EventLogLevel } from '@tbd54566975/dwn-sdk-js/stores'

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
  port: number
  serviceEndpoint: string
  didState: DidStateWithSignatureInput
  dwn: Partial<{
    instance: Dwn,
    store: {
      messageStore: MessageStore,
      dataStore: DataStore,
      eventLog: EventLog
    },
    tenantGate: TenantGate
  }>
}>

export class DwnProxy {
  options: DwnProxyOptions
  server: DwnHttpServer
  client: DwnHttpClient
  dwn: Dwn
  #handlers: Array<IMatchHandler> = []

  private constructor(options: DwnProxyOptions) {
    this.options = options
    if (this.options.dwn?.instance)
      this.dwn = this.options.dwn.instance
    this.client = new DwnHttpClient()
  }

  static async create(options: DwnProxyOptions): Promise<DwnProxy> {
    if (!options.dwn) options.dwn = {}

    if (!options.dwn.store)
      options.dwn.store = {
        messageStore : new MessageStoreLevel(),
        dataStore    : new DataStoreLevel(),
        eventLog     : new EventLogLevel()
      }

    if (!options.dwn.instance)
      options.dwn.instance = await Dwn.create({
        messageStore : options.dwn.store.messageStore,
        dataStore    : options.dwn.store.dataStore,
        eventLog     : options.dwn.store.eventLog,
        tenantGate   : options.dwn?.tenantGate
      })

    return new DwnProxy(options)
  }

  addHandler = (match: IMatch, handler: IHandler) => this.#handlers.push({ match, handler })

  async listen() {
    if (!this.options.port)
      this.options.port = 8080

    if (!this.options.didState)
      this.options.didState = await generateDidState(this.options.serviceEndpoint ?? `http://0.0.0.0:${this.options.port}`)

    this.server = new DwnHttpServer({
      dwn     : this.dwn,
      handler : async (request: DwnRequest): Promise<DwnResponse | void> => {
        // [kw] could use a has map of sorts instead of iterating every time
        for (const { match, handler } of this.#handlers) {
          if (match(request))
            return await handler(request)
        }

        throw new Error('Unable to find middleware')
      }
    })

    this.server.listen(this.options.port, () => {
      console.log(`server listening on port ${this.options.port}`)
    })
  }
}