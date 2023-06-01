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
import { App } from '@tbd54566975/dwn-proxy-js';

/**
 * 1. DWN --> rfq --> PFI
 * 2. DWN <-- quote <-- PFI
 * 3. DWN --> accept --> PFI
 * 4. DWN <-- confirmed <-- PFI
 */

const app = new App();

/**
 * 1. DWN --> rfq --> PFI
 */
app.inbound.records.write({ protocol: 'tbdex', schema: 'rfq' }, (msg) => {
  console.log('New inbound message received for tbdex rfq', msg);
  // do middleware things
  return {
    path   : '/rfq',
    method : 'POST'
  };
});

/**
 * 2. DWN <-- quote <-- PFI
 */
app.outbound.post('/quote', (req, res) => {
  console.log('New outbound request received for /quote', req, res);
  // do middleware things
  return {
    descriptor: {
      protocol : 'tbdex',
      schema   : 'quote'
    }
  };
});

/**
 * 3. DWN --> accept --> PFI
 */
app.inbound.records.write({ protocol: 'tbdex', schema: 'accept' }, (msg) => {
  console.log('New inbound message received for tbdex accept', msg);
  // do middleware things
  return {
    path   : '/accept',
    method : 'POST'
  };
});

/**
 * 4. DWN <-- confirmed <-- PFI
 */
app.outbound.post('/confirmed', (req, res) => {
  console.log('New outbound request received for /confirmed', req, res);
  // do middleware things
  return {
    descriptor: {
      protocol : 'tbdex',
      schema   : 'confirmed'
    }
  };
});

//#region middlewares
app.use((req, _, next) => {
  console.log('New request recieved', req.path);
  next();
});
app.inbound.use((msg, next) => {
  console.log('New inbound message received', msg);
  next();
});
app.outbound.use((req, res, next) => {
  console.log('New outbound request received');
  next();
});
//#endregion

const INBOUND_PORT = 3000;
const OUTBOUND_PORT = 3001;
app.listen(INBOUND_PORT, OUTBOUND_PORT);
```

## How It Works

![Inbound](./images/how-it-works.png)

## DWN Process

...

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