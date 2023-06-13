import http from 'http';

interface IRequestListener {
  (req: http.IncomingMessage, res: http.ServerResponse): Promise<void>;
}

export default class Http {
  static createServer = async (port: number, handler: IRequestListener): Promise<http.Server> => {
    const server = http.createServer(handler);
    await new Promise(resolve =>
      server.listen(port, 'localhost', () => resolve(undefined))
    );
    return server;
  };

  static readOctetStream = async (req: http.IncomingMessage): Promise<string | void> => {
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
}