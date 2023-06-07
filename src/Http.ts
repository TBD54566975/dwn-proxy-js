import http from 'http';

export interface IHttpHandler {
  (req: http.IncomingMessage, res: http.ServerResponse): Promise<void>;
}

export interface IHttpServer {
  listen: (
    port: number,
    handler: IHttpHandler) => void;
}

export const createServer = async (port: number, handler: IHttpHandler): Promise<http.Server> => {
  const server = http.createServer(handler);

  await new Promise(resolve =>
    server.listen(port, 'localhost', () => resolve(undefined))
  );

  return server;
};

export const readOctetStream = async (req: http.IncomingMessage): Promise<string> => {
  let data = '';

  await new Promise((resolve, reject) => {
    req.on('data', chunk =>
      data += chunk.toString('utf8')
    );

    req.on('end', () => resolve(data));

    req.on('error', reject);
  });

  return data;
};