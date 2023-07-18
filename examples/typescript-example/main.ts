import { RecordsQueryMessage } from '@tbd54566975/dwn-sdk-js'
import { DwnProxy, readReq } from '@tbd54566975/dwn-proxy-js'
import type { DwnRequest, Request, Response } from '@tbd54566975/dwn-proxy-js'


const isMessageA = (dwnRequest: DwnRequest): boolean =>
  dwnRequest.message.descriptor.interface === 'Records' &&
  dwnRequest.message.descriptor.method === 'Query' &&
  (dwnRequest.message as RecordsQueryMessage).descriptor.filter.schema === 'https://tbd.website/resources/message-a'

const isMessageB = (dwnRequest: DwnRequest): boolean =>
  dwnRequest.message.descriptor.interface === 'Records' &&
  dwnRequest.message.descriptor.method === 'Write' &&
  dwnRequest.message.descriptor.schema === 'https://tbd.website/resources/message-b'

class MyProxy extends DwnProxy {
  async handlerA(request: DwnRequest) {
    // do whatever you want
    // ...
    // example: maybe process the message using the DWN instance
    const { id } = this.options.didState
    await this.dwn.processMessage(id, request.message, request.payload)
  }

  async handlerB(request: DwnRequest) {
    // do whatever you want
    // ...
    // example: maybe forward the request onto your backend
    await fetch('/your-backend', {
      method : 'POST',
      body   : JSON.stringify(request)
    })
  }

  async apiC(req: Request, res: Response) {
    const body = await readReq<any>(req)

    // do whatever you want
    // ...
    // maybe send the message onto a user
    await this.client.send(body.to, body.dwnRecordsWrite, JSON.stringify(body.payload))
  }

  async apiD(req: Request, res: Response) {
    const body = await readReq<any>(req)

    // do whatever you want
    // ...
  }

  // overriding the default DwnProxy.listen()
  async listen(port: number) {
    await super.listen(port)

    // wire-up your dwn handlers
    this.addHandler(isMessageA, this.handlerA)
    this.addHandler(isMessageB, this.handlerB)

    // wire-up your server handlers eg for outgoing messages
    this.server.api.post('/handler-c', this.apiC)
    this.server.api.post('/handler-d', this.apiD)
  }
}

const PORT = 8080
const proxy = new MyProxy({})
await proxy.listen(PORT)