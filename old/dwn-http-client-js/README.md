# dwn-http-client-js

```typescript
import { DwnHttpClient } from '@tbd54566975/dwn-http-client-js'
import { RecordsWrite, SignatureInput } from '@tbd54566975/dwn-sdk-js'

const signatureInput: SignatureInput = {/* ... */} 
const client = new DwnHttpClient({
  signatureInput
})

const targetDid = '...'
const message = await RecordsWrite.create({
  data                        : Buffer.from(data, 'utf-8'),
  dataFormat                  : 'text/plain',
  authorizationSignatureInput : signature
})
await client.sendAsync(targetDid, message)
```

- do message validation 
- what's the difference between this and the UserAgent?
  - UserAgent is broader surface area?