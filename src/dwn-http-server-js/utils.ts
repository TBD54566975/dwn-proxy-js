import http from 'http';
import { DwnRequest } from './types.js';

export const readOctetStream = async (req: http.IncomingMessage): Promise<string | void> => {
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

export const parseDwnRequest = async (req: http.IncomingMessage): Promise<DwnRequest | void> => {
  const raw = req.headers['dwn-request'] as string | void;
  if (raw) {
    const jsonRpc = JSON.parse(raw);
    const message = jsonRpc.params.message;
    const data = await readOctetStream(req);

    return {
      message,
      data
    };
  }
};