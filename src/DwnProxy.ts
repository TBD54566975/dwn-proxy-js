import { DwnHttpServer, IHttpRequestListener } from './dwn-http-server-js/DwnHttpServer.js';
import { Dwn } from './dwn-http-server-js/Dwn.js';
import url from 'url';
import { DwnHttpClient } from './dwn-http-client-js/DwnHttpClient.js';
import { DwnProxyOptions, IRecordsQuery, IRecordsWrite, IRestfulHandler } from './types.js';
import { generateDid } from './utils.js';
import { ProtocolDefinition, RecordsWrite } from '@tbd54566975/dwn-sdk-js';

export class DwnProxy {
  #options: DwnProxyOptions;

  #server: DwnHttpServer;
  #client: DwnHttpClient;

  #protocols: Array<ProtocolDefinition> = [];
  #recordsQuery: IRecordsQuery;
  #recordsWrite: IRecordsWrite;
  #posts: Array<IRestfulHandler> = [];

  dwn = {
    protocols: {
      configure: definition => this.#protocols.push(definition)
    },
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
      const halt = await this.#recordsWrite(dwnRequest.message, dwnRequest.data);
      return { halt };
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
        const intent = await restfulHandler.handler(req);
        if (intent) {
          const data = Buffer.from(JSON.stringify(intent.data), 'utf-8');
          const record = await RecordsWrite.create({
            published                   : true, // todo
            data                        ,
            dataFormat                  : 'application/json',
            authorizationSignatureInput : this.#options.didState.signatureInput,
            ...(intent.descriptors ?? {})
          });
          const result = await Dwn.processMessage(this.#options.didState.id, record.message, data);
          if (result.status.code === 202) {
            res.setHeader('dwn-record-id', record.message.recordId);
            if (intent.target)
              this.#client.send(intent.target, record.message);
          }
        }
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
    if (!this.#options.didState)
      this.#options.didState = await generateDid(this.#options.serviceEndpoint ?? `http://0.0.0.0:${port}`);

    for (const definition of this.#protocols)
      await Dwn.configureProtocol(this.#options.didState.id, definition, this.#options.didState.signatureInput);

    this.#client = new DwnHttpClient({
      signatureInput: this.#options.didState.signatureInput
    });

    this.#server = new DwnHttpServer();
    await this.#server.listen(port, {
      did        : this.#options.didState.id,
      fallback   : this.#outbound,
      dwnProcess : {
        preProcess: this.#inbound
      }
    });
  };
}