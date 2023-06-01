import http from 'http';
import { parseDwm } from './json-rpc.js';
import { DwnMessage } from './types.js';

export type HttpRouter = (message: DwnMessage) => string

class HttpServer {
  url: string;

  constructor(url: string) {
    this.url = url;
  }

  listen(router: HttpRouter) {
    const server = http.createServer((req: http.IncomingMessage, res: http.ServerResponse) => {
      const message = parseDwm(req.headers['dwn-request'] as string);

      const route = router(message);
      if (route) {
        console.log(route);
        console.log(message);
        console.log('do DWN things');
      } else {
        res.statusCode = 405;
      }

      res.end();
    });

    server.listen(3000, 'localhost', () => {
      console.log('Server running at http://localhost:3000/');
    });
  }
}

export default HttpServer;