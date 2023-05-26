import HttpServer, { HttpRouter } from './http-server.js';

export class DwnProxyServer {
  httpServer: HttpServer;

  constructor(url: string) {
    this.httpServer = new HttpServer(url);
  }

  listen(router: HttpRouter) {
    this.httpServer.listen(router);
    // todo websockets
  }
}