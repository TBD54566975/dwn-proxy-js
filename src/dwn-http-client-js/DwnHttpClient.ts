import { SignatureInput } from '@tbd54566975/dwn-sdk-js';
import { resolveEndpoint, createMessage, sendMessage } from './utils.js';

type DwnHttpClientOptions = {
  signatureInput: SignatureInput;
}

export class DwnHttpClient {
  #options: DwnHttpClientOptions;

  constructor(options: DwnHttpClientOptions) {
    this.#options = options;
  }

  send = async (did, record) => {
    // todo stuffed everything in utils.ts for now
    const endpoint = await resolveEndpoint(did);
    const recordsWriteMessage = await createMessage(this.#options.signatureInput, JSON.stringify(record));
    await sendMessage(endpoint, did, recordsWriteMessage);
  };
}