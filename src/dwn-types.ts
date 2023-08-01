import type { RecordsQueryMessage, RecordsWriteMessage, SignatureInput } from '@tbd54566975/dwn-sdk-js'

export type DwnMessage = RecordsQueryMessage | RecordsWriteMessage

export type DidStateWithSignatureInput = {
  id: string
  signatureInput: SignatureInput
}

