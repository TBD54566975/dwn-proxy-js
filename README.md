# DWN Proxy

Making DWN integrations with traditional backend services easy.

⚠️ UNDER DEVELOPMENT ⚠️

`dwn-proxy-js` is a bidirectional proxy between [Decentralized Web Nodes](https://identity.foundation/decentralized-web-node/spec) and your web services.

![Intro diagram](./images/intro-diagram.png)

# Usage

At it's lightest, this package can act as a network router for DWM's. At it's heaviest, this package can be used to selectively abstract DWN-concepts from your web services. You have optionality as to the degree to which you differentiate across the two network interfaces.

```cli
npm install @tbd54566975/dwn-proxy-js
```

```typescript
import { Server, Matches } from "dwn-proxy-js"

const matches = new Matches()
matches.add({
  interface: '{DwnInterface}',
  method: '{DwnMethod}',
  handler: (message: DwnMessage): DwnMessage => {
    // some custom handler logic
  }
})

const matchesV2 = new Matches() //...???

Server.start(matches)
```

```typescript
interface Match {
  interface: DwnInterface;
  method: DwnMethod;
  did?: string; // this ought to be strongly typed
  handler?(req: Request): Request;
  destination: string; // url or DWN? or what?
}
```

![Process diagram](./images/process-diagram.png)

## Matching

...

## TODO design considerations

Two separate HTTP servers, with distinct port-bindings, one for inbound and the other for outbound. Therefore, network security topology can be configured distinctly. TODO is this truly necessary???

Single-tenant DID owner-operator. Meaning, inbound authorization is performed. ??? I don't think so

Should we be transport-agnostic? Which is to say, the `Your handler` would/could define the forward mechanism?

OpenAPI docs for the outbound API calls?

---

TODO: take more things from https://github.com/TBD54566975/dwn-relay/blob/main/docs/design-doc.md

## Project Resources

| Resource                                   | Description                                                                   |
| ------------------------------------------ | ----------------------------------------------------------------------------- |
| [CODEOWNERS](./CODEOWNERS)                 | Outlines the project lead(s)                                                  |
| [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md) | Expected behavior for project contributors, promoting a welcoming environment |
| [CONTRIBUTING.md](./CONTRIBUTING.md)       | Developer guide to build, test, run, access CI, chat, discuss, file issues    |
| [GOVERNANCE.md](./GOVERNANCE.md)           | Project governance                                                            |
| [LICENSE](./LICENSE)                       | Apache License, Version 2.0                                                   |