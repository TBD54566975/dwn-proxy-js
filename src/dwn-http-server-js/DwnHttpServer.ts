import http from 'http';
import { DwnHttpServerOptions } from './types.js';
import { parseDwnRequest } from './utils.js';
import { Dwn, MessageStoreLevel, DataStoreLevel, EventLogLevel } from '@tbd54566975/dwn-sdk-js';

// TODO
//    let's use Express.js instead of the native http module
//    this way, the DwnHttpServer can support everything
//    Express.js supports as well

export class DwnHttpServer {
  #options: DwnHttpServerOptions;
  #dwn: Dwn;

  #listener = async (req, res) => {
    const dwnRequest = await parseDwnRequest(req);
    if (!dwnRequest) {
      if (this.#options.fallback) this.#options.fallback(req, res);
      else console.log('todo handle error response');
    } else {
      // todo what about overriding a RecordsQuery with your own record?
      let preProcessResult;
      if (this.#options.dwnProcess?.preProcess)
        preProcessResult = await this.#options.dwnProcess.preProcess(dwnRequest);

      if (!this.#options.dwnProcess?.disable && !preProcessResult.halt) {
        const result = await this.#dwn.processMessage('todo-did', dwnRequest.message, dwnRequest.data);
        console.log('dwn process result', result);
      }

      // todo postProcess should also receive the result of the dwn.processMessage()
      if (this.#options.dwnProcess?.postProcess)
        await this.#options.dwnProcess.postProcess(dwnRequest);

      console.log('todo respond to client');
    }
  };

  listen = async (port: number, options?: DwnHttpServerOptions) => {
    this.#options = options ?? {};

    this.#dwn = await Dwn.create({
      messageStore: new MessageStoreLevel({
        blockstoreLocation : `${this.#options.storagePrefix}/dwn-message-store`,
        indexLocation      : `${this.#options.storagePrefix}/dwn-message-index`
      }),
      dataStore: new DataStoreLevel({
        blockstoreLocation: `${this.#options.storagePrefix}/dwn-blockstore`
      }),
      eventLog: new EventLogLevel({
        location: `${this.#options.storagePrefix}/dwn-event-log`
      }) });

    const server = http.createServer(this.#listener);
    await new Promise(resolve =>
      server.listen(port, 'localhost', () => resolve(undefined))
    );
    console.log(`Listening for HTTP requests at http://localhost:${port}`);
  };
}