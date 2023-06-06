# DWN Proxy

Making DWN integrations with traditional backend services easy.

⚠️ UNDER DEVELOPMENT ⚠️

`dwn-proxy-js` is a bidirectional proxy between [Decentralized Web Nodes](https://identity.foundation/decentralized-web-node/spec) and your web services.

![Intro diagram](./images/intro.png)

# Usage

At it's lightest, this package can act as a network router for DWM's. At it's heaviest, this package can be used to selectively abstract DWN-concepts from your web services. You have optionality as to the degree to which you differentiate across the two network interfaces.

TODO: explain what DWN-specific things this does for you

```cli
npm install @tbd54566975/dwn-proxy-js
```

```typescript
import { App, Message } from '../src/main';
import fetch from 'some-http-tool';

const app = new App();

// simple inbound route
app.inbound.protocol.route('tbdex', 'offer', '/some/api/offer');

// inbound route with middleware
app.inbound.protocol.middleware(
  'tbdex',
  'rfq',
  message => {
    // do middleware things
    fetch('/some/api/rfq', { something: message.data.thing });
  }
);

// simple outbound route
app.outbound.post('/some/api/quote');

//outbound route with middleware
app.outbound.post('/some/api/status', (req, res) => {
  // do some middleware things
  const did = req.somewhere.did;
  Message.send('tbdex', 'status', did, { some: 'data' });
  res.status = 200;
  res.end();
});

const INBOUND_PORT = 3000;
const OUTBOUND_PORT = 3001;
app.listen(INBOUND_PORT, OUTBOUND_PORT);
```

## How It Works

![Inbound](./images/how-it-works.png)

## App.inbound

...

`App.inbound` is a place for you to define the inbound messages you support and where to route the requests to.

## App.outbound

...

## DWN Process

...??? protocol enforcement, data storage, auth, idk???

## Middleware

- Auth
- Request augmentation
- other things???

...

## Route

Right now, it's just HTTP fetch requests

...

## TODO design considerations

/**
 * - "I want a single port for both inbound and outbound"
 * - "I want automatic DWM formatting parsed for me"
 * - "I want a generic middleware which is called both inbound and outbound"
 * - "I want a generic middleware which is called for all inbounds"
 * - "I want a middleware which is called for a specific inbound route"
 * - "I want to use my own auth mechanism in the middleware"
 * - "I want my outbound request to assume the req is already as a DWM"
 * - "I want my inbound http requests to be auth'd with my auth solution"
 * - "I don't want to route a particular inbound message, and instead control the response"
 */

Intended to be server side applications

TODO think about examples

TODO: take more things from https://github.com/TBD54566975/dwn-relay/blob/main/docs/design-doc.md

## Project Resources

| Resource                                   | Description                                                                   |
| ------------------------------------------ | ----------------------------------------------------------------------------- |
| [CODEOWNERS](./CODEOWNERS)                 | Outlines the project lead(s)                                                  |
| [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md) | Expected behavior for project contributors, promoting a welcoming environment |
| [CONTRIBUTING.md](./CONTRIBUTING.md)       | Developer guide to build, test, run, access CI, chat, discuss, file issues    |
| [GOVERNANCE.md](./GOVERNANCE.md)           | Project governance                                                            |
| [LICENSE](./LICENSE)                       | Apache License, Version 2.0                                                   |