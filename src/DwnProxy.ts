import { DwnHttpServer, IHttpRequestListener } from './dwn-http-server-js/DwnHttpServer.js';
import url from 'url';
import { DwnHttpClient } from './dwn-http-client-js/DwnHttpClient.js';
import { DwnProxyOptions, IRecordsQuery, IRecordsWrite, IRestfulHandler } from './types.js';
import { generateSignatureInput } from './utils.js';

export class DwnProxy {
  #options: DwnProxyOptions;

  #server: DwnHttpServer;
  #client: DwnHttpClient;

  #recordsQuery: IRecordsQuery;
  #recordsWrite: IRecordsWrite;
  #posts: Array<IRestfulHandler> = [];

  dwn = {
    records: {
      query : handler => this.#recordsQuery = handler,
      write : handler => this.#recordsWrite = handler
    }
  };

  post = (path, handler) => this.#posts.push({ path, handler });

  #inbound = async dwnRequest => {
    const interfaceMethod = `${dwnRequest.message.descriptor.interface}${dwnRequest.message.descriptor.method}`;
    if (interfaceMethod === 'RecordsQuery') {
      const record = await this.#recordsQuery(dwnRequest.message);
      if (record) {
        return {}; // todo reply
      }
    } else if (interfaceMethod === 'RecordsWrite') {
      const isValid = await this.#recordsWrite(dwnRequest.message, dwnRequest.data);
      return { halt: !isValid };
    } else {
      console.error('Interface method not supported', interfaceMethod);
      return { halt: true };
    }
  };

  #outbound: IHttpRequestListener = async (req, res) => {
    try {
      const path = url.parse(req.url as string).pathname;
      const restfulHandler = this.#posts.find(x => x.path === path);

      if (!restfulHandler) {
        res.statusCode = 404;
      } else {
        const record = await restfulHandler.handler(req);
        if (record)
          this.#client.send('some-did', record);
        res.statusCode = 202;
      }
    } catch (err) {
      console.error(err);
      res.statusCode = 500;
    }

    res.end();
  };

  listen = async (port: number, options?: DwnProxyOptions) => {
    this.#options = options ?? {};

    // TODO this is temporary
    if (!this.#options.signatureInput)
      this.#options.signatureInput = await generateSignatureInput(this.#options.serviceEndpoint ?? `http://0.0.0.0:${port}`);

    this.#client = new DwnHttpClient({
      signatureInput: this.#options.signatureInput
    });

    this.#server = new DwnHttpServer();
    this.#server.listen(port, {
      fallback   : this.#outbound,
      dwnProcess : {
        preProcess: this.#inbound
      }
    });
  };
}