# dwn-http-js

```typescript
import { DwnHttpServer } from '@tbd54566975/dwn-http-server-js'

const preProcess = async (message, data) => {
  // example: maybe do some custom validation
  if (data.something) return true
  return false // this will prevent processing and return error code to client
}

const postProcess = async (message, data) => {
  // example: maybe also send the message to your backend
  await fetch('/some/other/api', {
    method: 'POST',
    body: JSON.stringify({
      message,
      data
    })
  })
}

const server = new DwnHttpServer({
  parseFallback: async (req, res) => {}, // called in the case where a DWN message is failed to be parsed
  dwnProcessing: {
    disabled: false, // default false
    preProcess
    postProcess
  }
})

const PORT(3000)
server.listen()
```

- `DwnHttpServer` is an extension on an Express.js server, so developers can use any Express.js calls they would like as well
- do message validation here