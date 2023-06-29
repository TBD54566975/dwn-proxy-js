# DWN Proxy <!-- omit in toc -->

Making DWN integrations with traditional backend services easy.

⚠️ UNDER DEVELOPMENT ⚠️

`dwn-proxy-js` is a bidirectional proxy between [Decentralized Web Nodes](https://identity.foundation/decentralized-web-node/spec) and your web services.

* [Design](#design)
* [Usage](#usage)
  * [`new DwnProxy(options)`](#new-dwnproxyoptions)
  * [`DwnProxy.listen(port)`](#dwnproxylistenport)
  * [`DwnProxy.addHandler(lambda, handler)`](#dwnproxyaddhandlerlambda-handler)
  * [`DwnProxy.server.api`](#dwnproxyserverapi)
* [Project Resources](#project-resources)

![Intro diagram](./images/intro.png)

# Design

At it's lightest, this package can act as a network router for DWN Message's. At it's heaviest, this package can be used to selectively abstract DWN-concepts from your web services. You have optionality as to the degree to which you differentiate across the two network interfaces.

Like the [`dwn-server`](https://github.com/TBD54566975/dwn-server), this package is intended to be used server-side, wherein DWN Messages are interfaced with via JSON-RPC (compatible with [`web5-js`](https://github.com/TBD54566975/web5-js)'s Agent [interface](https://github.com/TBD54566975/web5-js/tree/main/packages/web5-agent)). However, unlike [`dwn-server`](https://github.com/TBD54566975/dwn-server), this package offers a programmatic interface for handling DWN Messages, both inbound and outbound, with the design intent of integrating with traditional backend services.

# Usage

```cli
npm install @tbd54566975/dwn-proxy-js
```

```typescript
import { DwnProxy, DwnRequest, Request, Response, readReq } from '@tbd54566975/dwn-proxy-js'

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
    await this.dwn.processMessage(id, request.message, request.data)
  }

  async handlerB(request: DwnRequest) {
    // do whatever you want
    // ...
    // example: maybe forward the request onto your backend
    await fetch('/your-backend', {
      method: 'POST',
      body: JSON.stringify(request)
    })
  }

  async apiC(req: Request, res: Response) {
    const body = await readReq<any>(req)

    // do whatever you want
    // ...
    // maybe send the message onto a user
    await this.client.send(body.to, body.dwnRecordsWrite, JSON.stringify(body.data))
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

    // wire-up your server handlers
    this.server.api.post('/handler-c', this.outboundHandlerC)
    this.server.api.post('/handler-d', this.apiD)
  }
}

const PORT = 8080
const proxy = new MyProxy()
await proxy.listen(PORT)
```

## `new DwnProxy(options)`

- `options`:
  - (optional) `serviceEndpoint`
  - (optional) `didState`

## `DwnProxy.listen(port)`

Start a JSON-RPC server, hosting an HTTP server at the given `port`.

- (required) `port`: number

## `DwnProxy.addHandler(lambda, handler)`

Add a handler for inbound DWN Messages.

```typescript
const isMyMessage = req => 
  req.message.descriptor.interface === 'Records' &&
  req.message.descriptor.method === 'Write' &&
  req.message.descriptor.schema === 'https://your-schema/file.json'
proxy.addHandler(
  isMyMessage,
  async req => {
    // do whatever you would like with the given DwnRequest
  }
)
```

- (required) `lambda`: `(req: DwnRequest) => boolean`
  - if evaluated to `true` then use `handler` for the given message
- (required) `handler`: `(dwnRequest: DwnRequest) => Promise<void | DwnResponse>`
  - if return type is `void` then the underlying `DwnHttpServer` will call `dwn.processMessage()` whereafter it will respond to the client w/ the given result
  - Else, you can explicitly specify your `DwnResponse` which will *not* result in a subsequent call to `dwn.processMessage()`

## `DwnProxy.server.api`

Directly interface with the [Express](https://expressjs.com/) server

```typescript
proxy.server.api.post('/some-outbound-api', async (req, res) => {
  // do whatever you would like 

  res.status(200)
  res.end()
})
```

# Project Resources

| Resource                                   | Description                                                                   |
| ------------------------------------------ | ----------------------------------------------------------------------------- |
| [CODEOWNERS](./CODEOWNERS)                 | Outlines the project lead(s)                                                  |
| [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md) | Expected behavior for project contributors, promoting a welcoming environment |
| [CONTRIBUTING.md](./CONTRIBUTING.md)       | Developer guide to build, test, run, access CI, chat, discuss, file issues    |
| [GOVERNANCE.md](./GOVERNANCE.md)           | Project governance                                                            |
| [LICENSE](./LICENSE)                       | Apache License, Version 2.0                                                   |