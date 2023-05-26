# DWN Proxy

`dwn-proxy` is a bidirectional JSON-RPC proxy between [DWN Messages](https://identity.foundation/decentralized-web-node/spec/#messages) and traditional RESTful APIs.

The primary motivation behind this package is to streamline the ability for traditional back-end services that expose RESTful APIs to receive & send DWN messages (a.k.a DWeb Messages or a.k.a DWM's). The default behavior of this package is designed to prevent the leakage of DWN awareness or concepts into a downstream service.

TODO
- single-tenant
  - implies private key management
- maybe "handler" instead of "router"
- config file rather than code?
  - would be useful for non-js devs, if they wanted to use it as a distributable
  - why not both?
- auth
  - both inbound (handled by DWN default behavior?)
  - and outbound 
- is this a fully-compliant DWN or is it simply a pass-thru?
  - why not both?


There are actually two different approaches here
1. the package runs the actual servers
2. the package is merely a translational layer
...in both approaches, you could imagine the package still executes any dwn-specific processing (such as auth)


TODO: take more things from https://github.com/TBD54566975/dwn-relay/blob/main/docs/design-doc.md

TODO
```cli
npm install @tbd54566975/dwn-proxy@0.0.1
```

```mermaid
sequenceDiagram
  autonumber
  participant C as Client
  participant R as DWN Relay
  participant S as Downstream Service
  
  C->>R: DWeb Message
  R->>R: Integrity Checks
  R->>R: Lookup registered handlers
  R->>S: POST /${registered-handler}
  S->>S: Handle Request
  S->>R: HTTP Response
  R->>R: DWM'ify Response
  R->>C: DWMified response
```

## Project Resources

| Resource                                   | Description                                                                   |
| ------------------------------------------ | ----------------------------------------------------------------------------- |
| [CODEOWNERS](./CODEOWNERS)                 | Outlines the project lead(s)                                                  |
| [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md) | Expected behavior for project contributors, promoting a welcoming environment |
| [CONTRIBUTING.md](./CONTRIBUTING.md)       | Developer guide to build, test, run, access CI, chat, discuss, file issues    |
| [GOVERNANCE.md](./GOVERNANCE.md)           | Project governance                                                            |
| [LICENSE](./LICENSE)                       | Apache License, Version 2.0                                                   |