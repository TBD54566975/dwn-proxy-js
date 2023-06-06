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
  listen = async (port: number, handler: IHttpHandler): Promise<void> => {
    const server = http.createServer(handler);

    return new Promise(resolve =>
      server.listen(port, 'localhost', () => resolve(undefined))
    );
  };
}