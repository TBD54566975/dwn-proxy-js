import Ajv from 'ajv'
import type { Readable } from 'node:stream'
import type { UnionMessageReply } from '@tbd54566975/dwn-sdk-js'
import type { DwnMessage } from './dwn-types.js'

export type DwnRequest = {
  target: string,
  message: DwnMessage,
  payload?: Readable | any
}

export type DwnResponse = {
  reply: UnionMessageReply
  payload?: Readable
}

const validator = new Ajv.default({
  allErrors : true,
  schemas   : {
    'dwn-request': {
      '$schema'    : 'http://json-schema.org/draft-07/schema#',
      'title'      : 'DWN Request',
      'type'       : 'object',
      'properties' : {
        'target': {
          'description' : 'The target DID',
          'type'        : 'string'
        },
        'message': { // todo this could be further defined
          'description' : 'The DWeb Message',
          'type'        : 'object'
        }
      },
      'required': ['target', 'message']
    }
  }
})

export const validateDwnRequestSchema = (dwnRequest: DwnRequest): Array<string> => {
  const validateFn = validator.getSchema('dwn-request')

  if (!validateFn) {
    throw Error('schema for dwn-request not found.')
  }

  validateFn(dwnRequest)

  if (!validateFn.errors)
    return []

  const errorMessages: Array<string> = []

  for (let error of validateFn.errors) {
    const jsonPath = error.instancePath ? `${error.instancePath}: ` : ''
    errorMessages.push(`${jsonPath}${error.message}`)
  }

  return errorMessages
}