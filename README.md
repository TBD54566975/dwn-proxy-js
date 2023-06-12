# DWN Proxy

Making DWN integrations with traditional backend services easy.

⚠️ UNDER DEVELOPMENT ⚠️

`dwn-proxy-js` is a bidirectional proxy between [Decentralized Web Nodes](https://identity.foundation/decentralized-web-node/spec) and your web services.

![Intro diagram](./images/intro.png)

# Usage

At it's lightest, this package can act as a network router for DWN Message's. At it's heaviest, this package can be used to selectively abstract DWN-concepts from your web services. You have optionality as to the degree to which you differentiate across the two network interfaces.

Like the [`dwn-server`](https://github.com/TBD54566975/dwn-server), this package is intended to be used server-side, wherein DWN Messages are interfaced with via JSON-RPC (compatible with compatible with [`web5-js`](https://github.com/TBD54566975/web5-js)'s Agent interface). Also like [`dwn-server`](https://github.com/TBD54566975/dwn-server), this package uses the [`dwn-sdk-js`](https://github.com/TBD54566975/dwn-sdk-js) to implement a fully-featured DWN. However, unlike [`dwn-server`](https://github.com/TBD54566975/dwn-server), this package offers a programmatic interface for handling DWN Messages, both inbound and outbound, with the intent of .

---

TODO rather than being comprehensive, try to articulate how `dwn-proxy-js` should fit in relation to the existing `dwn-server`

*Note:* we should consider a different composition of projects.

(Consider `dwn-sdk-js` and `web5-js` remain as-is)

First, a set of npm packages, wherein the target user base is developers. The idea here being to build developer-tools for composability & extensibility.

- `dwn-json-rpc-js` uses `dwn-sdk-js` to implement a fully-featured DWN intended for server environments
  - *Note:* we could take it a step further and split out `json-rpc-js`
- `dwn-proxy-js` uses `dwn-json-rpc-js` to serve the DWN, but then offers programmatic interfaces to handle messages, with the intention of serving traditional backend (for example, also offering an outbound interface)

Second, a set of executables (command line applications), wherein the target user base is still developers, but the developer experience (DX) is not programmatic. Instead, the DX being developers directly execute the given artifact, and possibily configure.

- `dwn-server` a thin wrapper around `dwn-json-rpc-js` which stands as the reference implementation for a DWN interfaced over a network boundary
- `dwn-proxy` a thin wrapper around `dwn-proxy-js` which offers a default configuration and custom markup config syntax for defining the inbound and outbound handlers

Third, a set of applications, wherein the target user base is non-developers. The idea here being similar to the way in which [Bitcoin Core](https://bitcoin.org/en/download) is offered to users. That is, users download a DMG/ISO/etc. and run the application on their machine, optionally with a very basic GUI.

- `dwn-server-gui` uses `dwn-server` and implements a basic GUI, enabling the user to administrate and view their DWN
- `dwn-proxy-gui` uses `dwn-proxy` and implements a basic GUI, enabling the user to configure & monitor their proxy

*Note:* we should consider multi-tenant vs single-tenant product/service design and how that would fit into the above.

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