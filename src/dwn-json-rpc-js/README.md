# dwn-json-rpc-js

...

# `DwnServer`

```typescript
const preProcess: IProcess = (target, message, dataStream) => {
  console.log('Do some pre-processing stuff with the given DWN Request')
}
const server = DwnServer.create({
  preProcess
})
await server.listen()
```

# `DwnJsonRpc`

## `DwnJsonRpc.parseReq(req) => DwnRequest`

Parses an incoming request into a `DwnRequest`

## `DwnJsonRpc.createReq(...)`

...TODO consider