import http from 'http';

export interface IHttpHandler {
  (req: http.IncomingMessage, res: http.ServerResponse): void
}

export interface IHttpServer {
  listen: (
    port: number,
    handler: IHttpHandler) => void;
}

export class HttpServer {
  listen(port: number, handler: IHttpHandler) {
    const server = http.createServer(handler);

    server.listen(port, 'localhost', () => {
      console.log(`Server running at http://localhost:${port}/`);
    });
  }
}