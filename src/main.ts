import { DwnInterfaceName, DwnMethodName, RecordsWrite } from '@tbd54566975/dwn-sdk-js'
import DwnProxy, { DwnProxyOptions } from './dwn-proxy.js'
import { DwnRequest, DwnResponse } from './dwn-types.js'

const isOffering = (dwnRequest: DwnRequest): boolean =>
  dwnRequest.message.descriptor.interface === DwnInterfaceName.Records &&
  dwnRequest.message.descriptor.method === DwnMethodName.Write &&
  dwnRequest.message.descriptor.schema === 'Offering'

const isRfq = (dwnRequest: DwnRequest): boolean =>
  dwnRequest.message.descriptor.interface === DwnInterfaceName.Records &&
  dwnRequest.message.descriptor.method === DwnMethodName.Write &&
  dwnRequest.message.descriptor.protocol === 'TBDex' &&
  dwnRequest.message.descriptor.protocolPath === 'RFQ' &&
  dwnRequest.message.descriptor.schema === 'Offering'

class TbdPfiDwnProxy extends DwnProxy {
  /** configure protocol */
  /** map requests to functions */

  constructor(options: DwnProxyOptions) {
    super(options)

    super.inboundHandlers.push(req => isOffering(req) ? this.offering : undefined)
    super.inboundHandlers.push(req => isRfq(req) ? this.rfq : undefined)

    super.mapOutbound(() => undefined, this.quote)
    super.mapOutbound(() => undefined, this.orderStatus)
  }

  offering = async (request: DwnRequest): Promise<DwnResponse | void> => {
    console.log('todo', request)
    /**
     * - fetch from backend
     * - write record (publish: true)
     * - return record
     */
    const res = await fetch('backend/offering')
    const offering = await res.json()
    const record = await RecordsWrite.create({
      published                   : true, // todo
      data                        : offering                        ,
      dataFormat                  : 'application/json',
      authorizationSignatureInput : super.options.didState.signatureInput,
    })

    const reply = await super.dwn.processMessage(this.options.didState.id, record)

    return {
      reply
    }
  }

  rfq = async () => {
    console.log('todo')
    /**
     * - fetch to backend
     * - reply 202
     */
  }

  quote = async () => {
    console.log('todo')
    /**
     * - write rfq record
     * - write quote record
     * - send quote
     */
  }

  orderStatus = async () => {
    console.log('todo')
    /**
     * - write orderstatus record
     * - send orderstatus
     */
  }
}

const PORT = 8080
const proxy = new TbdPfiDwnProxy({
  //todo
})
await proxy.listen(PORT)