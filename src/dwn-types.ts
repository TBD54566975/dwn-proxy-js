import type { Readable } from 'node:stream'
import type { MessageReply, RecordsQueryMessage, RecordsWriteMessage } from '@tbd54566975/dwn-sdk-js'

export type DwnMessage = RecordsQueryMessage | RecordsWriteMessage

export type DwnRequest = {
  target?: string,
  message: DwnMessage,
  data?: Readable
}

export type DwnResponse = {
  reply: MessageReply
  data?: Readable
}