import DwnProxy from './dwn-proxy.js'

class TbdPfiDwnProxy extends DwnProxy {
  /** configure protocol */
  /** map requests to functions */

  constructor() {
    super()

    super.mapInbound(() => undefined, this.offering)
    super.mapInbound(() => undefined, this.rfq)
    super.mapOutbound(() => undefined, this.quote)
    super.mapOutbound(() => undefined, this.orderStatus)
  }

  offering = async () => {
    console.log('todo')
    /**
     * - fetch from backend
     * - write record (publish: true)
     * - return record
     */
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

const proxy = new TbdPfiDwnProxy()
await proxy.listen()