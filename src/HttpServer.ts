import http from 'http';

class HttpServer {
  listen(port: number) {
    const server = http.createServer((req: http.IncomingMessage, res: http.ServerResponse) => {
      res.statusCode = 202;
      res.end();
    });

    server.listen(port, 'localhost', () => {
      console.log(`Server running at http://localhost:${port}/`);
    });
  }
}

export default HttpServer;