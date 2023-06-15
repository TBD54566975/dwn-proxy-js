# dwn-http-js

```typescript
import { 
  DwnHttpClient, 
  DwnHttpServer } from '@tbd54566975/dwn-http-js';

const client = new Client({
  signatureInput: {/* ... */}
})

const customValidation = async (message, data) => {
  if (data.something) return true;
  return false; // this will prevent processing and return error code to client
}

const sendSomewhereElse = async (message, data) => {
  const someOtherDid = '';
  await client.sendAsync(someOtherDid, message, data)
}

const server = new DwnHttpServer({
  parseFallback: async (req, res) => {}, // called in the case where a DWN message is failed to be parsed
  dwnProcessing: {
    disabled: false, // default false
    preProcess: customValidation, 
    postProcess: sendSomewhereElse,
  }
});

const PORT(3000);
server.listen();
```

- `DwnHttpServer` is an extension on an Express.js server, so developers can use any Express.js calls they would like as well