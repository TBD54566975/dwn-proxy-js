# DWN Proxy

Making DWN integrations with traditional backend services easy.

⚠️ UNDER DEVELOPMENT ⚠️

`dwn-proxy-js` is a bidirectional proxy between [Decentralized Web Nodes](https://identity.foundation/decentralized-web-node/spec) and your web services.

![Intro diagram](./images/intro.png)

# Usage

At it's lightest, this package can act as a network router for DWN Message's. At it's heaviest, this package can be used to selectively abstract DWN-concepts from your web services. You have optionality as to the degree to which you differentiate across the two network interfaces.

Like the [`dwn-server`](https://github.com/TBD54566975/dwn-server), this package is intended to be used server-side, wherein DWN Messages are interfaced with via JSON-RPC (compatible with [`web5-js`](https://github.com/TBD54566975/web5-js)'s Agent interface). Also like [`dwn-server`](https://github.com/TBD54566975/dwn-server), this package uses the [`dwn-sdk-js`](https://github.com/TBD54566975/dwn-sdk-js) to implement a fully-featured DWN. However, unlike [`dwn-server`](https://github.com/TBD54566975/dwn-server), this package offers a programmatic interface for handling DWN Messages, both inbound and outbound, with the design intent of integrating with traditional backend services.

---

*Note:* we should reconsider the project composition in relation to `dwn-server`.

The two projects are distinct developer products, but they have significant overlap which can be isolated to a shared package. `dwn-json-rpc-js` could be a package which implements a fully-features DWN, using `dwn-sdk-js`, interfaced via JSON-RPC, which optional programmatic callbacks both prior-to and post DWN Message processing (that is, `dwn.processMessage()`).

---

```cli
npm install @tbd54566975/dwn-proxy-js
```

```typescript
import { App, Message } from '@tbd54566975/dwn-proxy-js';

const app = new App();

// your inbound handler for RecordsWrite's
app.inbound.records.write(
  async message => {
    const { descriptor: { protocol, schema }} = message;

    if (protocol === 'TBDEX' && schema === 'RFQ') {
      const response = await fetch(`/your/api/rfq`);
      return response.status === 200;
    }

    return false;
  }
);

// your outbound API
app.outbound.post('/api/quote', async req => { // example POST api handler
  const { targetDid, quote } = await req.body.json();

  // returning this will send the DWN Message to the targetDid
  return { 
    targetDid,
    data: quote
  };
});

const INBOUND_PORT = 3000;
const OUTBOUND_PORT = 3001;
app.listen(INBOUND_PORT, OUTBOUND_PORT);
```

*Note:* inbound and outbound executions are distinct network interfaces for reasons of security; often times enterprise environments will secure remote interfaces via network firewalls. TODO: check w/ InfoSec, does this actually make a difference since they're both executing within the same proces?

## `App.inbound.records.query(handler)`

// TODO diagram sequence of events

Optional method for handling inbound `RecordsQuery` messages. Since this package implements a fully-featured DWN, querying for records is already supported in accordance with the `dwn-sdk-js` reference implementation. The intent of this interface is to enable custom middleware and/or overriding the `dwn-sdk-js` records query.

```typescript
app.inbound.records.query(
  async message => { // handler function
    // space for custom middleware
    await myCustomMiddleware(message);

    // you can override the default DWN 
    // records querying with your own records
    if (message.descriptor.something)
      return myCustomRecord;
  }
);
```

`handler` - `(message: DwnMessage) => Promise<void | Record>`
  - If the return type is `void` then the underlying DWN will read from its own record store
  - Else if the return type is `Record` then the given record will be immediately returned to the requestor

## `App.inbound.records.write(handler)`

// TODO diagram how that `dwn.processMessage()` isn't called until *after* the handler returns

Method for handling inbound `RecordsWrite` messages. The underlying DWN does not process the given message until *after* the execution of the given `handler`, and in the event that the return is `false` then the underlying DWN will not process the message, which is to say store the message, and instead will immediately response to the requestor with an error code.

```typescript
app.inbound.records.write(
  async message => {
    const { descriptor: { protocol, schema }} = message;

    if (protocol === 'TBDEX' && schema === 'RFQ') {
      const response = await fetch(`/your/api/rfq`);
      return response.status === 200;
    }

    return false;
  }
);
```

`handler` - `(message: DwnMessage) => Promise<boolean>`
  - If the return is `true` then the given message will be processed (& stored)
  - Else if the return is `false` then the given message will **not** be processed (& stored) and will immediately respond to the requestor with an error code

## `App.outbound.post(path, handler)`

// TODO diagram

Method for defining an outbound HTTP POST API call.

```typescript
app.outbound.post('/api/something', async req => {
  const { targetDid, something } = await req.body.json();

  // returning this will send the DWN Message to the targetDid
  return { 
    targetDid,
    data: something
  };
});

app.outbound.post('/api/something-else', async req => {
  const somethingElse = await req.body.json();
  await someCustomMiddleware(somethingElse);
  // void return means no DWN Message is sent on
});
```

`path` - HTTP path 
`handler` - `(req) => Promise<void | Record>`
  - If return type is `void` then no DWN processing occurs neither is a subsequent DWN Message sent on
  - Else if the return type is `Record` then
    - The record is written to ones own DWN
    - The record is sent onwards (as a message) to the `targetDid`

## Project Resources

| Resource                                   | Description                                                                   |
| ------------------------------------------ | ----------------------------------------------------------------------------- |
| [CODEOWNERS](./CODEOWNERS)                 | Outlines the project lead(s)                                                  |
| [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md) | Expected behavior for project contributors, promoting a welcoming environment |
| [CONTRIBUTING.md](./CONTRIBUTING.md)       | Developer guide to build, test, run, access CI, chat, discuss, file issues    |
| [GOVERNANCE.md](./GOVERNANCE.md)           | Project governance                                                            |
| [LICENSE](./LICENSE)                       | Apache License, Version 2.0                                                   |