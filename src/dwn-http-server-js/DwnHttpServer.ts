import http from 'http';
import { DwnHttpServerOptions } from './types.js';
import { parseDwnRequest } from './utils.js';
import { Encoder } from '@tbd54566975/dwn-sdk-js';

// TODO
//    let's use Express.js instead of the native http module
//    this way, the DwnHttpServer can support everything
//    Express.js supports as well

export interface IHttpRequestListener {
  (req: http.IncomingMessage, res: http.ServerResponse): Promise<void>;
}

const encodeMessageReply = (obj, code = 202) => ({
  result: {
    reply: {
      status: {
        code
      },
      entries: [
        {
          descriptor: {
            dataFormat: 'application/json'
          },
          encodedData: obj ? Encoder.stringToBase64Url(JSON.stringify(obj)) : undefined
        }
      ],
      record: {}
    }
  }
});

export class DwnHttpServer {
  #options: DwnHttpServerOptions;

  #listener: IHttpRequestListener = async (req, res) => {
    try {
      const dwnRequest = await parseDwnRequest(req);
      if (!dwnRequest) {
        if (this.#options.fallback) this.#options.fallback(req, res);
        else console.log('todo handle error response');
      } else {
      // todo what about overriding a RecordsQuery with your own record?
        let preProcessResult;
        if (this.#options.dwnProcess?.preProcess)
          preProcessResult = await this.#options.dwnProcess.preProcess(dwnRequest);

        const messageReply = preProcessResult?.reply ?? { hello: 'world' };

        if (!messageReply) {
          if (!this.#options.dwnProcess?.disable && !preProcessResult.halt) {
            console.log('todo call dwn.processMessage()');
          }

          // todo postProcess should also receive the result of the dwn.processMessage()
          if (this.#options.dwnProcess?.postProcess)
            await this.#options.dwnProcess.postProcess(dwnRequest);
        }

        res.setHeader('dwn-response', JSON.stringify(encodeMessageReply(messageReply)));
        res.statusCode = 200;
        res.end();
      }
    } catch (err) {
      console.error(err);
      res.statusCode = 500;
      res.end();
    }
  };

  listen = async (port: number, options?: DwnHttpServerOptions) => {
    this.#options = options ?? {};
    const server = http.createServer(this.#listener);
    await new Promise(resolve =>
      server.listen(port, '0.0.0.0', () => resolve(undefined))
    );
    console.log(`Listening for HTTP requests at http://0.0.0.0:${port}`);
  };
}