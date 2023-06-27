import http from 'http'
import { DwnRequest } from './types.js'

export const readOctetStream = async (req: http.IncomingMessage): Promise<Buffer> => {
  const chunks: Buffer[] = []
  await new Promise((resolve, reject) => {
    req.on('data', (chunk: Buffer) => {
      chunks.push(chunk)
    })
    req.on('end', () => resolve(null))
    req.on('error', reject)
  })
  return Buffer.concat(chunks)
}


export const parseDwnRequest = async (req: http.IncomingMessage): Promise<DwnRequest | void> => {
  const raw = req.headers['dwn-request'] as string | void
  if (raw) {
    const jsonRpc = JSON.parse(raw)
    const { target, message } = jsonRpc.params
    const data = await readOctetStream(req)

    return {
      target,
      message,
      data
    }
  }
}